import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Plus, X, Building2, Check } from 'lucide-react';
import { authHeaders } from '@/lib/headers';
import { cn } from '@/lib/utils';

interface CompanySearchProps {
  value: string;
  companyId: string;
  onSelect: (company: { name: string; id: string }) => void;
  onManualEntry: (name: string) => void;
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function CompanySearch({
  value,
  companyId,
  onSelect,
  onManualEntry,
  label = 'Entreprise *',
  description = 'Sélectionnez votre entreprise actuelle ou saisissez son nom',
  required = true,
  disabled = false,
}: CompanySearchProps) {
  const [searchInput, setSearchInput] = useState(value);
  const [companies, setCompanies] = useState<Array<{ id: string; name: string; logo?: string }>>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualCompanyName, setManualCompanyName] = useState('');

  // Fetch all companies on mount
  useEffect(() => {
    fetchCompanies('');
  }, []);

  const fetchCompanies = useCallback(async (searchQuery: string = '') => {
    try {
      setIsLoadingCompanies(true);
      const headers = authHeaders('application/json');
      
      // Utiliser l'endpoint de recherche d'entreprises optimisé
      const url = new URL('/api/companies/search', window.location.origin);
      if (searchQuery.trim()) {
        url.searchParams.append('q', searchQuery);
      }
      
      const res = await fetch(url.toString(), { headers });

      if (res.ok) {
        const data = await res.json();
        const companyList = Array.isArray(data)
          ? data.map((company: any) => ({
              id: company.id,
              name: company.company_name || company.name || company.full_name || company.email,
              logo: company.logo_url || company.profile_image_url,
            }))
          : [];
        setCompanies(companyList);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setIsLoadingCompanies(false);
    }
  }, []);

  // Filter companies based on search input
  useEffect(() => {
    if (searchInput.trim().length === 0) {
      setCompanies([]);
      return;
    }

    // Recherche en temps réel via l'API
    const searchTimer = setTimeout(() => {
      fetchCompanies(searchInput);
    }, 300); // Debounce de 300ms

    return () => clearTimeout(searchTimer);
  }, [searchInput, fetchCompanies]);

  const handleSelectCompany = (company: { id: string; name: string; logo?: string }) => {
    setSearchInput(company.name);
    onSelect(company);
    setShowDropdown(false);
    setShowManualEntry(false);
  };

  const handleManualEntry = () => {
    if (manualCompanyName.trim()) {
      onManualEntry(manualCompanyName);
      setSearchInput(manualCompanyName);
      setManualCompanyName('');
      setShowManualEntry(false);
      setShowDropdown(false);
    }
  };

  const handleClear = () => {
    setSearchInput('');
    setShowDropdown(false);
    setShowManualEntry(false);
    onSelect({ name: '', id: '' });
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor="company-search" className="text-base">
          {label}
        </Label>
      )}

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      <div className="relative">
        {/* Search Input */}
        <div className="relative flex items-center">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            id="company-search"
            type="text"
            placeholder="Tapez le nom de votre entreprise..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            disabled={disabled}
            className="pl-10 pr-10"
          />
          {searchInput && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Dropdown with suggestions */}
        {showDropdown && searchInput.trim().length > 0 && (
          <Card className="absolute z-50 w-full top-full mt-1 p-0 shadow-lg">
            {/* Loading State */}
            {isLoadingCompanies && (
              <div className="p-3 text-center">
                <p className="text-sm text-muted-foreground">Recherche en cours...</p>
              </div>
            )}

            {/* Companies List */}
            {!isLoadingCompanies && companies.length > 0 && (
              <div className="border-b">
                <div className="p-2 text-xs font-semibold text-muted-foreground uppercase px-3 pt-2">
                  Entreprises inscrites ({companies.length})
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {companies.map((company) => (
                    <button
                      key={company.id}
                      onClick={() => handleSelectCompany(company)}
                      className={cn(
                        'w-full text-left px-3 py-3 hover:bg-slate-100 transition-colors flex items-center gap-2 border-b last:border-b-0',
                        companyId === company.id && 'bg-primary/5 border-l-4 border-l-primary'
                      )}
                    >
                      {company.logo && (
                        <img
                          src={company.logo}
                          alt={company.name}
                          className="h-6 w-6 rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{company.name}</p>
                      </div>
                      {companyId === company.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {!isLoadingCompanies && companies.length === 0 && (
              <div className="p-3">
                <div className="text-center py-2">
                  <p className="text-sm text-muted-foreground mb-3">
                    Aucune entreprise trouvée
                  </p>
                </div>
              </div>
            )}

            {/* Manual Entry Option */}
            <div className="border-t p-2">
              {!showManualEntry ? (
                <button
                  onClick={() => setShowManualEntry(true)}
                  className="w-full px-3 py-2 hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-medium text-primary"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter une entreprise manuelle
                </button>
              ) : (
                <div className="space-y-2 p-1">
                  <Input
                    type="text"
                    placeholder="Nom de l'entreprise"
                    value={manualCompanyName}
                    onChange={(e) => setManualCompanyName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleManualEntry();
                      }
                    }}
                    className="text-sm"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleManualEntry}
                      disabled={!manualCompanyName.trim()}
                    >
                      Ajouter
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowManualEntry(false);
                        setManualCompanyName('');
                      }}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Selected Company Badge */}
      {value && companyId && (
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Check className="h-3 w-3" />
            Sélectionné: {value}
          </Badge>
        </div>
      )}

      {/* Warning if manual entry */}
      {value && !companyId && (
        <div className="flex items-start gap-2 mt-2 p-2 bg-amber-50 rounded-md border border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Entreprise personnalisée</p>
            <p className="text-xs mt-1">
              "{value}" n'est pas inscrite sur notre plateforme.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
