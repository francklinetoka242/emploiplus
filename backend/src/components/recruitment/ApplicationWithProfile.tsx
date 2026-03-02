import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useProfileData, formatProfileForApplication } from '@/hooks/useProfileData';
import { authHeaders } from '@/lib/headers';
import { toast } from 'sonner';

interface ApplicationWithProfileProps {
  companyId: string;
  companyName: string;
  onBack: () => void;
  onSuccess?: () => void;
}

export const ApplicationWithProfile = ({
  companyId,
  companyName,
  onBack,
  onSuccess,
}: ApplicationWithProfileProps) => {
  const profile = useProfileData();
  const [motivation, setMotivation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [spamError, setSpamError] = useState<{ message: string; nextDate: string } | null>(null);

  // Check anti-spam on mount
  useEffect(() => {
    const checkAntiSpam = async () => {
      try {
        const res = await fetch(`/api/applications/spontaneous/check-spam/${companyId}`, {
          headers: authHeaders(''),
        });
        const data = await res.json();
        
        if (!data.canSubmit) {
          setSpamError({
            message: data.message,
            nextDate: data.nextEligibleDate,
          });
        }
      } catch (err) {
        console.error('Error checking anti-spam:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAntiSpam();
  }, [companyId]);

  const handleSubmit = async () => {
    if (!motivation.trim()) {
      toast.error('Veuillez saisir un message d\'introduction');
      return;
    }

    if (!profile) {
      toast.error('Erreur: profil utilisateur non chargé');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('company_id', companyId);
      formData.append('applicant_name', profile.full_name);
      formData.append('applicant_email', profile.email);
      formData.append('applicant_phone', profile.phone || '');
      formData.append('message', motivation);
      formData.append('type', 'with_profile');
      formData.append('profile_data', formatProfileForApplication(profile));

      const res = await fetch('/api/applications/spontaneous', {
        method: 'POST',
        headers: authHeaders(''),
        body: formData,
      });

      if (res.ok) {
        toast.success('✅ Candidature envoyée avec succès!');
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          }
        }, 1500);
      } else {
        const error = await res.json();
        toast.error(error.message || 'Erreur lors de l\'envoi');
      }
    } catch (err) {
      console.error('Error submitting application:', err);
      toast.error('Erreur lors de l\'envoi de la candidature');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !profile) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
          <p>Chargement de votre profil...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Changer d'option
        </button>
        <h2 className="text-2xl font-bold">
          Candidature avec mon profil Emploi+
        </h2>
      </div>

      <div className="space-y-8">
        {/* Message d'erreur anti-spam */}
        {spamError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex gap-4">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Limite de candidature atteinte</h3>
              <p className="text-red-700 text-sm">{spamError.message}</p>
            </div>
          </div>
        )}

        {/* Résumé du profil */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Aperçu de votre profil
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-semibold text-gray-700">Nom:</span>
              <span className="text-gray-600 ml-2">{profile.full_name}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Email:</span>
              <span className="text-gray-600 ml-2">{profile.email}</span>
            </div>
            {profile.phone && (
              <div>
                <span className="font-semibold text-gray-700">Téléphone:</span>
                <span className="text-gray-600 ml-2">{profile.phone}</span>
              </div>
            )}
            {profile.profession && (
              <div>
                <span className="font-semibold text-gray-700">Profession:</span>
                <span className="text-gray-600 ml-2">{profile.profession}</span>
              </div>
            )}

            {/* Expériences */}
            {profile.experiences.length > 0 && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="font-semibold text-gray-700 mb-2">
                  Expériences ({profile.experiences.length})
                </p>
                <ul className="space-y-2 ml-3">
                  {profile.experiences.map((exp, idx) => (
                    <li key={idx} className="text-gray-600">
                      • <span className="font-medium">{exp.job_title}</span> chez{' '}
                      {exp.company_name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Compétences */}
            {profile.skills.length > 0 && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="font-semibold text-gray-700 mb-2">
                  Compétences ({profile.skills.length})
                </p>
                <div className="flex flex-wrap gap-2 ml-3">
                  {profile.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Formation */}
            {profile.education.length > 0 && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="font-semibold text-gray-700 mb-2">
                  Formation ({profile.education.length})
                </p>
                <ul className="space-y-2 ml-3">
                  {profile.education.map((edu, idx) => (
                    <li key={idx} className="text-gray-600">
                      • <span className="font-medium">{edu.degree}</span> en{' '}
                      {edu.field_of_study}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Message d'introduction obligatoire */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Message d'introduction</h3>
          <div>
            <Label htmlFor="motivation">
              Message <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="motivation"
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="Pourquoi vous intéresse cette entreprise? Qu'est-ce que vous pouvez apporter?..."
              rows={6}
              className="resize-none mt-2"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Décrivez votre intérêt pour cette entreprise et ce qui vous motive
              </p>
              <p className="text-xs text-gray-500">
                {motivation.length} caractères
              </p>
            </div>
          </div>
        </div>

        {/* Note importante */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-900">
            <span className="font-semibold">Note:</span> Votre candidature sera envoyée avec 
            toutes vos informations de profil (expériences, compétences, formations). 
            Assurez-vous que vos données sont à jour dans vos paramètres de compte.
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={submitting}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !motivation.trim() || spamError !== null}
            className="flex-1 bg-orange-500 hover:bg-orange-600 gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : spamError ? (
              '❌ Candidature bloquée'
            ) : (
              'Envoyer ma candidature'
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};
