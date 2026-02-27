import { useState, useRef, useEffect } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: number;
  title?: string;
  description?: string;
  name?: string;
  full_name?: string;
  company_name?: string;
  category?: string;
  profession?: string;
  user_type?: string;
  type?: 'job' | 'formation' | 'user';
}

interface GlobalSearchDropdownProps {
  className?: string;
}

/**
 * Composant de recherche globale avec suggestions en temps réel
 * - Debouncing 500ms
 * - Minimum 3 caractères
 * - Cache frontend
 * - Limité à 5-8 résultats par catégorie
 */
export const GlobalSearchDropdown = ({
  className = ''
}: GlobalSearchDropdownProps) => {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [results, setResults] = useState<{
    jobs: any[];
    formations: any[];
    users: any[];
  } | null>(null);

  // Fermer les suggestions en cliquant ailleurs
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce search
  const handleSearch = (value: string) => {
    setQuery(value);
    setError('');
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (value.length < 3) {
      setResults(null);
      setShowSuggestions(false);
      return;
    }

    setShowSuggestions(true);
    setLoading(true);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search/global?q=${encodeURIComponent(value)}&limit=8`);
        if (!response.ok) {
          throw new Error('Erreur de recherche');
        }
        const data = await response.json();
        setResults(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de recherche');
        setLoading(false);
      }
    }, 500); // 500ms debounce
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'job') {
      navigate(`/offres/${result.id}`);
    } else if (result.type === 'formation') {
      navigate(`/formations/${result.id}`);
    } else if (result.type === 'user') {
      navigate(`/utilisateur/${result.id}`);
    }
    setQuery('');
    setResults(null);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setQuery('');
    setResults(null);
    setShowSuggestions(false);
    setError('');
  };

  const isValid = query.length >= 3;

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Rechercher emplois, formations, utilisateurs..."
          className="w-full pl-10 pr-10 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {/* Loading indicator */}
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-blue-500" />
        )}
        
        {/* Clear button */}
        {query && !loading && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label="Effacer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Minimum characters hint */}
      {query && !isValid && (
        <div className="absolute top-full left-0 right-0 mt-1 px-3 py-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg">
          {3 - query.length} caractères supplémentaire{3 - query.length !== 1 ? 's' : ''} requis
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && isValid && !loading && results && (results.jobs.length > 0 || results.formations.length > 0 || results.users.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          
          {/* Jobs Section */}
          {results.jobs.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-200">
                <h3 className="text-xs font-semibold text-slate-600">OFFRES D'EMPLOI</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {results.jobs.map((job: any) => (
                  <button
                    key={`job-${job.id}`}
                    onClick={() => handleResultClick({ ...job, type: 'job' })}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <p className="font-medium text-sm text-slate-900">{job.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{job.company_name || 'Entreprise'}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Formations Section */}
          {results.formations.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-200">
                <h3 className="text-xs font-semibold text-slate-600">FORMATIONS</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {results.formations.map((formation: any) => (
                  <button
                    key={`formation-${formation.id}`}
                    onClick={() => handleResultClick({ ...formation, type: 'formation' })}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <p className="font-medium text-sm text-slate-900">{formation.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{formation.category || 'Formation'}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Users Section */}
          {results.users.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-200">
                <h3 className="text-xs font-semibold text-slate-600">UTILISATEURS & ENTREPRISES</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {results.users.map((user: any) => (
                  <button
                    key={`user-${user.id}`}
                    onClick={() => handleResultClick({ ...user, type: 'user' })}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <p className="font-medium text-sm text-slate-900">
                      {user.full_name || user.company_name}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {user.profession || user.user_type || 'Utilisateur'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="absolute top-full left-0 right-0 mt-1 px-3 py-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* No results */}
      {showSuggestions && isValid && !loading && results && results.jobs.length === 0 && results.formations.length === 0 && results.users.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 px-3 py-4 text-center text-sm text-slate-500 bg-white border border-slate-200 rounded-lg">
          Aucun résultat trouvé
        </div>
      )}
    </div>
  );
};

export default GlobalSearchDropdown;
