"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "lucide-react";

export default function ProfilPage() {
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [cabinetName, setCabinetName] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState("free");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setEmail(user.email || "");
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          setFullName(profile.full_name || "");
          setCabinetName(profile.cabinet_name || "");
          setPlan(profile.plan || "free");
        }
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Non connecté");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        cabinet_name: cabinetName.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      setError("Erreur lors de la mise à jour");
    } else {
      setSuccess("Profil mis à jour");
      setTimeout(() => setSuccess(""), 3000);
    }
    setLoading(false);
  };

  const planLabels: Record<string, string> = {
    free: "Gratuit",
    starter: "Starter",
    pro: "Pro",
  };

  const planColors: Record<string, string> = {
    free: "bg-gray-100 text-gray-700",
    starter: "bg-primary-100 text-primary-700",
    pro: "bg-primary-100 text-primary-700",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Mon profil</h1>

      <div className="max-w-xl space-y-6">
        {/* Plan actuel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Abonnement</h2>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                planColors[plan] || planColors.free
              }`}
            >
              Plan {planLabels[plan] || "Gratuit"}
            </span>
            {plan === "free" && (
              <p className="text-sm text-gray-500">
                1 dossier inclus. Passez au Pro pour des dossiers illimités.
              </p>
            )}
            {plan === "pro" && (
              <p className="text-sm text-gray-500">
                Dossiers illimités, export écritures, multi-exercices.
              </p>
            )}
          </div>
        </div>

        {/* Informations personnelles */}
        <form
          onSubmit={handleSave}
          className="bg-white rounded-xl border border-gray-200 p-6 space-y-5"
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
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">
              L&apos;email ne peut pas être modifié
            </p>
          </div>

          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nom complet
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="cabinetName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nom du cabinet
            </label>
            <input
              id="cabinetName"
              type="text"
              value={cabinetName}
              onChange={(e) => setCabinetName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
      </div>
    </div>
  );
}
