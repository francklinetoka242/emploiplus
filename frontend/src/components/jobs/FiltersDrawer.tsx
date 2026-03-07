import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, X } from 'lucide-react';

interface FiltersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: Record<string, any>) => void;
  type?: 'jobs' | 'services';
}

export function FiltersDrawer({ isOpen, onClose, onApply, type = 'jobs' }: FiltersDrawerProps) {
  const [localFilters, setLocalFilters] = useState({
    location: '',
    sector: '',
    company: '',
    salary: '',
    experience: '',
  });

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer - Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 border-b bg-white rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Filtres avancés</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Localisation
            </label>
            <Input
              placeholder="Ville ou région"
              value={localFilters.location}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, location: e.target.value })
              }
              className="w-full"
            />
          </div>

          {/* Sector / Category */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              {type === 'jobs' ? 'Secteur' : 'Catégorie'}
            </label>
            <Select
              value={localFilters.sector}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, sector: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous</SelectItem>
                {type === 'jobs' ? (
                  <>
                    <SelectItem value="IT">IT / Informatique</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Sales">Ventes</SelectItem>
                    <SelectItem value="HR">Ressources Humaines</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="tech">Technologie</SelectItem>
                    <SelectItem value="business">Affaires</SelectItem>
                    <SelectItem value="language">Langue</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {type === 'jobs' && (
            <>
              {/* Company */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Entreprise
                </label>
                <Input
                  placeholder="Nom de l'entreprise"
                  value={localFilters.company}
                  onChange={(e) =>
                    setLocalFilters({ ...localFilters, company: e.target.value })
                  }
                  className="w-full"
                />
              </div>

              {/* Salary */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Salaire min (FCFA)
                </label>
                <Input
                  type="number"
                  placeholder="ex: 1000"
                  value={localFilters.salary}
                  onChange={(e) =>
                    setLocalFilters({ ...localFilters, salary: e.target.value })
                  }
                  className="w-full"
                />
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Expérience
                </label>
                <Select
                  value={localFilters.experience}
                  onValueChange={(value) =>
                    setLocalFilters({ ...localFilters, experience: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les niveaux</SelectItem>
                    <SelectItem value="0">Débutant</SelectItem>
                    <SelectItem value="1-3">1-3 ans</SelectItem>
                    <SelectItem value="3-5">3-5 ans</SelectItem>
                    <SelectItem value="5+">5+ ans</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-4 border-t bg-white flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 bg-gradient-primary hover:opacity-90"
          >
            Appliquer les filtres
          </Button>
        </div>
      </div>
    </>
  );
}
