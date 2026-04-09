"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";

export default function DossierSettingsPage() {
  const params = useParams();
  const dossierId = params.id as string;
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [siren, setSiren] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmDelete, setConfirmDelete] = useState("");
  const [regimeIs, setRegimeIs] = useState("pme");
  const [exerciceCloture, setExerciceCloture] = useState<string | null>(null);
  const [closingYear, setClosingYear] = useState(new Date().getFullYear().toString());
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("dossiers")
        .select("*")
        .eq("id", dossierId)
        .single();

      if (data) {
        setName(data.name);
        setSiren(data.siren || "");
        setNotes(data.notes || "");
        setExerciceCloture(data.exercice_cloture || null);
        setRegimeIs(data.regime_is || "pme");
      }
    }
    load();
  }, [dossierId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const { error: updateError } = await supabase
      .from("dossiers")
      .update({
        name: name.trim(),
        siren: siren.trim() || null,
        notes: notes.trim() || null,
        regime_is: regimeIs,
        updated_at: new Date().toISOString(),
      })
      .eq("id", dossierId);

    if (updateError) {
      setError("Erreur lors de la mise à jour");
    } else {
      setSuccess("Dossier mis à jour");
      setTimeout(() => setSuccess(""), 3000);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (confirmDelete !== name) return;
    setDeleting(true);

    const { error: deleteError } = await supabase
      .from("dossiers")
      .delete()
      .eq("id", dossierId);

    if (deleteError) {
      setError("Erreur lors de la suppression");
      setDeleting(false);
    } else {
      router.push("/dashboard/dossiers");
    }
  };

  return (
    <div>
      <Link
        href={`/dashboard/dossiers/${dossierId}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au dossier
      </Link>

      <div className="max-w-xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Paramètres du dossier
        </h1>

        {/* Modifier le dossier */}
        <form
          onSubmit={handleSave}
          className="bg-white rounded-xl border border-gray-200 p-6 space-y-5 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900">Informations</h2>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nom du client / dossier *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="siren"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              SIREN
              <span className="text-gray-400 font-normal"> (optionnel)</span>
            </label>
            <input
              id="siren"
              type="text"
              value={siren}
              onChange={(e) => setSiren(e.target.value)}
              maxLength={9}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Notes
              <span className="text-gray-400 font-normal"> (optionnel)</span>
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>

        {/* Clôture d'exercice */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Clôture d&apos;exercice</h2>
          <p className="text-sm text-gray-500 mb-4">
            Une fois un exercice clôturé, les mouvements antérieurs à la date de clôture
            ne peuvent plus être ajoutés ni supprimés. Cette action est irréversible.
          </p>

          {exerciceCloture && (
            <div className="bg-amber-50 text-amber-700 text-sm px-4 py-3 rounded-lg mb-4">
              Dernier exercice clôturé au {new Date(exerciceCloture).toLocaleDateString("fr-FR")}
            </div>
          )}

          <div className="flex items-center gap-3">
            <select
              value={closingYear}
              onChange={(e) => setClosingYear(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    Exercice {year}
                  </option>
                );
              })}
            </select>
            <button
              onClick={async () => {
                if (!confirm("Clôturer l'exercice " + closingYear + " ? Les mouvements jusqu'au 31/12/" + closingYear + " seront verrouillés. Cette action est irréversible.")) return;
                setClosing(true);
                const closeDate = closingYear + "-12-31";
                const { error: closeError } = await supabase
                  .from("dossiers")
                  .update({ exercice_cloture: closeDate })
                  .eq("id", dossierId);
                if (closeError) {
                  setError("Erreur lors de la clôture");
                } else {
                  setExerciceCloture(closeDate);
                  setSuccess("Exercice " + closingYear + " clôturé");
                  setTimeout(() => setSuccess(""), 3000);
                }
                setClosing(false);
              }}
              disabled={closing}
              className="px-4 py-2.5 bg-amber-600 text-white font-medium text-sm rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
            >
              {closing ? "Clôture..." : "Clôturer"}
            </button>
          </div>
        </div>
        {/* Zone danger : supprimer */}
        <div className="bg-white rounded-xl border border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-600 mb-2 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Zone de danger
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            La suppression est irréversible. Tous les titres, mouvements, lots FIFO
            et cessions associés à ce dossier seront définitivement supprimés.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tapez <span className="font-bold text-red-600">{name}</span> pour confirmer
              </label>
              <input
                type="text"
                value={confirmDelete}
                onChange={(e) => setConfirmDelete(e.target.value)}
                placeholder={name}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
              />
            </div>
            <button
              onClick={handleDelete}
              disabled={confirmDelete !== name || deleting}
              className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {deleting ? "Suppression..." : "Supprimer définitivement ce dossier"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
