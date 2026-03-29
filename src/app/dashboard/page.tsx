import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { FolderOpen, Plus, TrendingUp, TrendingDown } from "lucide-react";

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

      {/* Stats */}
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
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Plus-values (exercice)</p>
              <p className="text-2xl font-bold text-gray-900">—</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Moins-values (exercice)</p>
              <p className="text-2xl font-bold text-gray-900">—</p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des dossiers récents */}
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
            {dossiers?.map((dossier) => (
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
                      {dossier.siren
                        ? `SIREN ${dossier.siren}`
                        : "Pas de SIREN"}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-400">
                  {new Date(dossier.created_at).toLocaleDateString("fr-FR")}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
