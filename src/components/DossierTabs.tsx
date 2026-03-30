"use client";

import { useState } from "react";
import {
  Briefcase,
  ArrowUpDown,
  Receipt,
  Plus,
  Upload,
  Download,
} from "lucide-react";
import Link from "next/link";

interface DossierTabsProps {
  dossierId: string;
  portefeuille: any[];
  mouvements: any[];
  cessions: any[];
}

export function DossierTabs({
  dossierId,
  portefeuille,
  mouvements,
  cessions,
}: DossierTabsProps) {
  const [activeTab, setActiveTab] = useState("portefeuille");

  const tabs = [
    {
      id: "portefeuille",
      label: "Portefeuille",
      icon: Briefcase,
      count: portefeuille.length,
    },
    {
      id: "mouvements",
      label: "Mouvements",
      icon: ArrowUpDown,
      count: mouvements.length,
    },
    {
      id: "cessions",
      label: "Cessions",
      icon: Receipt,
      count: cessions.length,
    },
  ];

  const formatNumber = (n: number) =>
    new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(n);

  return (
    <div>
      <div className="flex items-center justify-between border-b border-gray-200 mb-6">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span
                className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
                  activeTab === tab.id
                    ? "bg-primary-100 text-primary-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pb-2">
          <Link
            href={`/dashboard/dossiers/${dossierId}/mouvement`}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Mouvement
          </Link>
          <Link
            href={`/dashboard/dossiers/${dossierId}/import`}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Importer
          </Link>
          <button
            onClick={() => {
              window.location.href = "/api/export-ecritures?dossier_id=" + dossierId + "&exercice=" + new Date().getFullYear();
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Écritures
          </button>
        </div>
      </div>

      {activeTab === "portefeuille" && (
        <PortefeuilleTab portefeuille={portefeuille} formatCurrency={formatCurrency} formatNumber={formatNumber} />
      )}
      {activeTab === "mouvements" && (
        <MouvementsTab mouvements={mouvements} formatCurrency={formatCurrency} formatNumber={formatNumber} />
      )}
      {activeTab === "cessions" && (
        <CessionsTab cessions={cessions} formatCurrency={formatCurrency} formatNumber={formatNumber} />
      )}
    </div>
  );
}

function PortefeuilleTab({
  portefeuille,
  formatCurrency,
  formatNumber,
}: {
  portefeuille: any[];
  formatCurrency: (n: number) => string;
  formatNumber: (n: number) => string;
}) {
  if (portefeuille.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">
          Aucun titre en portefeuille. Ajoutez un mouvement d&apos;achat pour commencer.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Titre</th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
            <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Quantité</th>
            <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">PRU FIFO</th>
            <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Valeur d&apos;acquisition</th>
            <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Compte</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {portefeuille.map((row: any, i: number) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <p className="font-medium text-gray-900">{row.titre_name}</p>
                {row.isin && <p className="text-xs text-gray-400">{row.isin}</p>}
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-600 capitalize">{row.titre_type}</span>
              </td>
              <td className="px-6 py-4 text-right font-mono text-sm">{formatNumber(row.quantite_totale)}</td>
              <td className="px-6 py-4 text-right font-mono text-sm">{formatCurrency(row.pru_fifo)}</td>
              <td className="px-6 py-4 text-right font-mono text-sm font-medium">{formatCurrency(row.valeur_acquisition_totale)}</td>
              <td className="px-6 py-4 text-right text-sm text-gray-500">{row.compte_comptable}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MouvementsTab({
  mouvements,
  formatCurrency,
  formatNumber,
  dossierId,
}: {
  mouvements: any[];
  formatCurrency: (n: number) => string;
  formatNumber: (n: number) => string;
  dossierId: string;
}) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce mouvement ? Le calcul FIFO sera recalculé automatiquement.")) return;
    setDeleting(id);
    try {
      const res = await fetch("/api/mouvements/" + id, { method: "DELETE" });
      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de la suppression");
      }
    } catch {
      alert("Erreur réseau");
    }
    setDeleting(null);
  };

  if (mouvements.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <ArrowUpDown className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">
          Aucun mouvement enregistré. Ajoutez un achat ou une vente, ou importez un fichier.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Titre</th>
            <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Quantité</th>
            <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Prix unitaire</th>
            <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Frais</th>
            <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {mouvements.map((mvt: any) => (
            <tr key={mvt.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm">{new Date(mvt.date).toLocaleDateString("fr-FR")}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  mvt.type === "achat" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {mvt.type === "achat" ? "Achat" : "Vente"}
                </span>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm font-medium text-gray-900">{mvt.titres?.name}</p>
              </td>
              <td className="px-6 py-4 text-right font-mono text-sm">{formatNumber(mvt.quantite)}</td>
              <td className="px-6 py-4 text-right font-mono text-sm">{formatCurrency(mvt.prix_unitaire)}</td>
              <td className="px-6 py-4 text-right font-mono text-sm text-gray-500">{formatCurrency(mvt.frais)}</td>
              <td className="px-6 py-4 text-right font-mono text-sm font-medium">{formatCurrency(mvt.montant_total)}</td>
              <td className="px-4 py-4">
                <button
                  onClick={() => handleDelete(mvt.id)}
                  disabled={deleting === mvt.id}
                  className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                  title="Supprimer ce mouvement"
                >
                  {deleting === mvt.id ? "..." : "✕"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CessionsTab({
  cessions,
  formatCurrency,
  formatNumber,
}: {
  cessions: any[];
  formatCurrency: (n: number) => string;
  formatNumber: (n: number) => string;
}) {
  if (cessions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <Receipt className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">
          Aucune cession enregistrée. Les cessions apparaîtront ici après l&apos;enregistrement d&apos;une vente.
        </p>
      </div>
    );
  }

  const totalPV = cessions.reduce(
    (sum: number, c: any) => sum + (c.plus_moins_value > 0 ? c.plus_moins_value : 0),
    0
  );
  const totalMV = cessions.reduce(
    (sum: number, c: any) => sum + (c.plus_moins_value < 0 ? c.plus_moins_value : 0),
    0
  );
  const totalNet = totalPV + totalMV;

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-green-50 rounded-lg px-4 py-3">
          <p className="text-xs text-green-600 font-medium">Plus-values</p>
          <p className="text-lg font-bold text-green-700">{formatCurrency(totalPV)}</p>
        </div>
        <div className="bg-red-50 rounded-lg px-4 py-3">
          <p className="text-xs text-red-600 font-medium">Moins-values</p>
          <p className="text-lg font-bold text-red-700">{formatCurrency(totalMV)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-4 py-3">
          <p className="text-xs text-gray-600 font-medium">Résultat net</p>
          <p className={`text-lg font-bold ${totalNet >= 0 ? "text-green-700" : "text-red-700"}`}>
            {formatCurrency(totalNet)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Titre</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Quantité</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Prix achat (FIFO)</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Prix vente</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">+/- Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {cessions.map((c: any) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">{new Date(c.date_cession).toLocaleDateString("fr-FR")}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.titres?.name}</td>
                <td className="px-6 py-4 text-right font-mono text-sm">{formatNumber(c.quantite)}</td>
                <td className="px-6 py-4 text-right font-mono text-sm">{formatCurrency(c.prix_achat_unitaire)}</td>
                <td className="px-6 py-4 text-right font-mono text-sm">{formatCurrency(c.prix_vente_unitaire)}</td>
                <td className={`px-6 py-4 text-right font-mono text-sm font-medium ${
                  c.plus_moins_value >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {c.plus_moins_value >= 0 ? "+" : ""}{formatCurrency(c.plus_moins_value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
