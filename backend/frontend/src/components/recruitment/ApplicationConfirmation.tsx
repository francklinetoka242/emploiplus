import { CheckCircle, Clock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ApplicationConfirmationProps {
  applicantName: string;
  companyName: string;
  applicationType: 'with_profile' | 'manual';
  onViewApplications?: () => void;
  onContinueBrowsing?: () => void;
}

export const ApplicationConfirmation = ({
  applicantName,
  companyName,
  applicationType,
  onViewApplications,
  onContinueBrowsing,
}: ApplicationConfirmationProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <Card className="w-full max-w-lg p-8 text-center space-y-6">
        {/* Icône de succès animée */}
        <div className="flex justify-center">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse" />
            <CheckCircle className="h-20 w-20 text-green-600 relative z-10" />
          </div>
        </div>

        {/* Titre */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Candidature envoyée !
          </h2>
          <p className="text-gray-600">
            Votre candidature a été reçue par <span className="font-semibold">{companyName}</span>
          </p>
        </div>

        {/* Détails */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3 text-left">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-900">Accusé de réception</p>
              <p className="text-sm text-gray-600">
                Un email de confirmation vous a été envoyé. L'entreprise a également reçu une notification de votre candidature.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-900">Suivi</p>
              <p className="text-sm text-gray-600">
                Vous pouvez suivre l'évolution de votre candidature dans votre espace personnel dans la section « Mes Candidatures ».
              </p>
            </div>
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 space-y-2">
          <p>
            <span className="font-semibold">Type :</span>{' '}
            {applicationType === 'with_profile'
              ? 'Candidature avec profil'
              : 'Formulaire manuel'}
          </p>
          <p>
            <span className="font-semibold">Entreprise :</span> {companyName}
          </p>
          <p>
            <span className="font-semibold">Candidat :</span> {applicantName}
          </p>
        </div>

        {/* Conseils */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-900">
            💡 <span className="font-semibold">Conseil :</span> Continuez à explorer d'autres offres d'emploi. Vous pouvez soumettre une nouvelle candidature spontanée à une autre entreprise dans 30 jours.
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col gap-3">
          {onViewApplications && (
            <Button
              onClick={onViewApplications}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              Voir mes candidatures
            </Button>
          )}
          {onContinueBrowsing && (
            <Button
              onClick={onContinueBrowsing}
              variant="outline"
              className="w-full"
            >
              Continuer à explorer
            </Button>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-500 border-t pt-4">
          Cette page disparaîtra automatiquement dans quelques secondes. Vous pouvez fermer cette fenêtre ou cliquer sur un bouton ci-dessus.
        </p>
      </Card>
    </div>
  );
};
