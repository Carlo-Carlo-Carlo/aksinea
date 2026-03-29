import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { FolderOpen, Plus, Search } from "lucide-react";

export default async function DossiersPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: dossiers } = await supabase
    .from("dossiers")
    .select("*")
    .eq("user_id", user!.id)
    .order("name", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dossiers clients</h1>
          <p className="text-gray-500 mt-1">
            {dossiers?.length || 0} dossier{(dossiers?.length || 0) > 1 ? "s" : ""}
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

      {!dossiers || dossiers.length === 0 ? (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dossiers.map((dossier) => (
            <Link
              key={dossier.id}
              href={`/dashboard/dossiers/${dossier.id}`}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:border-primary-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FolderOpen className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {dossier.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {dossier.siren ? `SIREN ${dossier.siren}` : "Pas de SIREN"}
                  </p>
                  {dossier.notes && (
                    <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                      {dossier.notes}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
                Créé le{" "}
                {new Date(dossier.created_at).toLocaleDateString("fr-FR")}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
