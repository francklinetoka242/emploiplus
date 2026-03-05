import { useEffect, useState } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Search, X } from 'lucide-react';

type Props = {
  onFilterChange?: (filters: Record<string, any>) => void;
};

export default function JobFilters({ onFilterChange }: Props) {
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');

  const [countries, setCountries] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [positions, setPositions] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.getJobs({ page: 1, limit: 1000 });
        const jobs = Array.isArray(res) ? res : (res?.data || []);
        if (!mounted) return;

        const countrySet = new Set<string>();
        const companySet = new Set<string>();
        const positionSet = new Set<string>();

        (jobs || []).forEach((j: any) => {
          const loc = String(j.location || '').trim();
          if (loc) {
            const parts = loc.split(',').map((p: string) => p.trim()).filter(Boolean);
            if (parts.length > 0) countrySet.add(parts[parts.length - 1]);
          }
          if (j.company) companySet.add(String(j.company));
          if (j.title) positionSet.add(String(j.title));
        });

        setCountries(Array.from(countrySet).sort());
        setCompanies(Array.from(companySet).sort());
        setPositions(Array.from(positionSet).sort());
      } catch (err) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Emit simplified payload using keys the backend supports
  useEffect(() => {
    const payload = {
      search,
      company: company || "",
      country: country || "",
      sector: (position || ""),
      recent: true,
    };
    if (onFilterChange) onFilterChange(payload);
  }, [search, company, country, position, onFilterChange]);

  const reset = () => {
    setSearch('');
    setCompany('');
    setCountry('');
    setPosition('');
  };

  const hasFilters = search.trim() !== '' || country !== '' || company !== '' || position !== '';

  return (
    <div className="w-full">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="bg-white shadow-md rounded-lg border p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <Input
                placeholder="Rechercher par mot-clé, titre, secteur..."
                value={search}
                onChange={(e: any) => setSearch(e.target.value)}
                className="h-10 text-sm flex-1"
              />
              {hasFilters && (
                <button
                  onClick={reset}
                  className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition flex-shrink-0"
                  title="Réinitialiser les filtres"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Pays</label>
                <Select value={country || 'none'} onValueChange={(v) => setCountry(v === 'none' ? '' : v)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Tous les pays" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tous les pays</SelectItem>
                    {countries.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Entreprise</label>
                <Select value={company || 'none'} onValueChange={(v) => setCompany(v === 'none' ? '' : v)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Toutes les entreprises" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Toutes les entreprises</SelectItem>
                    {companies.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Poste</label>
                <Select value={position || 'none'} onValueChange={(v) => setPosition(v === 'none' ? '' : v)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Tous les postes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tous les postes</SelectItem>
                    {positions.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
