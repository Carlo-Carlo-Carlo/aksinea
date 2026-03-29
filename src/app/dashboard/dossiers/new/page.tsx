"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewDossierPage() {
  const [name, setName] = useState("");
  const [siren, setSiren] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Vous devez être connecté");
      setLoading(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("dossiers")
      .insert({
        user_id: user.id,
        name: name.trim(),
        siren: siren.trim() || null,
        notes: notes.trim() || null,
      })
      .select()
      .single();

    if (insertError) {
      setError("Erreur lors de la création du dossier");
      setLoading(false);
      return;
    }

    router.push(`/dashboard/dossiers/${data.id}`);
  };

  return (
    <div>
      <Link
        href="/dashboard/dossiers"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux dossiers
      </Link>

      <div className="max-w-xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Nouveau dossier client
        </h1>
        <p className="text-gray-500 mb-8">
          Créez un dossier pour suivre les titres d&apos;un client.
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-gray-200 p-6 space-y-5"
        >
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
              {error}
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
              placeholder="SCI Dupont, SA Martin Industries..."
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
              placeholder="123 456 789"
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
              placeholder="Notes sur le client, particularités..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Création..." : "Créer le dossier"}
            </button>
            <Link
              href="/dashboard/dossiers"
              className="px-6 py-2.5 text-gray-600 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
