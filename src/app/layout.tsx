import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aksinea — Suivi des titres et calcul FIFO pour experts-comptables",
  description:
    "Aksinea calcule automatiquement les plus/moins-values en méthode FIFO/PEPS et génère les écritures comptables. L'outil qui empêche vos clients de surpayer leurs impôts sur les VMP.",
  keywords: [
    "FIFO",
    "PEPS",
    "expert-comptable",
    "valeurs mobilières de placement",
    "VMP",
    "plus-value",
    "moins-value",
    "écritures comptables",
    "calcul FIFO",
    "titres",
    "portefeuille",
    "cession titres",
    "OPCVM",
    "comptabilité titres",
  ],
  authors: [{ name: "Aksinea" }],
  openGraph: {
    title: "Aksinea — La comptabilité des titres, enfin simplifiée.",
    description:
      "Calcul FIFO automatique, import CSV/Excel, export des écritures comptables. L'outil qui empêche vos clients de surpayer leurs impôts sur les VMP.",
    url: "https://aksinea.vercel.app",
    siteName: "Aksinea",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aksinea — La comptabilité des titres, enfin simplifiée.",
    description:
      "Calcul FIFO automatique pour experts-comptables. Import, calcul, export en 5 minutes.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
