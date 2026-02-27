import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface ApplicationOptionSelectorProps {
  onSelectOption: (option: 'profile' | 'manual') => void;
  loading?: boolean;
}

export const ApplicationOptionSelector = ({
  onSelectOption,
  loading = false,
}: ApplicationOptionSelectorProps) => {
  return (
    <div className="space-y-4">
      {/* Option A: Candidature avec profil */}
      <Button
        onClick={() => onSelectOption('profile')}
        disabled={loading}
        variant="outline"
        className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition text-left h-auto group"
      >
        <div className="flex items-start gap-4 w-full">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2 text-left">
              📄 Postuler avec mon profil Emploi+
            </h3>
            <p className="text-gray-600 text-sm text-left">
              Générez automatiquement une candidature basée sur vos expériences, 
              compétences et formations enregistrées dans votre profil.
            </p>
          </div>
          <div className="text-orange-500 group-hover:scale-110 transition shrink-0">
            <CheckCircle className="h-6 w-6" />
          </div>
        </div>
      </Button>

      {/* Option B: Formulaire manuel */}
      <Button
        onClick={() => onSelectOption('manual')}
        disabled={loading}
        variant="outline"
        className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition text-left h-auto group"
      >
        <div className="flex items-start gap-4 w-full">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2 text-left">
              ✏️ Formulaire Manuel
            </h3>
            <p className="text-gray-600 text-sm text-left">
              Remplissez le formulaire manuellement et téléchargez vos propres 
              CV et lettre de motivation en PDF ou DOC.
            </p>
          </div>
          <div className="text-orange-500 group-hover:scale-110 transition shrink-0">
            <CheckCircle className="h-6 w-6" />
          </div>
        </div>
      </Button>
    </div>
  );
};
