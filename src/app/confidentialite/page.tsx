import Link from "next/link";

export default function Confidentialite() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link href="/" className="text-xl font-bold text-primary-700">Aksinea</Link>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Politique de confidentialité</h1>
        <p className="text-gray-400 mb-8">Dernière mise à jour : avril 2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
          <h2 className="text-xl font-semibold text-gray-900">1. Responsable du traitement</h2>
          <p>
            Le responsable du traitement des données personnelles est :<br />
            [NOM DE LA SOCIÉTÉ À COMPLÉTER]<br />
            [ADRESSE À COMPLÉTER]<br />
            Email : [EMAIL À COMPLÉTER]
          </p>

          <h2 className="text-xl font-semibold text-gray-900">2. Données collectées</h2>
          <p>
            Dans le cadre de l&apos;utilisation du service Aksinea, nous collectons les données suivantes :
          </p>
          <p>
            Données d&apos;identification : nom, prénom, adresse email, nom du cabinet.
            Données d&apos;utilisation : logs de connexion, actions effectuées dans l&apos;application.
            Données métier : données comptables saisies par le Client (mouvements de titres,
            informations clients du cabinet). Ces données sont saisies par le Client
            sous sa responsabilité et ne sont pas exploitées par Aksinea à d&apos;autres fins
            que la fourniture du service.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">3. Finalités du traitement</h2>
          <p>
            Les données personnelles sont traitées pour les finalités suivantes :
            fourniture et gestion du service Aksinea, gestion du compte utilisateur
            et de l&apos;abonnement, communication relative au service (emails transactionnels,
            notifications de maintenance), amélioration du service (statistiques d&apos;usage anonymisées),
            respect des obligations légales.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">4. Base légale</h2>
          <p>
            Le traitement des données repose sur l&apos;exécution du contrat (fourniture du service),
            l&apos;intérêt légitime (amélioration du service, sécurité) et le respect
            des obligations légales (facturation, conservation des données comptables).
          </p>

          <h2 className="text-xl font-semibold text-gray-900">5. Destinataires des données</h2>
          <p>
            Les données personnelles sont accessibles uniquement aux personnes habilitées
            au sein de [NOM DE LA SOCIÉTÉ À COMPLÉTER] et aux sous-traitants suivants :
          </p>
          <p>
            Supabase Inc. (hébergement et base de données, serveurs UE),
            Vercel Inc. (hébergement du site web),
            Stripe Inc. (traitement des paiements),
            Resend (emails transactionnels).
          </p>
          <p>
            Ces sous-traitants sont soumis à des obligations de confidentialité
            et de sécurité conformes au RGPD.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">6. Transferts hors UE</h2>
          <p>
            Certains sous-traitants (Vercel, Stripe) sont situés aux États-Unis.
            Les transferts de données sont encadrés par les clauses contractuelles types
            de la Commission européenne et le Data Privacy Framework.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">7. Durée de conservation</h2>
          <p>
            Les données du compte sont conservées pendant toute la durée de l&apos;abonnement
            et 30 jours après la résiliation. Les données de facturation sont conservées
            10 ans conformément aux obligations comptables. Les logs de connexion sont
            conservés 12 mois.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">8. Vos droits</h2>
          <p>
            Conformément au RGPD, vous disposez des droits suivants : droit d&apos;accès,
            droit de rectification, droit à l&apos;effacement, droit à la limitation du traitement,
            droit à la portabilité, droit d&apos;opposition.
            Pour exercer ces droits, contactez-nous à : [EMAIL À COMPLÉTER].
            Vous disposez également du droit d&apos;introduire une réclamation auprès
            de la CNIL (www.cnil.fr).
          </p>

          <h2 className="text-xl font-semibold text-gray-900">9. Cookies</h2>
          <p>
            Aksinea utilise uniquement des cookies strictement nécessaires au fonctionnement
            du service (cookies de session et d&apos;authentification). Aucun cookie publicitaire
            ou de tracking n&apos;est utilisé.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">10. Sécurité</h2>
          <p>
            Nous mettons en œuvre les mesures techniques et organisationnelles appropriées
            pour protéger vos données : chiffrement HTTPS, authentification sécurisée,
            isolation des données par cabinet (Row Level Security), sauvegardes régulières,
            hébergement sur des serveurs sécurisés.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">11. Contact</h2>
          <p>
            Pour toute question relative à la protection de vos données :<br />
            [NOM DE LA SOCIÉTÉ À COMPLÉTER]<br />
            Email : [EMAIL À COMPLÉTER]
          </p>
        </div>
      </div>
    </div>
  );
}
