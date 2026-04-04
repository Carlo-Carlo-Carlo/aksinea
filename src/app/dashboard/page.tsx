import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { FolderOpen, Plus, BarChart3, ArrowUpDown } from "lucide-react";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Récupérer les dossiers
  const { data: dossiers } = await supabase
    .from("dossiers")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const nbDossiers = dossiers?.length || 0;
  const dossierIds = (dossiers || []).map((d) => d.id);

  let nbTitres = 0;
  let nbMouvementsMois = 0;

  // Stats par dossier
  const dossierStats: Record<string, { titres: number; mouvements: number; resultat: number }> = {};

  if (dossierIds.length > 0) {
    const { count: titresCount } = await supabase
      .from("titres")
      .select("id", { count: "exact", head: true })
      .in("dossier_id", dossierIds);

    nbTitres = titresCount || 0;

    const now = new Date();
    const debutMois = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const { count: mvtCount } = await supabase
      .from("mouvements")
      .select("id", { count: "exact", head: true })
      .in("dossier_id", dossierIds)
      .gte("created_at", debutMois);

    nbMouvementsMois = mvtCount || 0;

    // Titres par dossier
    const { data: titresParDossier } = await supabase
      .from("titres")
      .select("dossier_id")
      .in("dossier_id", dossierIds);

    // Mouvements par dossier
    const { data: mvtParDossier } = await supabase
      .from("mouvements")
      .select("dossier_id")
      .in("dossier_id", dossierIds);

    // Résultat cessions par dossier (exercice en cours)
    const debutAnnee = `${now.getFullYear()}-01-01`;
    const finAnnee = `${now.getFullYear()}-12-31`;
    const { data: cessionsParDossier } = await supabase
      .from("cessions")
      .select("dossier_id, plus_moins_value")
      .in("dossier_id", dossierIds)
      .gte("date_cession", debutAnnee)
      .lte("date_cession", finAnnee);

    // Agréger
    for (const id of dossierIds) {
      const titresCount = (titresParDossier || []).filter((t) => t.dossier_id === id).length;
      const mvtCount = (mvtParDossier || []).filter((m) => m.dossier_id === id).length;
      const resultat = (cessionsParDossier || [])
        .filter((c) => c.dossier_id === id)
        .reduce((sum, c) => sum + parseFloat(c.plus_moins_value || 0), 0);

      dossierStats[id] = { titres: titresCount, mouvements: mvtCount, resultat: Math.round(resultat * 100) / 100 };
    }
  }

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 mt-1">
            Vue d&apos;ensemble de vos dossiers clients
          </p>
        </div>
        <Link
          href="/dashboard/dossiers/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau dossier
        </Link>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Dossiers clients</p>
              <p className="text-2xl font-bold text-gray-900">{nbDossiers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Titres suivis</p>
              <p className="text-2xl font-bold text-gray-900">{nbTitres}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
              <ArrowUpDown className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Mouvements ce mois</p>
              <p className="text-2xl font-bold text-gray-900">{nbMouvementsMois}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des dossiers */}
      {nbDossiers === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun dossier client
          </h3>
          <p className="text-gray-500 mb-6">
            Créez votre premier dossier pour commencer le suivi des titres.
          </p>
          <Link
            href="/dashboard/dossiers/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Créer un dossier
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Dossiers récents
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {dossiers?.map((dossier) => {
              const stats = dossierStats[dossier.id] || { titres: 0, mouvements: 0, resultat: 0 };
              return (
                <Link
                  key={dossier.id}
                  href={`/dashboard/dossiers/${dossier.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center">
                      <FolderOpen className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{dossier.name}</p>
                      <p className="text-sm text-gray-500">
                        {dossier.siren ? `SIREN ${dossier.siren}` : "Pas de SIREN"}
                        {dossier.notes ? ` • ${dossier.notes}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-gray-400 text-xs">Titres</p>
                      <p className="font-medium text-gray-700">{stats.titres}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-xs">Mouvements</p>
                      <p className="font-medium text-gray-700">{stats.mouvements}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-xs">Résultat {new Date().getFullYear()}</p>
                      <p className={`font-medium ${stats.resultat >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {stats.resultat !== 0 ? (stats.resultat > 0 ? "+" : "") + formatCurrency(stats.resultat) : "—"}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
