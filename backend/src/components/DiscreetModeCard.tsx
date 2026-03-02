import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import Icon from '@/components/Icon';
import { authHeaders, buildApiUrl } from '@/lib/headers';

interface DiscreetModeCardProps {
  userType: string;
  company?: string;
  companyId?: string;
  onStatusChange?: (enabled: boolean, companyId: string, companyName: string) => void;
}

export default function DiscreetModeCard({
  userType,
  company = '',
  companyId = '',
  onStatusChange,
}: DiscreetModeCardProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Charger l'état initial du mode discret
  useEffect(() => {
    const fetchDiscreetModeStatus = async () => {
      try {
        const headers = authHeaders('application/json');
        const res = await fetch(buildApiUrl('/users/me'), { headers });
        if (res.ok) {
          const data = await res.json();
          setIsEnabled(data.discreet_mode_enabled || false);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du mode discret:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userType === 'candidate') {
      fetchDiscreetModeStatus();
    } else {
      setLoading(false);
    }
  }, [userType]);

  const handleToggle = async () => {
    // Vérifier si une entreprise est sélectionnée
    if (!company || !companyId) {
      toast.error('Veuillez sélectionner une entreprise dans votre profil pour utiliser le mode Recherche Discrète');
      return;
    }

    setIsSaving(true);
    try {
      const headers = authHeaders('application/json');
      const newState = !isEnabled;

      const res = await fetch(buildApiUrl('/users/me'), {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          discreet_mode_enabled: newState,
          hidden_from_company_id: newState ? companyId : '',
          hidden_from_company_name: newState ? company : '',
        }),
      });

      if (!res.ok) throw new Error('Erreur lors de la mise à jour');

      setIsEnabled(newState);
      onStatusChange?.(newState, companyId, company);
      
      if (newState) {
        toast.success(`Vos activités sont désormais masquées pour les recruteurs de ${company}`);
      } else {
        toast.success('Mode Recherche Discrète désactivé');
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Erreur lors de la mise à jour');
      console.error('Erreur:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Ne rien afficher si ce n'est pas un candidat
  if (userType !== 'candidate') {
    return null;
  }

  if (loading) {
    return (
      <Card className="p-4 border-0 shadow-md bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="h-24 flex items-center justify-center">
          <span className="text-sm text-muted-foreground">Chargement...</span>
        </div>
      </Card>
    );
  }

  // Vérifier si l'entreprise est renseignée
  const hasCompany = !!company && !!companyId;

  return (
    <Card className={`p-4 border-0 shadow-md bg-gradient-to-br ${
      isEnabled 
        ? 'from-green-50 to-green-100 border-l-4 border-l-green-500' 
        : 'from-slate-50 to-slate-100'
    }`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${isEnabled ? 'bg-green-200' : 'bg-slate-200'}`}>
            {isEnabled ? (
              <EyeOff className="h-5 w-5 text-green-700" />
            ) : (
              <Eye className="h-5 w-5 text-slate-700" />
            )}
          </div>
          <div className="flex-1">
            <h3 className={`font-bold text-sm ${isEnabled ? 'text-green-900' : 'text-slate-900'}`}>
              <span className="inline-flex items-center gap-2"><Icon name="Lock" size={14} />Confidentialité de recherche</span>
            </h3>
            <p className={`text-xs mt-1 ${isEnabled ? 'text-green-800' : 'text-slate-600'}`}>
              Restez invisible auprès de votre employeur actuel
            </p>
          </div>
        </div>

        {/* Company Info */}
        {hasCompany && (
          <div className="p-2 bg-white/60 rounded-lg">
            <p className="text-xs font-semibold text-slate-700">Entreprise sélectionnée:</p>
            <p className="text-sm font-bold text-primary mt-0.5">{company}</p>
          </div>
        )}

        {/* Status Message */}
        {isEnabled && hasCompany && (
          <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-800">
              ✓ Vos activités (likes, commentaires, mises à jour) sont masquées pour les recruteurs de <span className="font-bold">{company}</span>
            </p>
          </div>
        )}

        {/* Warning Message */}
        {!hasCompany && (
          <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              Complétez votre <span className="font-semibold">profil professionnel</span> en sélectionnant votre entreprise pour utiliser cette fonctionnalité
            </p>
          </div>
        )}

        {/* Toggle Button */}
        <Button
          onClick={handleToggle}
          disabled={!hasCompany || isSaving}
          variant={isEnabled ? 'default' : 'outline'}
          className={`w-full text-sm font-semibold transition-all ${
            isEnabled
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : hasCompany
              ? 'bg-slate-100 hover:bg-slate-200'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          size="sm"
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 bg-white rounded-full animate-spin" />
              Mise à jour...
            </span>
          ) : isEnabled ? (
            <span className="flex items-center gap-2">
              <EyeOff className="h-4 w-4" />
              Désactiver
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Activer la protection
            </span>
          )}
        </Button>

        {/* Info Text */}
        <p className="text-xs text-slate-600 text-center">
          {hasCompany 
            ? isEnabled
              ? 'Vos autres activités restent visibles pour tous les autres recruteurs'
              : 'Activez pour rester invisible auprès de votre employeur'
            : 'Vous resterez visible pour tous les recruteurs'}
        </p>
      </div>
    </Card>
  );
}
