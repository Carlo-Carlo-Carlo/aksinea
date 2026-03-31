"use client";
import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  Upload,
  Download,
  FolderOpen,
  Shield,
  Zap,
  Check,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary-700">Aksinea</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">
              Fonctionnalités
            </a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">
              Tarifs
            </a>
            <a href="#faq" className="text-sm text-gray-600 hover:text-gray-900">
              FAQ
            </a>
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Essai gratuit
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-8">
            <Zap className="w-4 h-4" />
            Calcul FIFO automatique pour experts-comptables
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            La comptabilité des titres,
            <br />
            enfin simplifiée.
          </h1>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
            Aksinea calcule automatiquement les plus/moins-values en méthode
            FIFO/PEPS et génère les écritures comptables prêtes à importer.
            Fini les tableurs Excel.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-3.5 bg-white text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition-colors flex items-center gap-2"
            >
              Essai gratuit 14 jours
              <ArrowRight className="w-4 h-4" />
            </Link>
            
              <button
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-3.5 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              Découvrir
            </button>
          </div>
          <p className="text-sm text-primary-200 mt-4">
            Sans carte bancaire • Configuration en 2 minutes
          </p>
        </div>
      </section>

      {/* Problème / Solution */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Le problème que vous connaissez
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Vos clients détiennent des actions, obligations ou OPCVM achetés
                à des dates et prix différents. À chaque cession, vous devez
                calculer la plus-value en méthode FIFO, lot par lot, à la main
                ou dans un tableur bricolé.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-red-500 font-bold text-lg">✕</span>
                  <p className="text-gray-600">Calculs manuels source d&apos;erreurs</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 font-bold text-lg">✕</span>
                  <p className="text-gray-600">Fichiers Excel ingérables avec plusieurs titres</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 font-bold text-lg">✕</span>
                  <p className="text-gray-600">Aucun logiciel comptable ne gère le FIFO correctement</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                La solution Aksinea
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <p className="text-gray-600">Importez les mouvements depuis un CSV ou Excel</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <p className="text-gray-600">Le moteur FIFO calcule automatiquement chaque cession</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <p className="text-gray-600">Exportez les écritures comptables prêtes à saisir</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <p className="text-gray-600">Suivi du portefeuille avec PRU FIFO en temps réel</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Un outil conçu par et pour les experts-comptables qui gèrent des
              portefeuilles de titres.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-gray-200 hover:border-primary-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                <Calculator className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Calcul FIFO automatique
              </h3>
              <p className="text-gray-500">
                Imputation automatique des cessions sur les lots les plus
                anciens. Plus-values et moins-values calculées instantanément.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:border-primary-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Import CSV / Excel
              </h3>
              <p className="text-gray-500">
                Importez vos mouvements en masse. Détection automatique des
                colonnes, prévisualisation avant validation, protection
                anti-doublons.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:border-primary-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <Download className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Export écritures comptables
              </h3>
              <p className="text-gray-500">
                Générez les écritures d&apos;achat et de cession (comptes 503, 512,
                667, 767) prêtes à importer dans votre logiciel comptable.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:border-primary-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
                <FolderOpen className="w-6 h-6 text-violet-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Multi-dossiers
              </h3>
              <p className="text-gray-500">
                Un dossier par client. Chaque portefeuille est indépendant avec
                son propre historique et ses propres calculs.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:border-primary-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Conformité PCG
              </h3>
              <p className="text-gray-500">
                Méthode PEPS conforme au Plan Comptable Général et aux exigences
                fiscales françaises. Comptes 503, 506, 508 gérés automatiquement.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 hover:border-primary-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Rapide et simple
              </h3>
              <p className="text-gray-500">
                Interface épurée, prise en main immédiate. Importez un fichier,
                récupérez vos écritures. Rien de superflu.
              </p>
            </div>
          </div>
        </div>
      </section>

     {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tarifs simples et transparents
            </h2>
            <p className="text-lg text-gray-500">
              Commencez gratuitement, upgradez quand vous en avez besoin.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Free */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h3 className="text-lg font-semibold text-gray-900">Gratuit</h3>
              <p className="text-sm text-gray-500 mt-1">
                Pour découvrir Aksinea
              </p>
              <div className="mt-6 mb-8">
                <span className="text-4xl font-bold text-gray-900">0€</span>
                <span className="text-gray-500 ml-1">pour toujours</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  1 dossier client
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Import CSV / Excel
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Calcul FIFO automatique
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Régime fiscal par titre
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Exercice en cours uniquement
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full py-3 text-center font-semibold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Créer mon compte
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-white rounded-2xl border-2 border-primary-600 p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Populaire
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Pro</h3>
              <p className="text-sm text-gray-500 mt-1">
                Pour les cabinets en activité
              </p>
              <div className="mt-6 mb-8">
                <span className="text-4xl font-bold text-gray-900">19,99€</span>
                <span className="text-gray-500 ml-1">HT / mois</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Dossiers illimités
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Tout le plan Gratuit
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Export écritures comptables
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Historique multi-exercices
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Support email prioritaire
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full py-3 text-center font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                Commencer gratuitement
              </Link>
            </div>

            {/* Connecté */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h3 className="text-lg font-semibold text-gray-900">Connecté</h3>
              <p className="text-sm text-gray-500 mt-1">
                Pour les cabinets premium
              </p>
              <div className="mt-6 mb-8">
                <span className="text-4xl font-bold text-gray-900">49€</span>
                <span className="text-gray-500 ml-1">HT / mois</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Tout le plan Pro
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Intégration Pennylane (bientôt)
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Connexion flux bancaires (bientôt)
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Synthèse fiscale automatique (bientôt)
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Support dédié
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full py-3 text-center font-semibold rounded-lg border border-primary-600 text-primary-600 hover:bg-primary-50 transition-colors"
              >
                Commencer gratuitement
              </Link>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              Vous passez 3h/mois sur le suivi des titres de vos clients ? Aksinea vous en rend 2.
            </p>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-900 text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à simplifier la comptabilité des titres ?
          </h2>
          <p className="text-lg text-primary-100 mb-8">
            Rejoignez les experts-comptables qui gagnent du temps avec Aksinea.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition-colors"
          >
            Essai gratuit 14 jours
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-primary-700">Aksinea</span>
              <p className="text-sm text-gray-400 mt-1">
                Suivi des titres et calcul FIFO pour experts-comptables
              </p>
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-700">
                Mentions légales
              </a>
              <a href="#" className="hover:text-gray-700">
                CGV
              </a>
              <a href="#" className="hover:text-gray-700">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} Aksinea. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
