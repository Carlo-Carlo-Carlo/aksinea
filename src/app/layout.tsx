import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aksinea — Suivi des titres et calcul FIFO",
  description:
    "SaaS de gestion des valeurs mobilières pour experts-comptables. Calcul FIFO automatique, export des écritures comptables.",
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
