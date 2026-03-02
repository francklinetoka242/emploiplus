import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Eye, EyeOff, Lock, Shield } from 'lucide-react';
import CompanySearch from '@/components/CompanySearch';
import { toast } from 'sonner';
import { authHeaders } from '@/lib/headers';

interface DiscreetModeProps {
  isEnabled: boolean;
  hiddenFromCompanyId: string;
  hiddenFromCompanyName: string;
  onUpdate: (data: {
    isEnabled: boolean;
    hiddenFromCompanyId: string;
    hiddenFromCompanyName: string;
  }) => void;
  currentCompanyId?: string;
  currentCompanyName?: string;
  isSaving?: boolean;
}

export default function DiscreetModeSettings({
  isEnabled,
  hiddenFromCompanyId,
  hiddenFromCompanyName,
  onUpdate,
  currentCompanyId,
  currentCompanyName,
  isSaving = false,
}: DiscreetModeProps) {
  const [localEnabled, setLocalEnabled] = useState(isEnabled);
  const [selectedCompanyId, setSelectedCompanyId] = useState(hiddenFromCompanyId);
  const [selectedCompanyName, setSelectedCompanyName] = useState(hiddenFromCompanyName);
  const [showDetails, setShowDetails] = useState(false);

  const handleToggle = (enabled: boolean) => {
    setLocalEnabled(enabled);
    if (!enabled) {
      // When disabling, clear the company
      setSelectedCompanyId('');
      setSelectedCompanyName('');
      onUpdate({
        isEnabled: false,
        hiddenFromCompanyId: '',
        hiddenFromCompanyName: '',
      });
    }
  };

  const handleCompanySelect = (company: { name: string; id: string }) => {
    setSelectedCompanyId(company.id);
    setSelectedCompanyName(company.name);

    if (company.id) {
      onUpdate({
        isEnabled: true,
        hiddenFromCompanyId: company.id,
        hiddenFromCompanyName: company.name,
      });
    }
  };

  const handleManualEntry = (companyName: string) => {
    setSelectedCompanyName(companyName);
    setSelectedCompanyId(''); // Manual entries don't have IDs

    onUpdate({
      isEnabled: true,
      hiddenFromCompanyId: '',
      hiddenFromCompanyName: companyName,
    });
  };

  const isSameAsCurrentCompany =
    selectedCompanyId && currentCompanyId && selectedCompanyId === currentCompanyId;

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-slate-900">
                Mode Recherche Discrète
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Cachez votre profil à votre employeur actuel tout en restant visible pour les autres recruteurs
              </p>
            </div>
          </div>
          <Switch
            checked={localEnabled}
            onCheckedChange={handleToggle}
            disabled={isSaving}
          />
        </div>
      </Card>

      {/* Benefits Section */}
      {!localEnabled && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex gap-2 mb-3">
            <Eye className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-sm text-blue-900">Avantages du Mode Discrète</p>
              <ul className="text-sm text-blue-800 mt-2 space-y-1 ml-4">
                <li>✓ Votre profil est caché à votre entreprise actuelle</li>
                <li>✓ Vous restez visible pour tous les autres recruteurs</li>
                <li>✓ Vos candidatures sont discrètes et sécurisées</li>
                <li>✓ Parfait pour les profils seniors qui changent d'emploi</li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Active Mode Details */}
      {localEnabled && (
        <Card className="p-6 border-purple-300 bg-white">
          <div className="space-y-4">
            {/* Company Selection */}
            <div>
              <CompanySearch
                value={selectedCompanyName}
                companyId={selectedCompanyId}
                onSelect={handleCompanySelect}
                onManualEntry={handleManualEntry}
                label="Entreprise à cacher *"
                description="Sélectionnez l'entreprise dont vous voulez rester invisible"
                required={true}
                disabled={isSaving}
              />
            </div>

            {/* Validation */}
            {selectedCompanyName && (
              <div className="space-y-2">
                {isSameAsCurrentCompany ? (
                  <Alert className="bg-green-50 border-green-300">
                    <AlertDescription className="text-green-800 text-sm">
                      <p className="font-medium">✓ Bon choix!</p>
                      <p className="mt-1">
                        Vous êtes en poste chez {selectedCompanyName} et êtes maintenant invisible pour eux.
                      </p>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="bg-amber-50 border-amber-300">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800 text-sm">
                      Assurez-vous que {selectedCompanyName} est bien votre entreprise actuelle.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Status Display */}
            {selectedCompanyName && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Profil caché pour:</span>
                  <Badge variant="default" className="gap-1">
                    <EyeOff className="h-3 w-3" />
                    {selectedCompanyName}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600">
                  Votre profil n'apparaîtra pas dans les recherches de candidats de cette entreprise.
                </p>
              </div>
            )}

            {/* Warning */}
            <Alert className="bg-amber-50 border-amber-300">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 text-sm">
                <p className="font-medium">⚠️ Important</p>
                <ul className="mt-2 space-y-1 ml-4">
                  <li>• Vous ne pourrez pas candidater auprès de cette entreprise tant que ce mode est actif</li>
                  <li>• Vos candidatures antérieures restent visibles</li>
                  <li>• Vous pouvez désactiver ce mode à tout moment</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </Card>
      )}

      {/* Deactivated State Info */}
      {!localEnabled && hiddenFromCompanyName && (
        <Alert className="bg-slate-50 border-slate-300">
          <AlertDescription className="text-slate-800 text-sm">
            <p className="font-medium">Mode Discrète précédemment activé pour:</p>
            <p className="mt-1">{hiddenFromCompanyName}</p>
            <p className="mt-2 text-xs">Vous êtes maintenant visible pour tous les recruteurs.</p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
