import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Upload, Loader2, X } from 'lucide-react';
import { authHeaders } from '@/lib/headers';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ApplicationManualProps {
  companyId: string;
  companyName: string;
  onBack: () => void;
  onSuccess?: () => void;
}

export const ApplicationManual = ({
  companyId,
  companyName,
  onBack,
  onSuccess,
}: ApplicationManualProps) => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [position, setPosition] = useState('');
  const [motivation, setMotivation] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [letterFile, setLetterFile] = useState<File | null>(null);
  const [cvPreview, setCvPreview] = useState<string>('');
  const [letterPreview, setLetterPreview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'cv' | 'letter'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast.error('Format non supporté. Veuillez télécharger un PDF ou DOC');
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Fichier trop volumineux. Taille maximale: 5MB');
      return;
    }

    if (type === 'cv') {
      setCvFile(file);
      setCvPreview(file.name);
    } else {
      setLetterFile(file);
      setLetterPreview(file.name);
    }
  };

  const clearFile = (type: 'cv' | 'letter') => {
    if (type === 'cv') {
      setCvFile(null);
      setCvPreview('');
    } else {
      setLetterFile(null);
      setLetterPreview('');
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!fullName.trim()) {
      toast.error('Veuillez saisir votre nom complet');
      return;
    }
    if (!email.trim()) {
      toast.error('Veuillez saisir votre email');
      return;
    }
    if (!motivation.trim()) {
      toast.error('Veuillez saisir un message d\'introduction');
      return;
    }
    if (!cvFile) {
      toast.error('Veuillez télécharger votre CV');
      return;
    }
    if (!letterFile) {
      toast.error('Veuillez télécharger votre lettre de motivation');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('company_id', companyId);
      formData.append('applicant_name', fullName);
      formData.append('applicant_email', email);
      formData.append('applicant_phone', phone);
      formData.append('message', motivation);
      formData.append('type', 'manual');
      formData.append('position', position);
      formData.append('cv_file', cvFile);
      formData.append('letter_file', letterFile);

      const res = await fetch('/api/applications/spontaneous', {
        method: 'POST',
        headers: authHeaders(''),
        body: formData,
      });

      if (res.ok) {
        toast.success('Candidature envoyée avec succès!');
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
        <h2 className="text-2xl font-bold">Formulaire de candidature</h2>
        <p className="text-gray-600 mt-1">
          Postulez à l'entreprise <span className="font-semibold">{companyName}</span>
        </p>
      </div>

      <div className="space-y-6">
        {/* Informations Personnelles */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-sm font-bold">1</span>
            Informations Personnelles
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">
                Nom complet <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Votre nom complet"
                disabled={submitting}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                disabled={submitting}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+243..."
                disabled={submitting}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="position">Poste recherché</Label>
              <Input
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Ex: Développeur Full Stack"
                disabled={submitting}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Documents */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-sm font-bold">2</span>
            Vos documents
          </h3>
          <div className="space-y-4">
            {/* CV Upload */}
            <div>
              <Label className="block mb-3">
                CV <span className="text-red-500">*</span>
              </Label>
              {!cvFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 transition hover:border-orange-400 hover:bg-orange-50">
                  <label htmlFor="cv" className="cursor-pointer block">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Upload className="h-5 w-5" />
                      <div>
                        <p className="font-semibold">Télécharger votre CV</p>
                        <p className="text-sm text-gray-500">PDF ou DOC (max 5MB)</p>
                      </div>
                    </div>
                    <input
                      id="cv"
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(e) => handleFileChange(e, 'cv')}
                      className="hidden"
                      disabled={submitting}
                    />
                  </label>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded bg-green-100 text-green-700">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-green-900">{cvPreview}</p>
                      <p className="text-xs text-green-700">Fichier sélectionné</p>
                    </div>
                  </div>
                  <button
                    onClick={() => clearFile('cv')}
                    disabled={submitting}
                    className="p-1 hover:bg-green-200 rounded transition"
                  >
                    <X className="h-4 w-4 text-green-700" />
                  </button>
                </div>
              )}
            </div>

            {/* Lettre de motivation Upload */}
            <div>
              <Label className="block mb-3">
                Lettre de motivation <span className="text-red-500">*</span>
              </Label>
              {!letterFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 transition hover:border-orange-400 hover:bg-orange-50">
                  <label htmlFor="letter" className="cursor-pointer block">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Upload className="h-5 w-5" />
                      <div>
                        <p className="font-semibold">Télécharger votre lettre</p>
                        <p className="text-sm text-gray-500">PDF ou DOC (max 5MB)</p>
                      </div>
                    </div>
                    <input
                      id="letter"
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(e) => handleFileChange(e, 'letter')}
                      className="hidden"
                      disabled={submitting}
                    />
                  </label>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded bg-green-100 text-green-700">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-green-900">{letterPreview}</p>
                      <p className="text-xs text-green-700">Fichier sélectionné</p>
                    </div>
                  </div>
                  <button
                    onClick={() => clearFile('letter')}
                    disabled={submitting}
                    className="p-1 hover:bg-green-200 rounded transition"
                  >
                    <X className="h-4 w-4 text-green-700" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message d'introduction obligatoire */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-sm font-bold">3</span>
            Message d'introduction
          </h3>
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
              className="resize-none mt-1"
              disabled={submitting}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Décrivez votre motivation et ce qui vous attire chez cette entreprise
              </p>
              <p className="text-xs text-gray-500">
                {motivation.length} caractères
              </p>
            </div>
          </div>
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
            disabled={submitting || !fullName.trim() || !email.trim() || !motivation.trim() || !cvFile || !letterFile}
            className="flex-1 bg-orange-500 hover:bg-orange-600 gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              'Envoyer ma candidature'
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};
