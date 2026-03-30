import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
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

  // Récupérer le mouvement avec vérification de propriété
  const { data: mouvement } = await supabase
    .from("mouvements")
    .select("*, dossiers!inner(user_id)")
    .eq("id", mouvementId)
    .single();

  if (!mouvement || mouvement.dossiers.user_id !== user.id) {
    return NextResponse.json(
      { error: "Mouvement introuvable" },
      { status: 404 }
    );
  }

  const { dossier_id, titre_id } = mouvement;

  try {
    // 1. Supprimer toutes les cessions liées à ce titre dans ce dossier
    await supabase
      .from("cessions")
      .delete()
      .eq("dossier_id", dossier_id)
      .eq("titre_id", titre_id);

    // 2. Supprimer tous les lots FIFO de ce titre dans ce dossier
    await supabase
      .from("lots_fifo")
      .delete()
      .eq("dossier_id", dossier_id)
      .eq("titre_id", titre_id);

    // 3. Supprimer le mouvement ciblé
    await supabase.from("mouvements").delete().eq("id", mouvementId);

    // 4. Récupérer tous les mouvements restants de ce titre, triés par date
    const { data: mouvementsRestants } = await supabase
      .from("mouvements")
      .select("*")
      .eq("dossier_id", dossier_id)
      .eq("titre_id", titre_id)
      .order("date", { ascending: true })
      .order("created_at", { ascending: true });

    // 5. Rejouer tous les mouvements pour recalculer le FIFO
    if (mouvementsRestants && mouvementsRestants.length > 0) {
      for (const mvt of mouvementsRestants) {
        if (mvt.type === "achat") {
          const fraisUnitaire =
            mvt.quantite > 0 ? mvt.frais / mvt.quantite : 0;

          await supabase.from("lots_fifo").insert({
            dossier_id: mvt.dossier_id,
            titre_id: mvt.titre_id,
            mouvement_achat_id: mvt.id,
            date_achat: mvt.date,
            quantite_initiale: mvt.quantite,
            quantite_restante: mvt.quantite,
            prix_unitaire: mvt.prix_unitaire,
            frais_unitaire: fraisUnitaire,
          });
        } else if (mvt.type === "vente") {
          // Récupérer les lots disponibles
          const { data: lots } = await supabase
            .from("lots_fifo")
            .select("*")
            .eq("titre_id", mvt.titre_id)
            .eq("dossier_id", mvt.dossier_id)
            .gt("quantite_restante", 0)
            .order("date_achat", { ascending: true });

          if (!lots) continue;

          let qteRestante = parseFloat(mvt.quantite);
          const fraisVenteUnitaire =
            mvt.quantite > 0 ? mvt.frais / mvt.quantite : 0;

          for (const lot of lots) {
            if (qteRestante <= 0) break;

            const lotRestant = parseFloat(lot.quantite_restante);
            const qteImputee = Math.min(qteRestante, lotRestant);
            const coutUnitaireLot =
              parseFloat(lot.prix_unitaire) + parseFloat(lot.frais_unitaire);

            await supabase.from("cessions").insert({
              dossier_id: mvt.dossier_id,
              mouvement_vente_id: mvt.id,
              lot_fifo_id: lot.id,
              titre_id: mvt.titre_id,
              date_cession: mvt.date,
              quantite: qteImputee,
              prix_achat_unitaire: coutUnitaireLot,
              prix_vente_unitaire: mvt.prix_unitaire,
              frais_vente_unitaire: fraisVenteUnitaire,
            });

            await supabase
              .from("lots_fifo")
              .update({ quantite_restante: lotRestant - qteImputee })
              .eq("id", lot.id);

            qteRestante -= qteImputee;
          }
        }
      }
    }

    // 6. Si plus aucun mouvement pour ce titre, supprimer le titre
    const { count } = await supabase
      .from("mouvements")
      .select("id", { count: "exact", head: true })
      .eq("dossier_id", dossier_id)
      .eq("titre_id", titre_id);

    if (count === 0) {
      await supabase.from("titres").delete().eq("id", titre_id);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
