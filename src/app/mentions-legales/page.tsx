import Link from "next/link";

export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link href="/" className="text-xl font-bold text-primary-700">Aksinea</Link>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mentions légales</h1>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
          <h2 className="text-xl font-semibold text-gray-900">Éditeur du site</h2>
          <p>
            Le site aksinea.com est édité par :<br />
            [NOM DE LA SOCIÉTÉ À COMPLÉTER]<br />
            [FORME JURIDIQUE À COMPLÉTER] au capital de [MONTANT À COMPLÉTER] euros<br />
            Siège social : [ADRESSE À COMPLÉTER]<br />
            SIREN : [SIREN À COMPLÉTER]<br />
            RCS : [VILLE À COMPLÉTER]<br />
            N° TVA intracommunautaire : [TVA À COMPLÉTER]<br />
            Directeur de la publication : Carlo Mologni
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Hébergement</h2>
          <p>
            Le site est hébergé par :<br />
            Vercel Inc.<br />
            340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis<br />
            https://vercel.com
          </p>
          <p>
            Les données sont hébergées par :<br />
            Supabase Inc.<br />
            970 Toa Payoh North #07-04, Singapore 318992<br />
            https://supabase.com<br />
            Serveurs situés dans l&apos;Union européenne (AWS eu-west)
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble du contenu du site aksinea.com (textes, images, logos, logiciels, base de données)
            est protégé par le droit de la propriété intellectuelle. Toute reproduction, représentation
            ou diffusion, en tout ou partie, du contenu de ce site sur quelque support ou par tout procédé
            que ce soit est interdite sans l&apos;autorisation préalable écrite de l&apos;éditeur.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Données personnelles</h2>
          <p>
            Les informations relatives au traitement de vos données personnelles sont détaillées
            dans notre <Link href="/confidentialite" className="text-primary-600 hover:underline">politique de confidentialité</Link>.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Contact</h2>
          <p>
            Pour toute question concernant le site, vous pouvez nous contacter à l&apos;adresse :<br />
            [EMAIL À COMPLÉTER]
          </p>
        </div>
      </div>
    </div>
  );
}
