import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";
import { DossierTabs } from "@/components/DossierTabs";

interface PageProps {
  params: { id: string };
}

export default async function DossierPage({ params }: PageProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user!.id)
    .single();

  // Récupérer le dossier
  const { data: dossier } = await supabase
    .from("dossiers")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user!.id)
    .single();

  if (!dossier) {
    notFound();
  }

  // Récupérer le portefeuille (vue)
  const { data: portefeuille } = await supabase
    .from("v_portefeuille")
    .select("*")
    .eq("dossier_id", dossier.id);

  // Récupérer les mouvements
  const { data: mouvements } = await supabase
    .from("mouvements")
    .select("*, titres(name, isin, type)")
    .eq("dossier_id", dossier.id)
    .order("date", { ascending: false });

  // Récupérer les cessions
  const { data: cessions } = await supabase
    .from("cessions")
    .select("*, titres(name, isin)")
    .eq("dossier_id", dossier.id)
    .order("date_cession", { ascending: false });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/dashboard/dossiers"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Dossiers
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{dossier.name}</h1>
          <p className="text-gray-500 mt-1">
            {dossier.siren ? `SIREN ${dossier.siren}` : ""}
            {dossier.siren && dossier.notes ? " • " : ""}
            {dossier.notes || ""}
          </p>
        </div>
        <Link
          href={`/dashboard/dossiers/${dossier.id}/settings`}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Settings className="w-4 h-4" />
          Paramètres
        </Link>
      </div>

      {/* Onglets */}
     <DossierTabs
        dossierId={dossier.id}
        portefeuille={portefeuille || []}
        mouvements={mouvements || []}
        cessions={cessions || []}
        userPlan={profile?.plan || "free"}
      />
    </div>
  );
}
