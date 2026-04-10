"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Briefcase,
  ArrowUpDown,
  Receipt,
  Plus,
  Upload,
  Download,
  FileText,
  History,
} from "lucide-react";
import Link from "next/link";

interface DossierTabsProps {
  dossierId: string;
  portefeuille: any[];
  mouvements: any[];
  cessions: any[];
  titres?: any[];
  userPlan?: string;
  regimeIs?: string;
}

export function DossierTabs({
  dossierId,
  portefeuille,
  mouvements,
  cessions,
  titres = [],
  userPlan = "free",
  regimeIs = "pme",
}: DossierTabsProps) {
  const [activeTab, setActiveTab] = useState("portefeuille");
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

  const tabs = [
    { id: "portefeuille", label: "Portefeuille", icon: Briefcase, count: portefeuille.length },
    { id: "mouvements", label: "Mouvements", icon: ArrowUpDown, count: mouvements.length },
    { id: "cessions", label: "Cessions", icon: Receipt, count: cessions.length },
    { id: "synthese", label: "Synthèse fiscale", icon: FileText, count: null },
    { id: "historique", label: "Historique", icon: History, count: null },
  ];

  const formatNumber = (n: number) =>
    new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

  return (
    <div>
      <div className="flex items-center justify-between border-b border-gray-200 mb-6">
        <div className="flex gap-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 md:px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count !== null && (
                <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
                  activeTab === tab.id ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-2 pb-2">
          <Link
            href={`/dashboard/dossiers/${dossierId}/mouvement`}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Mouvement</span>
          </Link>
          <Link
            href={`/dashboard/dossiers/${dossierId}/import`}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Importer</span>
          </Link>
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden">
            <input
              id="date-from"
              type="date"
              defaultValue={new Date().getFullYear() + "-01-01"}
              className="px-2 py-2 text-sm text-gray-600 bg-white border-none outline-none w-32"
            />
            <span className="text-sm text-gray-400">→</span>
            <input
              id="date-to"
              type="date"
              defaultValue={new Date().getFullYear() + "-12-31"}
              className="px-2 py-2 text-sm text-gray-600 bg-white border-none outline-none w-32"
            />
            <button
              onClick={() => {
                if (userPlan === "free") {
                  alert("L'export des écritures est réservé au plan Pro. Rendez-vous dans votre profil pour upgrader.");
                  return;
                }
                const from = (document.getElementById("date-from") as HTMLInputElement).value;
                const to = (document.getElementById("date-to") as HTMLInputElement).value;
                window.location.href = "/api/export-ecritures?dossier_id=" + dossierId + "&from=" + from + "&to=" + to;
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors border-l border-gray-200"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Écritures</span>
              {userPlan === "free" && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Pro</span>}
            </button>
          </div>
        </div>
      </div>

      {activeTab === "portefeuille" && (
        <PortefeuilleTab portefeuille={portefeuille} formatCurrency={formatCurrency} formatNumber={formatNumber} />
      )}
      {activeTab === "mouvements" && (
        <MouvementsTab mouvements={mouvements} formatCurrency={formatCurrency} formatNumber={formatNumber} deleting={deleting} onDelete={handleDelete} />
      )}
      {activeTab === "cessions" && (
        <CessionsTab cessions={cessions} formatCurrency={formatCurrency} formatNumber={formatNumber} />
      )}
      {activeTab === "synthese" && (
        <SyntheseFiscaleTab portefeuille={portefeuille} cessions={cessions} titres={titres} formatCurrency={formatCurrency} formatNumber={formatNumber} userPlan={userPlan} regimeIs={regimeIs} />
      )}
      {activeTab === "historique" && (
        <HistoriqueTab dossierId={dossierId} formatCurrency={formatCurrency} userPlan={userPlan} />
      )}
    </div>
  );
}

function PortefeuilleTab({ portefeuille, formatCurrency, formatNumber }: { portefeuille: any[]; formatCurrency: (n: number) => string; formatNumber: (n: number) => string }) {
  if (portefeuille.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Aucun titre en portefeuille. Ajoutez un mouvement d&apos;achat pour commencer.</p>
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
            <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Régime fiscal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {portefeuille.map((row: any, i: number) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <p className="font-medium text-gray-900">{row.titre_name}</p>
                {row.isin && <p className="text-xs text-gray-400">{row.isin}</p>}
              </td>
              <td className="px-6 py-4"><span className="text-sm text-gray-600 capitalize">{row.titre_type}</span></td>
              <td className="px-6 py-4 text-right font-mono text-sm">{formatNumber(row.quantite_totale)}</td>
              <td className="px-6 py-4 text-right font-mono text-sm">{formatCurrency(row.pru_fifo)}</td>
              <td className="px-6 py-4 text-right font-mono text-sm font-medium">{formatCurrency(row.valeur_acquisition_totale)}</td>
              <td className="px-6 py-4 text-right text-sm text-gray-500">{row.compte_comptable}</td>
              <td className="px-6 py-4 text-right">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  row.regime_fiscal === "opcvm_taxable" ? "bg-red-100 text-red-700" :
                  row.regime_fiscal === "opcvm_actions_90" ? "bg-green-100 text-green-700" :
                  row.regime_fiscal === "fcpr_fcpi_fip" ? "bg-green-100 text-green-700" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  {row.regime_fiscal === "standard" ? "Standard" :
                   row.regime_fiscal === "opcvm_taxable" ? "OPCVM taxable" :
                   row.regime_fiscal === "opcvm_actions_90" ? "OPCVM 90%+" :
                   row.regime_fiscal === "fcpr_fcpi_fip" ? "FCPR/FCPI/FIP" : "—"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MouvementsTab({ mouvements, formatCurrency, formatNumber, deleting, onDelete }: { mouvements: any[]; formatCurrency: (n: number) => string; formatNumber: (n: number) => string; deleting: string | null; onDelete: (id: string) => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editQuantite, setEditQuantite] = useState("");
  const [editPrix, setEditPrix] = useState("");
  const [editFrais, setEditFrais] = useState("");
  const [saving, setSaving] = useState(false);

  const startEdit = (mvt: any) => {
    setEditingId(mvt.id);
    setEditDate(mvt.date);
    setEditQuantite(String(mvt.quantite));
    setEditPrix(String(mvt.prix_unitaire));
    setEditFrais(String(mvt.frais));
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/mouvements/" + id + "/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: editDate,
          quantite: parseFloat(editQuantite),
          prix_unitaire: parseFloat(editPrix),
          frais: parseFloat(editFrais) || 0,
        }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de la modification");
      }
    } catch {
      alert("Erreur réseau");
    }
    setSaving(false);
  };

  if (mouvements.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <ArrowUpDown className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Aucun mouvement enregistré. Ajoutez un achat ou une vente, ou importez un fichier.</p>
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
            <th className="px-4 py-3 w-20"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {mouvements.map((mvt: any) => {
            const isEditing = editingId === mvt.id;

            if (isEditing) {
              return (
                <tr key={mvt.id} className="bg-primary-50/30">
                  <td className="px-6 py-3">
                    <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      mvt.type === "achat" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {mvt.type === "achat" ? "Achat" : "Vente"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{mvt.titres?.name}</td>
                  <td className="px-6 py-3">
                    <input type="number" step="any" value={editQuantite} onChange={(e) => setEditQuantite(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-right focus:ring-2 focus:ring-primary-500 outline-none" />
                  </td>
                  <td className="px-6 py-3">
                    <input type="number" step="any" value={editPrix} onChange={(e) => setEditPrix(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-right focus:ring-2 focus:ring-primary-500 outline-none" />
                  </td>
                  <td className="px-6 py-3">
                    <input type="number" step="any" value={editFrais} onChange={(e) => setEditFrais(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-right focus:ring-2 focus:ring-primary-500 outline-none" />
                  </td>
                  <td className="px-6 py-3 text-right font-mono text-sm text-gray-400">—</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => saveEdit(mvt.id)} disabled={saving}
                        className="text-green-600 hover:text-green-800 text-sm font-medium disabled:opacity-50">
                        {saving ? "..." : "OK"}
                      </button>
                      <button onClick={cancelEdit}
                        className="text-gray-400 hover:text-gray-600 text-sm">
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }

            return (
              <tr key={mvt.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">{new Date(mvt.date).toLocaleDateString("fr-FR")}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    mvt.type === "achat" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {mvt.type === "achat" ? "Achat" : "Vente"}
                  </span>
                </td>
                <td className="px-6 py-4"><p className="text-sm font-medium text-gray-900">{mvt.titres?.name}</p></td>
                <td className="px-6 py-4 text-right font-mono text-sm">{formatNumber(mvt.quantite)}</td>
                <td className="px-6 py-4 text-right font-mono text-sm">{formatCurrency(mvt.prix_unitaire)}</td>
                <td className="px-6 py-4 text-right font-mono text-sm text-gray-500">{formatCurrency(mvt.frais)}</td>
                <td className="px-6 py-4 text-right font-mono text-sm font-medium">{formatCurrency(mvt.montant_total)}</td>
                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(mvt)} title="Modifier ce mouvement"
                      className="text-gray-400 hover:text-primary-600 transition-colors">
                      ✎
                    </button>
                    <button onClick={() => onDelete(mvt.id)} disabled={deleting === mvt.id}
                      className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50" title="Supprimer ce mouvement">
                      {deleting === mvt.id ? "..." : "✕"}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
function CessionsTab({ cessions, formatCurrency, formatNumber }: { cessions: any[]; formatCurrency: (n: number) => string; formatNumber: (n: number) => string }) {
  if (cessions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <Receipt className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Aucune cession enregistrée. Les cessions apparaîtront ici après l&apos;enregistrement d&apos;une vente.</p>
      </div>
    );
  }

  const totalPV = cessions.reduce((sum: number, c: any) => sum + (c.plus_moins_value > 0 ? c.plus_moins_value : 0), 0);
  const totalMV = cessions.reduce((sum: number, c: any) => sum + (c.plus_moins_value < 0 ? c.plus_moins_value : 0), 0);
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
          <p className={`text-lg font-bold ${totalNet >= 0 ? "text-green-700" : "text-red-700"}`}>{formatCurrency(totalNet)}</p>
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
                <td className={`px-6 py-4 text-right font-mono text-sm font-medium ${c.plus_moins_value >= 0 ? "text-green-600" : "text-red-600"}`}>
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

function SyntheseFiscaleTab({ portefeuille, cessions, titres, formatCurrency, formatNumber, userPlan, regimeIs = "pme" }: { portefeuille: any[]; cessions: any[]; titres: any[]; formatCurrency: (n: number) => string; formatNumber: (n: number) => string; userPlan: string; regimeIs?: string }) {
  const calculateIS = (resultat: number): number => {
    if (resultat <= 0) return 0;
    if (regimeIs === "pme") {
      if (resultat <= 42500) {
        return resultat * 0.15;
      } else {
        return 42500 * 0.15 + (resultat - 42500) * 0.25;
      }
    }
    return resultat * 0.25;
  };

  const isLabel = regimeIs === "pme" ? "IS PME (15% / 25%)" : "IS (25%)";
  if (userPlan === "free") {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-900 font-medium mb-2">Synthèse fiscale</p>
        <p className="text-gray-500 mb-4">Cette fonctionnalité est réservée au plan Pro.</p>
        <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">Pro</span>
      </div>
    );
  }

  const regimeLabels: Record<string, string> = {
    standard: "Titres standard (actions, obligations)",
    opcvm_taxable: "OPCVM taxables (écarts latents imposés)",
    opcvm_actions_90: "OPCVM actions 90%+ (exemptés)",
    fcpr_fcpi_fip: "FCPR / FCPI / FIP (exemptés)",
  };

  const regimeColors: Record<string, string> = {
    standard: "bg-gray-50 border-gray-200",
    opcvm_taxable: "bg-red-50 border-red-200",
    opcvm_actions_90: "bg-green-50 border-green-200",
    fcpr_fcpi_fip: "bg-green-50 border-green-200",
  };

  const regimeBadgeColors: Record<string, string> = {
    standard: "bg-gray-100 text-gray-700",
    opcvm_taxable: "bg-red-100 text-red-700",
    opcvm_actions_90: "bg-green-100 text-green-700",
    fcpr_fcpi_fip: "bg-green-100 text-green-700",
  };

  const regimeDescriptions: Record<string, string> = {
    standard: "Plus-values imposées uniquement lors de la cession effective. Pas d'écart latent à déclarer.",
    opcvm_taxable: "Les écarts de valeur liquidative (plus ET moins-values latentes) doivent être intégrés au résultat fiscal chaque année (art. 209-0 A CGI).",
    opcvm_actions_90: "Exemptés de la taxation annuelle des écarts latents car investis à 90%+ en actions.",
    fcpr_fcpi_fip: "Exemptés de la taxation annuelle des écarts latents.",
  };

  const regimes = ["standard", "opcvm_taxable", "opcvm_actions_90", "fcpr_fcpi_fip"];
  const currentYear = new Date().getFullYear();

  const synthese = regimes.map((regime) => {
    const titresInRegime = portefeuille.filter((p: any) => (p.regime_fiscal || "standard") === regime);
    const cessionsInRegime = cessions.filter((c: any) => {
      const titreMeta = titres.find((t: any) => t.id === c.titre_id);
      return (titreMeta?.regime_fiscal || "standard") === regime;
    });

    const cessionsThisYear = cessionsInRegime.filter((c: any) => new Date(c.date_cession).getFullYear() === currentYear);

    const nbTitres = titresInRegime.length;
    const valeurAcquisition = titresInRegime.reduce((sum: number, p: any) => sum + parseFloat(p.valeur_acquisition_totale || 0), 0);
    const pvRealisees = cessionsThisYear.reduce((sum: number, c: any) => sum + (c.plus_moins_value > 0 ? parseFloat(c.plus_moins_value) : 0), 0);
    const mvRealisees = cessionsThisYear.reduce((sum: number, c: any) => sum + (c.plus_moins_value < 0 ? parseFloat(c.plus_moins_value) : 0), 0);
    const resultatNet = pvRealisees + mvRealisees;

    return { regime, nbTitres, valeurAcquisition, pvRealisees, mvRealisees, resultatNet, hasTitres: nbTitres > 0 || cessionsThisYear.length > 0 };
  });

  const syntheseActive = synthese.filter((s) => s.hasTitres);
  const totalResultat = synthese.reduce((sum, s) => sum + s.resultatNet, 0);
  const totalValeur = synthese.reduce((sum, s) => sum + s.valeurAcquisition, 0);

  return (
    <div className="space-y-6">
      {/* Résumé global */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Valeur d&apos;acquisition totale en portefeuille</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValeur)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Résultat net des cessions {currentYear}</p>
          <p className={`text-2xl font-bold ${totalResultat >= 0 ? "text-green-700" : "text-red-700"}`}>
            {totalResultat !== 0 ? (totalResultat > 0 ? "+" : "") + formatCurrency(totalResultat) : "—"}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Estimation {isLabel}</p>
          <p className="text-2xl font-bold text-gray-900">
            {totalResultat > 0 ? formatCurrency(calculateIS(totalResultat)) : "—"}
          </p>
          <p className="text-xs text-gray-400 mt-1">À titre indicatif — modifiable dans Paramètres</p>
        </div>
      </div>

      {/* Détail par régime */}
      {syntheseActive.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Aucun titre en portefeuille. Ajoutez des mouvements pour voir la synthèse fiscale.</p>
        </div>
      ) : (
        syntheseActive.map((s) => (
          <div key={s.regime} className={`rounded-xl border p-6 ${regimeColors[s.regime]}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{regimeLabels[s.regime]}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${regimeBadgeColors[s.regime]}`}>
                    {s.nbTitres} titre{s.nbTitres > 1 ? "s" : ""}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{regimeDescriptions[s.regime]}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Valeur d&apos;acquisition</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(s.valeurAcquisition)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Plus-values réalisées {currentYear}</p>
                <p className="text-lg font-semibold text-green-600">{s.pvRealisees > 0 ? "+" + formatCurrency(s.pvRealisees) : "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Moins-values réalisées {currentYear}</p>
                <p className="text-lg font-semibold text-red-600">{s.mvRealisees < 0 ? formatCurrency(s.mvRealisees) : "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Résultat net {currentYear}</p>
                <p className={`text-lg font-semibold ${s.resultatNet >= 0 ? "text-green-700" : "text-red-700"}`}>
                  {s.resultatNet !== 0 ? (s.resultatNet > 0 ? "+" : "") + formatCurrency(s.resultatNet) : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Estimation {isLabel}</p>
                <p className="text-lg font-semibold text-gray-900">
                  {s.resultatNet > 0 ? formatCurrency(calculateIS(s.resultatNet)) : "—"}
                </p>
              </div>
            </div>

            {s.regime === "opcvm_taxable" && (
              <div className="mt-4 pt-4 border-t border-red-200">
                <p className="text-sm text-red-700 font-medium">
                  Attention : les écarts de valeur liquidative de ces titres doivent être intégrés
                  au résultat fiscal à la clôture, même sans cession. Pensez à renseigner la valeur
                  liquidative à la date de clôture.
                </p>
              </div>
            )}

            {(s.regime === "opcvm_actions_90" || s.regime === "fcpr_fcpi_fip") && (
              <div className="mt-4 pt-4 border-t border-green-200">
                <p className="text-sm text-green-700 font-medium">
                  Ces titres sont exemptés de la taxation annuelle des écarts latents.
                  Seules les plus-values de cession sont imposables.
                </p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
  }
  function HistoriqueTab({ dossierId, formatCurrency, userPlan }: { dossierId: string; formatCurrency: (n: number) => string; userPlan: string }) {
  const [recapExercices, setRecapExercices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (userPlan === "free") {
        setLoading(false);
        return;
      }
      try {
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from("v_recap_cessions")
          .select("*")
          .eq("dossier_id", dossierId);

        if (fetchError) {
          setError("Impossible de charger l'historique");
        } else {
          setRecapExercices(data || []);
        }
      } catch {
        setError("Erreur de chargement");
      }
      setLoading(false);
    }
    load();
  }, [dossierId, userPlan]);

  if (userPlan === "free") {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <History className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-900 font-medium mb-2">Historique multi-exercices</p>
        <p className="text-gray-500 mb-4">Cette fonctionnalité est réservée au plan Pro.</p>
        <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">Pro</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (recapExercices.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <History className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Aucune cession enregistrée. L&apos;historique apparaîtra après vos premières ventes.</p>
      </div>
    );
  }

  const exercices = [...new Set(recapExercices.map((r: any) => r.exercice))].sort((a: number, b: number) => b - a);

  return (
    <div className="space-y-6">
      {exercices.map((exercice) => {
        const rows = recapExercices.filter((r: any) => r.exercice === exercice);
        const totalPV = rows.reduce((sum: number, r: any) => sum + parseFloat(r.total_plus_values || 0), 0);
        const totalMV = rows.reduce((sum: number, r: any) => sum + parseFloat(r.total_moins_values || 0), 0);
        const totalNet = totalPV + totalMV;

        return (
          <div key={exercice} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Exercice {exercice}</h3>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-green-600 font-medium">PV: {formatCurrency(totalPV)}</span>
                <span className="text-red-600 font-medium">MV: {formatCurrency(totalMV)}</span>
                <span className={`font-bold ${totalNet >= 0 ? "text-green-700" : "text-red-700"}`}>
                  Net: {totalNet > 0 ? "+" : ""}{formatCurrency(totalNet)}
                </span>
              </div>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Titre</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Qté cédée</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Plus-values</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Moins-values</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Résultat net</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nb cessions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row: any, i: number) => {
                  const net = parseFloat(row.resultat_net || 0);
                  return (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.titre_name}</td>
                      <td className="px-6 py-4 text-right font-mono text-sm">{parseFloat(row.quantite_totale_cedee).toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-mono text-sm text-green-600">
                        {parseFloat(row.total_plus_values) > 0 ? "+" + formatCurrency(parseFloat(row.total_plus_values)) : "—"}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-sm text-red-600">
                        {parseFloat(row.total_moins_values) < 0 ? formatCurrency(parseFloat(row.total_moins_values)) : "—"}
                      </td>
                      <td className={`px-6 py-4 text-right font-mono text-sm font-medium ${net >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {net !== 0 ? (net > 0 ? "+" : "") + formatCurrency(net) : "—"}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-500">{row.nb_cessions}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
