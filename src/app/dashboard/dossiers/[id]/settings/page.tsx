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
