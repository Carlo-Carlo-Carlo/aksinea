"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, FileSpreadsheet, Check, AlertCircle } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

interface ParsedRow {
  date: string;
  type: "achat" | "vente";
  titre: string;
  isin: string;
  quantite: number;
  prix_unitaire: number;
  frais: number;
  valid: boolean;
  error?: string;
}

interface ColumnMapping {
  date: string;
  type: string;
  titre: string;
  isin: string;
  quantite: string;
  prix_unitaire: string;
  frais: string;
}

const REQUIRED_FIELDS = ["date", "type", "titre", "quantite", "prix_unitaire"];
const FIELD_LABELS: Record<string, string> = {
  date: "Date",
  type: "Type (achat/vente)",
  titre: "Nom du titre",
  isin: "Code ISIN",
  quantite: "Quantité",
  prix_unitaire: "Prix unitaire",
  frais: "Frais",
};

// Auto-detect column mapping
function autoDetectMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {
    date: "",
    type: "",
    titre: "",
    isin: "",
    quantite: "",
    prix_unitaire: "",
    frais: "",
  };

  const lower = headers.map((h) => h.toLowerCase().trim());

  lower.forEach((h, i) => {
    const original = headers[i];
    if (!mapping.date && (h.includes("date") || h === "dt"))
      mapping.date = original;
    if (
      !mapping.type &&
      (h.includes("type") || h.includes("sens") || h.includes("operation") || h.includes("opération"))
    )
      mapping.type = original;
    if (
      !mapping.titre &&
      (h.includes("titre") ||
        h.includes("libellé") ||
        h.includes("libelle") ||
        h.includes("nom") ||
        h.includes("valeur") ||
        h.includes("instrument"))
    )
      mapping.titre = original;
    if (!mapping.isin && (h.includes("isin") || h.includes("code")))
      mapping.isin = original;
    if (
      !mapping.quantite &&
      (h.includes("quantit") || h.includes("qte") || h.includes("qté") || h.includes("nombre") || h.includes("nb"))
    )
      mapping.quantite = original;
    if (
      !mapping.prix_unitaire &&
      (h.includes("prix") || h.includes("cours") || h.includes("pu") || h.includes("unit"))
    )
      mapping.prix_unitaire = original;
    if (
      !mapping.frais &&
      (h.includes("frais") || h.includes("commission") || h.includes("courtage") || h.includes("fee"))
    )
      mapping.frais = original;
  });

  return mapping;
}

// Parse date in various formats
function parseDate(val: string): string | null {
  if (!val) return null;
  const str = val.trim();

  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = str.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (dmy) {
    const d = dmy[1].padStart(2, "0");
    const m = dmy[2].padStart(2, "0");
    return `${dmy[3]}-${m}-${d}`;
  }

  // YYYY-MM-DD
  const ymd = str.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/);
  if (ymd) {
    const m = ymd[2].padStart(2, "0");
    const d = ymd[3].padStart(2, "0");
    return `${ymd[1]}-${m}-${d}`;
  }

  return null;
}

// Parse type
function parseType(val: string): "achat" | "vente" | null {
  if (!val) return null;
  const lower = val.toLowerCase().trim();
  if (
    lower === "achat" ||
    lower === "a" ||
    lower === "buy" ||
    lower === "souscription" ||
    lower === "acquisition"
  )
    return "achat";
  if (
    lower === "vente" ||
    lower === "v" ||
    lower === "sell" ||
    lower === "cession" ||
    lower === "rachat"
  )
    return "vente";
  return null;
}

// Parse number (handle French format)
function parseNumber(val: string | number): number {
  if (typeof val === "number") return val;
  if (!val) return 0;
  const cleaned = val
    .toString()
    .trim()
    .replace(/\s/g, "")
    .replace(/€/g, "")
    .replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export default function ImportPage() {
  const params = useParams();
  const dossierId = params.id as string;
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<"upload" | "mapping" | "preview" | "importing" | "done">("upload");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawData, setRawData] = useState<Record<string, any>[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    date: "",
    type: "",
    titre: "",
    isin: "",
    quantite: "",
    prix_unitaire: "",
    frais: "",
  });
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [error, setError] = useState("");
  const [importResult, setImportResult] = useState<{
    success: number;
    errors: number;
    details: string[];
  } | null>(null);
  const [dossierName, setDossierName] = useState("");

  // Load dossier name
  useState(() => {
    supabase
      .from("dossiers")
      .select("name")
      .eq("id", dossierId)
      .single()
      .then(({ data }) => {
        if (data) setDossierName(data.name);
      });
  });

  // Handle file upload
  const handleFile = useCallback(
    (file: File) => {
      setError("");
      setFileName(file.name);

      const ext = file.name.split(".").pop()?.toLowerCase();

      if (ext === "csv" || ext === "tsv" || ext === "txt") {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          encoding: "UTF-8",
          complete: (results) => {
            if (results.data.length === 0) {
              setError("Le fichier est vide");
              return;
            }
            const h = Object.keys(results.data[0] as any);
            setHeaders(h);
            setRawData(results.data as Record<string, any>[]);
            setMapping(autoDetectMapping(h));
            setStep("mapping");
          },
          error: () => {
            setError("Erreur lors de la lecture du fichier CSV");
          },
        });
      } else if (ext === "xlsx" || ext === "xls") {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const wb = XLSX.read(e.target?.result, { type: "binary" });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(ws, { defval: "" });
            if (data.length === 0) {
              setError("Le fichier est vide");
              return;
            }
            const h = Object.keys(data[0] as any);
            setHeaders(h);
            setRawData(data as Record<string, any>[]);
            setMapping(autoDetectMapping(h));
            setStep("mapping");
          } catch {
            setError("Erreur lors de la lecture du fichier Excel");
          }
        };
        reader.readAsBinaryString(file);
      } else {
        setError("Format non supporté. Utilisez CSV, TSV, XLS ou XLSX.");
      }
    },
    []
  );

  // Handle drag & drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  // Apply mapping and generate preview
  const applyMapping = () => {
    // Validate required fields are mapped
    for (const field of REQUIRED_FIELDS) {
      if (!mapping[field as keyof ColumnMapping]) {
        setError(`Le champ "${FIELD_LABELS[field]}" doit être associé à une colonne`);
        return;
      }
    }

    const rows: ParsedRow[] = rawData.map((row) => {
      const date = parseDate(row[mapping.date] || "");
      const type = parseType(row[mapping.type] || "");
      const titre = (row[mapping.titre] || "").toString().trim();
      const isin = mapping.isin ? (row[mapping.isin] || "").toString().trim() : "";
      const quantite = parseNumber(row[mapping.quantite]);
      const prix_unitaire = parseNumber(row[mapping.prix_unitaire]);
      const frais = mapping.frais ? parseNumber(row[mapping.frais]) : 0;

      let valid = true;
      let errorMsg = "";

      if (!date) {
        valid = false;
        errorMsg = "Date invalide";
      } else if (!type) {
        valid = false;
        errorMsg = "Type invalide (achat/vente)";
      } else if (!titre) {
        valid = false;
        errorMsg = "Titre manquant";
      } else if (quantite <= 0) {
        valid = false;
        errorMsg = "Quantité invalide";
      } else if (prix_unitaire < 0) {
        valid = false;
        errorMsg = "Prix invalide";
      }

      return {
        date: date || "",
        type: type || "achat",
        titre,
        isin,
        quantite,
        prix_unitaire,
        frais,
        valid,
        error: errorMsg,
      };
    });

    setParsedRows(rows);
    setStep("preview");
    setError("");
  };

  // Run the import
  const runImport = async () => {
    setStep("importing");
    const validRows = parsedRows.filter((r) => r.valid);
    let success = 0;
    let errors = 0;
    const details: string[] = [];

    // Sort by date ascending (important for FIFO — achats before ventes)
    const sorted = [...validRows].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      // Achats avant ventes à même date
      if (a.type === "achat" && b.type === "vente") return -1;
      if (a.type === "vente" && b.type === "achat") return 1;
      return 0;
    });

    // Cache des titres créés
    const titreCache: Record<string, string> = {};

    for (let i = 0; i < sorted.length; i++) {
      const row = sorted[i];

      try {
        // Trouver ou créer le titre
        const cacheKey = `${row.titre}|${row.isin}`;
        let titreId = titreCache[cacheKey];

        if (!titreId) {
          // Chercher par ISIN d'abord, puis par nom
          let query = supabase
            .from("titres")
            .select("id")
            .eq("dossier_id", dossierId);

          if (row.isin) {
            query = query.eq("isin", row.isin);
          } else {
            query = query.eq("name", row.titre);
          }

          const { data: existing } = await query.maybeSingle();

          if (existing) {
            titreId = existing.id;
          } else {
            const { data: newTitre, error: titreError } = await supabase
              .from("titres")
              .insert({
                dossier_id: dossierId,
                name: row.titre,
                isin: row.isin || null,
                type: "action",
                compte_comptable: "503",
              })
              .select()
              .single();

            if (titreError) throw new Error(titreError.message);
            titreId = newTitre.id;
          }
          titreCache[cacheKey] = titreId;
        }

        // Appeler l'API FIFO
        // Vérification doublon
        const { data: existing } = await supabase
          .from("mouvements")
          .select("id")
          .eq("dossier_id", dossierId)
          .eq("titre_id", titreId)
          .eq("date", row.date)
          .eq("type", row.type)
          .eq("quantite", row.quantite)
          .eq("prix_unitaire", row.prix_unitaire)
          .maybeSingle();

        if (existing) {
          errors++;
          details.push(
            `Ligne ${i + 1} (${row.titre}, ${row.date}): Doublon détecté, ignoré`
          );
          continue;
        }
        const response = await fetch("/api/mouvements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dossier_id: dossierId,
            titre_id: titreId,
            date: row.date,
            type: row.type,
            quantite: row.quantite,
            prix_unitaire: row.prix_unitaire,
            frais: row.frais,
          }),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || "Erreur API");
        }

        success++;
      } catch (err: any) {
        errors++;
        details.push(
          `Ligne ${i + 1} (${row.titre}, ${row.date}): ${err.message}`
        );
      }
    }

    setImportResult({ success, errors, details });
    setStep("done");
  };

  const validCount = parsedRows.filter((r) => r.valid).length;
  const invalidCount = parsedRows.filter((r) => !r.valid).length;

  return (
    <div>
      <Link
        href={`/dashboard/dossiers/${dossierId}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {dossierName || "Retour au dossier"}
      </Link>

      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Importer des mouvements
        </h1>
        <p className="text-gray-500 mb-8">
          Importez vos mouvements depuis un fichier CSV ou Excel.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* STEP 1: Upload */}
        {step === "upload" && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center hover:border-primary-400 transition-colors"
          >
            <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              Glissez-déposez votre fichier ici
            </p>
            <p className="text-sm text-gray-400 mb-4">CSV, XLS ou XLSX</p>
            <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors cursor-pointer">
              <FileSpreadsheet className="w-4 h-4" />
              Parcourir
              <input
                type="file"
                accept=".csv,.tsv,.txt,.xls,.xlsx"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </label>

            <div className="mt-8 text-left bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Format attendu
              </p>
              <p className="text-xs text-gray-500">
                Votre fichier doit contenir au minimum les colonnes : Date, Type
                (achat/vente), Titre, Quantité, Prix unitaire. Les colonnes ISIN
                et Frais sont optionnelles. Les en-têtes sont détectés
                automatiquement.
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: Column mapping */}
        {step === "mapping" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <FileSpreadsheet className="w-5 h-5 text-primary-600" />
              <div>
                <p className="font-medium text-gray-900">{fileName}</p>
                <p className="text-sm text-gray-500">
                  {rawData.length} lignes détectées • {headers.length} colonnes
                </p>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Association des colonnes
            </h3>

            <div className="space-y-3">
              {Object.keys(FIELD_LABELS).map((field) => (
                <div
                  key={field}
                  className="flex items-center gap-4"
                >
                  <label className="w-40 text-sm text-gray-600">
                    {FIELD_LABELS[field]}
                    {REQUIRED_FIELDS.includes(field) && (
                      <span className="text-red-500 ml-0.5">*</span>
                    )}
                  </label>
                  <select
                    value={mapping[field as keyof ColumnMapping]}
                    onChange={(e) =>
                      setMapping({ ...mapping, [field]: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
                  >
                    <option value="">— Non associé —</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={applyMapping}
                className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Prévisualiser
              </button>
              <button
                onClick={() => {
                  setStep("upload");
                  setRawData([]);
                  setHeaders([]);
                }}
                className="px-6 py-2.5 text-gray-600 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Changer de fichier
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Preview */}
        {step === "preview" && (
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-green-50 rounded-lg px-4 py-2">
                <span className="text-sm text-green-700 font-medium">
                  {validCount} valides
                </span>
              </div>
              {invalidCount > 0 && (
                <div className="bg-red-50 rounded-lg px-4 py-2">
                  <span className="text-sm text-red-700 font-medium">
                    {invalidCount} en erreur
                  </span>
                </div>
              )}
              <p className="text-sm text-gray-500">
                Seules les lignes valides seront importées.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">
                        Statut
                      </th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">
                        Date
                      </th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">
                        Type
                      </th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">
                        Titre
                      </th>
                      <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500">
                        Qté
                      </th>
                      <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500">
                        Prix
                      </th>
                      <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500">
                        Frais
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {parsedRows.slice(0, 50).map((row, i) => (
                      <tr
                        key={i}
                        className={
                          row.valid ? "hover:bg-gray-50" : "bg-red-50/50"
                        }
                      >
                        <td className="px-4 py-2">
                          {row.valid ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <span title={row.error}>
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {row.date
                            ? new Date(row.date).toLocaleDateString("fr-FR")
                            : "—"}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              row.type === "achat"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {row.type === "achat" ? "Achat" : "Vente"}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm font-medium">
                          {row.titre}
                        </td>
                        <td className="px-4 py-2 text-sm text-right font-mono">
                          {row.quantite}
                        </td>
                        <td className="px-4 py-2 text-sm text-right font-mono">
                          {row.prix_unitaire}
                        </td>
                        <td className="px-4 py-2 text-sm text-right font-mono">
                          {row.frais}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 50 && (
                <div className="px-4 py-2 bg-gray-50 text-sm text-gray-500 border-t">
                  ... et {parsedRows.length - 50} autres lignes
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={runImport}
                disabled={validCount === 0}
                className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                Importer {validCount} mouvement{validCount > 1 ? "s" : ""}
              </button>
              <button
                onClick={() => setStep("mapping")}
                className="px-6 py-2.5 text-gray-600 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Modifier le mapping
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Importing */}
        {step === "importing" && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="animate-spin w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Import en cours...</p>
            <p className="text-sm text-gray-400 mt-1">
              Traitement des mouvements et calcul FIFO
            </p>
          </div>
        )}

        {/* STEP 5: Done */}
        {step === "done" && importResult && (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Import terminé
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {importResult.success} mouvement
                {importResult.success > 1 ? "s" : ""} importé
                {importResult.success > 1 ? "s" : ""} avec succès
                {importResult.errors > 0 &&
                  `, ${importResult.errors} erreur${importResult.errors > 1 ? "s" : ""}`}
              </p>
            </div>

            {importResult.details.length > 0 && (
              <div className="bg-red-50 rounded-lg p-4 mb-6">
                <p className="text-sm font-medium text-red-700 mb-2">
                  Erreurs rencontrées :
                </p>
                <ul className="text-sm text-red-600 space-y-1">
                  {importResult.details.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Link
                href={`/dashboard/dossiers/${dossierId}`}
                className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Voir le dossier
              </Link>
              <button
                onClick={() => {
                  setStep("upload");
                  setRawData([]);
                  setHeaders([]);
                  setParsedRows([]);
                  setImportResult(null);
                }}
                className="px-6 py-2.5 text-gray-600 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Importer un autre fichier
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
