import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const mouvementId = params.id;
  const body = await request.json();
  const { date, quantite, prix_unitaire, frais } = body;

  // Récupérer le mouvement existant
  const { data: mouvement, error: fetchError } = await supabase
    .from("mouvements")
    .select("*, dossiers!inner(user_id, exercice_cloture)")
    .eq("id", mouvementId)
    .single();

  if (fetchError || !mouvement || mouvement.dossiers.user_id !== user.id) {
    return NextResponse.json(
      { error: "Mouvement introuvable" },
      { status: 404 }
    );
  }

  // Vérifier la clôture
  const cloture = mouvement.dossiers.exercice_cloture;
  if (cloture) {
    if (mouvement.date <= cloture) {
      return NextResponse.json(
        { error: "Impossible de modifier un mouvement sur un exercice clôturé" },
        { status: 400 }
      );
    }
    if (date && date <= cloture) {
      return NextResponse.json(
        { error: "Impossible de déplacer un mouvement vers un exercice clôturé" },
        { status: 400 }
      );
    }
  }

  const dossierId = mouvement.dossier_id;
  const titreId = mouvement.titre_id;
  const type = mouvement.type;
  const newDate = date || mouvement.date;
  const newQuantite = quantite !== undefined ? quantite : mouvement.quantite;
  const newPrix = prix_unitaire !== undefined ? prix_unitaire : mouvement.prix_unitaire;
  const newFrais = frais !== undefined ? frais : mouvement.frais;

  try {
    // 1. Supprimer cessions de ce titre
    await supabase.from("cessions").delete().eq("dossier_id", dossierId).eq("titre_id", titreId);

    // 2. Supprimer lots FIFO de ce titre
    await supabase.from("lots_fifo").delete().eq("dossier_id", dossierId).eq("titre_id", titreId);

    // 3. Supprimer le mouvement
    await supabase.from("mouvements").delete().eq("id", mouvementId);

    // 4. Recréer le mouvement avec les nouvelles valeurs
    const { error: insertError } = await supabase
      .from("mouvements")
      .insert({
        dossier_id: dossierId,
        titre_id: titreId,
        type: type,
        date: newDate,
        quantite: newQuantite,
        prix_unitaire: newPrix,
        frais: newFrais,
      });

    if (insertError) {
      return NextResponse.json({ error: "Erreur création: " + insertError.message }, { status: 500 });
    }

    // 5. Récupérer TOUS les mouvements de ce titre triés par date
    const { data: allMvts } = await supabase
      .from("mouvements")
      .select("*")
      .eq("dossier_id", dossierId)
      .eq("titre_id", titreId)
      .order("date", { ascending: true })
      .order("type", { ascending: true });

    // 6. Rejouer tous les mouvements pour reconstruire le FIFO
    if (allMvts) {
      for (const mvt of allMvts) {
        if (mvt.type === "achat") {
          const fraisUnit = parseFloat(mvt.quantite) > 0
            ? parseFloat(mvt.frais) / parseFloat(mvt.quantite)
            : 0;

          const { error: lotErr } = await supabase.from("lots_fifo").insert({
            dossier_id: mvt.dossier_id,
            titre_id: mvt.titre_id,
            mouvement_achat_id: mvt.id,
            date_achat: mvt.date,
            quantite_initiale: mvt.quantite,
            quantite_restante: mvt.quantite,
            prix_unitaire: mvt.prix_unitaire,
            frais_unitaire: fraisUnit,
          });

          if (lotErr) {
            return NextResponse.json({ error: "Erreur lot FIFO: " + lotErr.message }, { status: 500 });
          }
        } else if (mvt.type === "vente") {
          const { data: lots } = await supabase
            .from("lots_fifo")
            .select("*")
            .eq("titre_id", mvt.titre_id)
            .eq("dossier_id", mvt.dossier_id)
            .gt("quantite_restante", 0)
            .order("date_achat", { ascending: true });

          if (!lots) continue;

          let qteRestante = parseFloat(mvt.quantite);
          const fraisVU = parseFloat(mvt.quantite) > 0
            ? parseFloat(mvt.frais) / parseFloat(mvt.quantite)
            : 0;

          for (const lot of lots) {
            if (qteRestante <= 0) break;
            const lotRestant = parseFloat(lot.quantite_restante);
            const qteImputee = Math.min(qteRestante, lotRestant);
            const coutUnitLot = parseFloat(lot.prix_unitaire) + parseFloat(lot.frais_unitaire);

            const { error: cessErr } = await supabase.from("cessions").insert({
              dossier_id: mvt.dossier_id,
              mouvement_vente_id: mvt.id,
              lot_fifo_id: lot.id,
              titre_id: mvt.titre_id,
              date_cession: mvt.date,
              quantite: qteImputee,
              prix_achat_unitaire: coutUnitLot,
              prix_vente_unitaire: parseFloat(mvt.prix_unitaire),
              frais_vente_unitaire: fraisVU,
            });

            if (cessErr) {
              return NextResponse.json({ error: "Erreur cession: " + cessErr.message }, { status: 500 });
            }

            await supabase
              .from("lots_fifo")
              .update({ quantite_restante: lotRestant - qteImputee })
              .eq("id", lot.id);

            qteRestante -= qteImputee;
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
