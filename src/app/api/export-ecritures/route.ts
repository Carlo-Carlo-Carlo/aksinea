import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dossierId = searchParams.get("dossier_id");
  const exercice = searchParams.get("exercice");

  if (!dossierId) {
    return NextResponse.json(
      { error: "dossier_id requis" },
      { status: 400 }
    );
  }

  // Vérifier propriété du dossier
  const { data: dossier } = await supabase
    .from("dossiers")
    .select("name")
    .eq("id", dossierId)
    .eq("user_id", user.id)
    .single();

  if (!dossier) {
    return NextResponse.json(
      { error: "Dossier introuvable" },
      { status: 404 }
    );
  }

  // Récupérer les mouvements d'achat
  let achatsQuery = supabase
    .from("mouvements")
    .select("*, titres(name, isin, compte_comptable)")
    .eq("dossier_id", dossierId)
    .eq("type", "achat")
    .order("date", { ascending: true });

  if (exercice) {
    achatsQuery = achatsQuery
      .gte("date", `${exercice}-01-01`)
      .lte("date", `${exercice}-12-31`);
  }

  const { data: achats } = await achatsQuery;

  // Récupérer les cessions
  let cessionsQuery = supabase
    .from("cessions")
    .select("*, titres(name, isin, compte_comptable)")
    .eq("dossier_id", dossierId)
    .order("date_cession", { ascending: true });

  if (exercice) {
    cessionsQuery = cessionsQuery
      .gte("date_cession", `${exercice}-01-01`)
      .lte("date_cession", `${exercice}-12-31`);
  }

  const { data: cessions } = await cessionsQuery;

  // Générer les écritures
  const ecritures: string[][] = [];

  // En-tête
  ecritures.push([
    "Date",
    "Journal",
    "N° Pièce",
    "Compte",
    "Libellé",
    "Débit",
    "Crédit",
  ]);

  let pieceNum = 1;

  // Écritures d'achat
  // Débit : compte titre (503/506/508) pour le montant HT
  // Débit : compte titre (503/506/508) pour les frais (ou 6271 si on sépare)
  // Crédit : 512 Banque pour le total
  if (achats) {
    for (const achat of achats) {
      const compte = achat.titres?.compte_comptable || "503";
      const nom = achat.titres?.name || "Titre";
      const montantTitres = achat.quantite * achat.prix_unitaire;
      const total = montantTitres + achat.frais;
      const dateStr = formatDate(achat.date);
      const piece = `AC${String(pieceNum).padStart(4, "0")}`;

      // Débit compte titre
      ecritures.push([
        dateStr,
        "OD",
        piece,
        compte,
        `Achat ${achat.quantite} ${nom}`,
        formatMontant(montantTitres),
        "",
      ]);

      // Débit frais si > 0
      if (achat.frais > 0) {
        ecritures.push([
          dateStr,
          "OD",
          piece,
          "6271",
          `Frais achat ${nom}`,
          formatMontant(achat.frais),
          "",
        ]);
      }

      // Crédit banque
      ecritures.push([
        dateStr,
        "OD",
        piece,
        "512",
        `Achat ${achat.quantite} ${nom}`,
        "",
        formatMontant(total),
      ]);

      pieceNum++;
    }
  }

  // Écritures de cession
  // On regroupe les cessions par mouvement de vente (une vente peut avoir plusieurs imputations FIFO)
  if (cessions && cessions.length > 0) {
    const ventesGrouped: Record<string, typeof cessions> = {};
    for (const c of cessions) {
      const key = c.mouvement_vente_id;
      if (!ventesGrouped[key]) ventesGrouped[key] = [];
      ventesGrouped[key].push(c);
    }

    for (const [venteId, lignesCession] of Object.entries(ventesGrouped)) {
      const premiere = lignesCession[0];
      const compte = premiere.titres?.compte_comptable || "503";
      const nom = premiere.titres?.name || "Titre";
      const dateStr = formatDate(premiere.date_cession);
      const piece = `CE${String(pieceNum).padStart(4, "0")}`;

      // Calculer les totaux de cette vente
      let qteTotale = 0;
      let valeurAchatTotale = 0;
      let valeurVenteTotale = 0;
      let fraisVenteTotaux = 0;

      for (const c of lignesCession) {
        const qte = parseFloat(c.quantite);
        qteTotale += qte;
        valeurAchatTotale += qte * parseFloat(c.prix_achat_unitaire);
        valeurVenteTotale += qte * parseFloat(c.prix_vente_unitaire);
        fraisVenteTotaux += qte * parseFloat(c.frais_vente_unitaire || 0);
      }

      const plusMoinsValue = valeurVenteTotale - valeurAchatTotale - fraisVenteTotaux;
      const prixVenteNet = valeurVenteTotale - fraisVenteTotaux;

      // Débit 512 Banque (produit de la vente net de frais)
      ecritures.push([
        dateStr,
        "OD",
        piece,
        "512",
        `Cession ${qteTotale} ${nom}`,
        formatMontant(prixVenteNet),
        "",
      ]);

      // Débit frais de cession si > 0
      if (fraisVenteTotaux > 0) {
        ecritures.push([
          dateStr,
          "OD",
          piece,
          "6271",
          `Frais cession ${nom}`,
          formatMontant(fraisVenteTotaux),
          "",
        ]);
      }

      // Crédit compte titre (valeur d'acquisition FIFO)
      ecritures.push([
        dateStr,
        "OD",
        piece,
        compte,
        `Sortie ${qteTotale} ${nom} (FIFO)`,
        "",
        formatMontant(valeurAchatTotale),
      ]);

      // Plus-value (crédit 767) ou Moins-value (débit 667)
      if (plusMoinsValue > 0) {
        ecritures.push([
          dateStr,
          "OD",
          piece,
          "767",
          `Plus-value cession ${nom}`,
          "",
          formatMontant(plusMoinsValue),
        ]);
      } else if (plusMoinsValue < 0) {
        ecritures.push([
          dateStr,
          "OD",
          piece,
          "667",
          `Moins-value cession ${nom}`,
          formatMontant(Math.abs(plusMoinsValue)),
          "",
        ]);
      }

      pieceNum++;
    }
  }

  // Générer le CSV avec séparateur point-virgule (standard français)
  const BOM = "\uFEFF";
  const csvContent =
    BOM +
    ecritures.map((row) => row.join(";")).join("\n");

  const filename = `ecritures_${dossier.name.replace(/\s+/g, "_")}_${exercice || "all"}.csv`;

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

function formatDate(date: string): string {
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()}`;
}

function formatMontant(n: number): string {
  return n.toFixed(2).replace(".", ",");
}
