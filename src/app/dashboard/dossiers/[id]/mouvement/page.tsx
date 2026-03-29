"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

interface Titre {
  id: string;
  name: string;
  isin: string | null;
  type: string;
  compte_comptable: string;
}

export default function MouvementPage() {
  const params = useParams();
  const dossierId = params.id as string;
  const router = useRouter();
  const supabase = createClient();

  // Form state
  const [type, setType] = useState<"achat" | "vente">("achat");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [titreId, setTitreId] = useState("");
  const [quantite, setQuantite] = useState("");
  const [prixUnitaire, setPrixUnitaire] = useState("");
  const [frais, setFrais] = useState("0");

  // New titre form
  const [showNewTitre, setShowNewTitre] = useState(false);
  const [newTitreName, setNewTitreName] = useState("");
  const [newTitreIsin, setNewTitreIsin] = useState("");
  const [newTitreType, setNewTitreType] = useState("action");
  const [newTitreCompte, setNewTitreCompte] = useState("503");

  // State
  const [titres, setTitres] = useState<Titre[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dossierName, setDossierName] = useState("");

  // Load existing titres
  useEffect(() => {
    async function load() {
      const { data: dossier } = await supabase
        .from("dossiers")
        .select("name")
        .eq("id", dossierId)
        .single();

      if (dossier) setDossierName(dossier.name);

      const { data } = await supabase
        .from("titres")
        .select("*")
        .eq("dossier_id", dossierId)
        .order("name");

      if (data) setTitres(data);
    }
    load();
  }, [dossierId]);

  // Compte comptable auto based on titre type
  const compteMap: Record<string, string> = {
    action: "503",
    obligation: "506",
    opcvm: "508",
    autre: "508",
  };

  const handleNewTitreTypeChange = (t: string) => {
    setNewTitreType(t);
    setNewTitreCompte(compteMap[t] || "508");
  };

  const handleCreateTitre = async () => {
    if (!newTitreName.trim()) return;

    const { data, error: insertError } = await supabase
      .from("titres")
      .insert({
        dossier_id: dossierId,
        name: newTitreName.trim(),
        isin: newTitreIsin.trim() || null,
        type: newTitreType,
        compte_comptable: newTitreCompte,
      })
      .select()
      .single();

    if (insertError) {
      setError("Erreur lors de la création du titre");
      return;
    }

    setTitres([...titres, data]);
    setTitreId(data.id);
    setShowNewTitre(false);
    setNewTitreName("");
    setNewTitreIsin("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!titreId) {
      setError("Veuillez sélectionner ou créer un titre");
      setLoading(false);
      return;
    }

    const qte = parseFloat(quantite);
    const prix = parseFloat(prixUnitaire);
    const fraisVal = parseFloat(frais) || 0;

    if (isNaN(qte) || qte <= 0) {
      setError("La quantité doit être supérieure à 0");
      setLoading(false);
      return;
    }

    if (isNaN(prix) || prix < 0) {
      setError("Le prix unitaire est invalide");
      setLoading(false);
      return;
    }

    // Call the FIFO engine API
    const response = await fetch("/api/mouvements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dossier_id: dossierId,
        titre_id: titreId,
        date,
        type,
        quantite: qte,
        prix_unitaire: prix,
        frais: fraisVal,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setError(result.error || "Erreur lors de l'enregistrement");
      setLoading(false);
      return;
    }

    router.push(`/dashboard/dossiers/${dossierId}`);
    router.refresh();
  };

  const montantTotal =
    (parseFloat(quantite) || 0) * (parseFloat(prixUnitaire) || 0) +
    (parseFloat(frais) || 0);

  return (
    <div>
      <Link
        href={`/dashboard/dossiers/${dossierId}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {dossierName || "Retour au dossier"}
      </Link>

      <div className="max-w-xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Nouveau mouvement
        </h1>
        <p className="text-gray-500 mb-8">
          Enregistrez un achat ou une vente de titres.
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

          {/* Type achat/vente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type d&apos;opération *
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setType("achat")}
                className={`flex-1 py-2.5 rounded-lg font-medium text-sm border transition-colors ${
                  type === "achat"
                    ? "bg-green-50 border-green-300 text-green-700"
                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                }`}
              >
                Achat
              </button>
              <button
                type="button"
                onClick={() => setType("vente")}
                className={`flex-1 py-2.5 rounded-lg font-medium text-sm border transition-colors ${
                  type === "vente"
                    ? "bg-red-50 border-red-300 text-red-700"
                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                }`}
              >
                Vente
              </button>
            </div>
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date *
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
            />
          </div>

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre *
            </label>
            {!showNewTitre ? (
              <div className="flex gap-2">
                <select
                  value={titreId}
                  onChange={(e) => setTitreId(e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors bg-white"
                >
                  <option value="">Sélectionner un titre...</option>
                  {titres.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                      {t.isin ? ` (${t.isin})` : ""}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewTitre(true)}
                  className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  Nouveau
                </button>
              </div>
            ) : (
              <div className="border border-primary-200 rounded-lg p-4 bg-primary-50/30 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Nom du titre *
                  </label>
                  <input
                    type="text"
                    value={newTitreName}
                    onChange={(e) => setNewTitreName(e.target.value)}
                    placeholder="Action TotalEnergies, Obligation BNP..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Code ISIN
                    </label>
                    <input
                      type="text"
                      value={newTitreIsin}
                      onChange={(e) => setNewTitreIsin(e.target.value)}
                      placeholder="FR0000120271"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Type
                    </label>
                    <select
                      value={newTitreType}
                      onChange={(e) =>
                        handleNewTitreTypeChange(e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
                    >
                      <option value="action">Action (503)</option>
                      <option value="obligation">Obligation (506)</option>
                      <option value="opcvm">OPCVM (508)</option>
                      <option value="autre">Autre (508)</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCreateTitre}
                    disabled={!newTitreName.trim()}
                    className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                  >
                    Créer le titre
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewTitre(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quantité + Prix */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="quantite"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Quantité *
              </label>
              <input
                id="quantite"
                type="number"
                step="any"
                min="0.01"
                value={quantite}
                onChange={(e) => setQuantite(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                placeholder="100"
              />
            </div>
            <div>
              <label
                htmlFor="prix"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Prix unitaire (€) *
              </label>
              <input
                id="prix"
                type="number"
                step="any"
                min="0"
                value={prixUnitaire}
                onChange={(e) => setPrixUnitaire(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                placeholder="55.00"
              />
            </div>
          </div>

          {/* Frais */}
          <div>
            <label
              htmlFor="frais"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Frais de transaction (€)
            </label>
            <input
              id="frais"
              type="number"
              step="any"
              min="0"
              value={frais}
              onChange={(e) => setFrais(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              placeholder="0.00"
            />
          </div>

          {/* Récap montant */}
          <div className="bg-gray-50 rounded-lg px-4 py-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Montant total</span>
              <span className="text-lg font-bold text-gray-900">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                }).format(montantTotal)}
              </span>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !titreId || !quantite || !prixUnitaire}
              className={`px-6 py-2.5 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                type === "achat"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {loading
                ? "Enregistrement..."
                : type === "achat"
                ? "Enregistrer l'achat"
                : "Enregistrer la vente"}
            </button>
            <Link
              href={`/dashboard/dossiers/${dossierId}`}
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
