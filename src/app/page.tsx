import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-900">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">Aksinea</h1>
        <p className="text-xl text-primary-100 mb-8">
          Suivi des titres et calcul FIFO pour experts-comptables
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-white text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition-colors"
          >
            Se connecter
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg border border-primary-400 hover:bg-primary-400 transition-colors"
          >
            Essai gratuit
          </Link>
        </div>
      </div>
    </div>
  );
}
