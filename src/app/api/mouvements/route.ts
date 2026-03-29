import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = createClient();

  // Vérifier l'auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const { dossier_id, titre_id, date, type, quantite, prix_unitaire, frais } =
    body;

  // Validation basique
  if (!dossier_id || !titre_id || !date || !type || !quantite || prix_unitaire === undefined) {
    return NextResponse.json(
      { error: "Champs obligatoires manquants" },
      { status: 400 }
    );
  }

  // Vérifier que le dossier appartient à l'utilisateur
  const { data: dossier } = await supabase
    .from("dossiers")
    .select("id")
    .eq("id", dossier_id)
    .eq("user_id", user.id)
    .single();

  if (!dossier) {
    return NextResponse.json(
      { error: "Dossier introuvable" },
      { status: 404 }
    );
  }

  try {
    if (type === "achat") {
      return await handleAchat(supabase, {
        dossier_id,
        titre_id,
        date,
        quantite,
        prix_unitaire,
        frais: frais || 0,
      });
    } else if (type === "vente") {
      return await handleVente(supabase, {
        dossier_id,
        titre_id,
        date,
        quantite,
        prix_unitaire,
        frais: frais || 0,
      });
    } else {
      return NextResponse.json(
        { error: "Type doit être 'achat' ou 'vente'" },
        { status: 400 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

// ============================================
// ACHAT : créer mouvement + lot FIFO
// ============================================
async function handleAchat(
  supabase: any,
  data: {
    dossier_id: string;
    titre_id: string;
    date: string;
    quantite: number;
    prix_unitaire: number;
    frais: number;
  }
) {
  // 1. Créer le mouvement
  const { data: mouvement, error: mvtError } = await supabase
    .from("mouvements")
    .insert({
      dossier_id: data.dossier_id,
      titre_id: data.titre_id,
      date: data.date,
      type: "achat",
      quantite: data.quantite,
      prix_unitaire: data.prix_unitaire,
      frais: data.frais,
    })
    .select()
    .single();

  if (mvtError) {
    throw new Error("Erreur création mouvement: " + mvtError.message);
  }

  // 2. Créer le lot FIFO correspondant
  const fraisUnitaire = data.quantite > 0 ? data.frais / data.quantite : 0;

  const { error: lotError } = await supabase.from("lots_fifo").insert({
    dossier_id: data.dossier_id,
    titre_id: data.titre_id,
    mouvement_achat_id: mouvement.id,
    date_achat: data.date,
    quantite_initiale: data.quantite,
    quantite_restante: data.quantite,
    prix_unitaire: data.prix_unitaire,
    frais_unitaire: fraisUnitaire,
  });

  if (lotError) {
    throw new Error("Erreur création lot FIFO: " + lotError.message);
  }

  return NextResponse.json({
    success: true,
    mouvement_id: mouvement.id,
    type: "achat",
  });
}

// ============================================
// VENTE : créer mouvement + imputation FIFO
// ============================================
async function handleVente(
  supabase: any,
  data: {
    dossier_id: string;
    titre_id: string;
    date: string;
    quantite: number;
    prix_unitaire: number;
    frais: number;
  }
) {
  // 1. Récupérer les lots FIFO disponibles (triés par date croissante = FIFO)
  const { data: lots, error: lotsError } = await supabase
    .from("lots_fifo")
    .select("*")
    .eq("titre_id", data.titre_id)
    .eq("dossier_id", data.dossier_id)
    .gt("quantite_restante", 0)
    .order("date_achat", { ascending: true });

  if (lotsError) {
    throw new Error("Erreur récupération lots: " + lotsError.message);
  }

  // 2. Vérifier qu'on a assez de titres en stock
  const stockTotal = (lots || []).reduce(
    (sum: number, lot: any) => sum + parseFloat(lot.quantite_restante),
    0
  );

  if (stockTotal < data.quantite) {
    return NextResponse.json(
      {
        error: `Stock insuffisant. Vous avez ${stockTotal} titres en portefeuille mais tentez d'en vendre ${data.quantite}.`,
      },
      { status: 400 }
    );
  }

  // 3. Créer le mouvement de vente
  const { data: mouvement, error: mvtError } = await supabase
    .from("mouvements")
    .insert({
      dossier_id: data.dossier_id,
      titre_id: data.titre_id,
      date: data.date,
      type: "vente",
      quantite: data.quantite,
      prix_unitaire: data.prix_unitaire,
      frais: data.frais,
    })
    .select()
    .single();

  if (mvtError) {
    throw new Error("Erreur création mouvement: " + mvtError.message);
  }

  // 4. Imputation FIFO : consommer les lots du plus ancien au plus récent
  let quantiteRestante = data.quantite;
  const fraisVenteUnitaire = data.quantite > 0 ? data.frais / data.quantite : 0;
  const cessionsToInsert = [];

  for (const lot of lots) {
    if (quantiteRestante <= 0) break;

    const lotRestant = parseFloat(lot.quantite_restante);
    const qteImputee = Math.min(quantiteRestante, lotRestant);
    const coutUnitaireLot = parseFloat(lot.prix_unitaire) + parseFloat(lot.frais_unitaire);

    // Créer la ligne de cession
    cessionsToInsert.push({
      dossier_id: data.dossier_id,
      mouvement_vente_id: mouvement.id,
      lot_fifo_id: lot.id,
      titre_id: data.titre_id,
      date_cession: data.date,
      quantite: qteImputee,
      prix_achat_unitaire: coutUnitaireLot,
      prix_vente_unitaire: data.prix_unitaire,
      frais_vente_unitaire: fraisVenteUnitaire,
    });

    // Mettre à jour le lot FIFO (réduire la quantité restante)
    const nouvelleQte = lotRestant - qteImputee;
    const { error: updateError } = await supabase
      .from("lots_fifo")
      .update({ quantite_restante: nouvelleQte })
      .eq("id", lot.id);

    if (updateError) {
      throw new Error("Erreur mise à jour lot: " + updateError.message);
    }

    quantiteRestante -= qteImputee;
  }

  // 5. Insérer toutes les cessions
  if (cessionsToInsert.length > 0) {
    const { error: cessionsError } = await supabase
      .from("cessions")
      .insert(cessionsToInsert);

    if (cessionsError) {
      throw new Error("Erreur création cessions: " + cessionsError.message);
    }
  }

  // 6. Calculer le résultat total pour la réponse
  const resultatTotal = cessionsToInsert.reduce((sum, c) => {
    return sum + (c.prix_vente_unitaire - c.prix_achat_unitaire - c.frais_vente_unitaire) * c.quantite;
  }, 0);

  return NextResponse.json({
    success: true,
    mouvement_id: mouvement.id,
    type: "vente",
    nb_lots_imputes: cessionsToInsert.length,
    resultat_total: Math.round(resultatTotal * 100) / 100,
  });
}
