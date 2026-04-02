import Link from "next/link";

export default function CGV() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link href="/" className="text-xl font-bold text-primary-700">Aksinea</Link>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Conditions Générales de Vente</h1>
        <p className="text-gray-400 mb-8">Dernière mise à jour : avril 2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
          <h2 className="text-xl font-semibold text-gray-900">Article 1 — Objet</h2>
          <p>
            Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles
            entre [NOM DE LA SOCIÉTÉ À COMPLÉTER], ci-après dénommée « Aksinea », et tout utilisateur
            professionnel souscrivant à un abonnement, ci-après dénommé « le Client ».
            Aksinea est un logiciel en ligne (SaaS) de suivi des valeurs mobilières de placement
            et de calcul FIFO/PEPS destiné aux experts-comptables.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Article 2 — Services proposés</h2>
          <p>
            Aksinea propose les services suivants selon le plan souscrit :
          </p>
          <p>
            Plan Gratuit : 1 dossier client, import CSV/Excel, calcul FIFO automatique,
            régime fiscal par titre, exercice en cours uniquement.
          </p>
          <p>
            Plan Pro (19,99€ HT/mois) : dossiers illimités, export des écritures comptables,
            historique multi-exercices, support email prioritaire. Toutes les fonctionnalités
            du plan Gratuit sont incluses.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Article 3 — Inscription et compte</h2>
          <p>
            L&apos;accès au service nécessite la création d&apos;un compte utilisateur. Le Client
            garantit l&apos;exactitude des informations fournies lors de l&apos;inscription.
            Le Client est responsable de la confidentialité de ses identifiants de connexion.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Article 4 — Tarifs et paiement</h2>
          <p>
            Les tarifs sont indiqués en euros hors taxes (HT). La TVA applicable est ajoutée
            au moment du paiement. Le paiement s&apos;effectue par carte bancaire via la plateforme
            sécurisée Stripe. L&apos;abonnement est mensuel et renouvelé automatiquement à chaque
            date anniversaire. Les tarifs peuvent être modifiés par Aksinea avec un préavis
            de 30 jours. Le nouveau tarif s&apos;applique au renouvellement suivant.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Article 5 — Durée et résiliation</h2>
          <p>
            L&apos;abonnement est conclu pour une durée indéterminée avec facturation mensuelle.
            Le Client peut résilier son abonnement à tout moment depuis son espace personnel.
            La résiliation prend effet à la fin de la période en cours déjà payée.
            En cas de résiliation, le Client conserve l&apos;accès au plan Gratuit.
            Aksinea se réserve le droit de résilier un compte en cas de non-respect des présentes CGV,
            avec un préavis de 15 jours sauf en cas de manquement grave.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Article 6 — Droit de rétractation</h2>
          <p>
            Conformément à l&apos;article L221-28 du Code de la consommation, le droit de rétractation
            ne s&apos;applique pas aux contrats de fourniture de contenu numérique non fourni sur
            un support matériel dont l&apos;exécution a commencé avec l&apos;accord du consommateur.
            Le Client professionnel reconnaît que le service est accessible immédiatement
            après la souscription.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Article 7 — Responsabilité</h2>
          <p>
            Aksinea met en œuvre les moyens nécessaires pour assurer le bon fonctionnement du service.
            Aksinea ne saurait être tenu responsable des erreurs résultant de données incorrectes
            saisies par le Client. Les calculs FIFO sont fournis à titre d&apos;aide à la décision
            et ne constituent pas un conseil fiscal ou comptable. Le Client reste seul responsable
            de la validation des écritures comptables générées par le service.
            La responsabilité d&apos;Aksinea est limitée au montant des sommes versées par le Client
            au cours des 12 derniers mois.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Article 8 — Disponibilité du service</h2>
          <p>
            Aksinea s&apos;engage à fournir un taux de disponibilité de 99% en moyenne mensuelle,
            hors maintenance programmée. Les opérations de maintenance seront signalées
            avec un préavis raisonnable lorsque possible. Aksinea ne saurait être tenu responsable
            des interruptions dues à des cas de force majeure ou à des défaillances
            des prestataires d&apos;hébergement.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Article 9 — Propriété des données</h2>
          <p>
            Le Client reste propriétaire de l&apos;ensemble des données qu&apos;il saisit dans le service.
            Aksinea s&apos;engage à ne pas utiliser les données du Client à des fins autres que
            la fourniture du service. En cas de résiliation, le Client peut exporter ses données
            avant la fermeture de son compte. Les données sont conservées pendant 30 jours
            après la résiliation, puis supprimées définitivement.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Article 10 — Données personnelles</h2>
          <p>
            Le traitement des données personnelles est détaillé dans notre{" "}
            <Link href="/confidentialite" className="text-primary-600 hover:underline">
              politique de confidentialité
            </Link>.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Article 11 — Droit applicable</h2>
          <p>
            Les présentes CGV sont soumises au droit français. En cas de litige, les parties
            s&apos;engagent à rechercher une solution amiable. À défaut, les tribunaux compétents
            de [VILLE À COMPLÉTER] seront seuls compétents.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">Article 12 — Contact</h2>
          <p>
            Pour toute question relative aux présentes CGV :<br />
            [NOM DE LA SOCIÉTÉ À COMPLÉTER]<br />
            [ADRESSE À COMPLÉTER]<br />
            Email : [EMAIL À COMPLÉTER]
          </p>
        </div>
      </div>
    </div>
  );
}
