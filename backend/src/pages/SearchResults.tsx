import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Briefcase, FileText, GraduationCap } from "lucide-react";
import SearchBar from '@/components/SearchBar';
import { Button } from '@/components/ui/button';

export default function SearchResults() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const qParam = params.get('q') || '';
  const [query, setQuery] = useState(qParam);
  const [jobs, setJobs] = useState<any[]>([]);
  const [formations, setFormations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQuery(qParam);
  }, [qParam]);

  useEffect(() => {
    if (!query) {
      setJobs([]);
      setFormations([]);
      return;
    }
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        // jobs: use api.getJobs which supports q param
        const j = await api.getJobs({ q: query });
        if (!mounted) return;
        setJobs(Array.isArray(j) ? j : []);
      } catch (e) {
        setJobs([]);
      }
      try {
        const f = await api.getFormations();
        if (!mounted) return;
        if (Array.isArray(f)) {
          const filtered = f.filter((it: any) => {
            const hay = `${String(it.title || '')} ${String(it.description || '')} ${String(it.category || '')}`.toLowerCase();
            return hay.includes(query.toLowerCase());
          });
          setFormations(filtered);
        } else setFormations([]);
      } catch (e) {
        setFormations([]);
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [query]);

  const onSubmit = (e?: any) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!query || !String(query).trim()) return;
    // push new URL so app routing updates
    window.history.replaceState({}, '', `/search?q=${encodeURIComponent(String(query).trim())}`);
    // trigger effect by updating state
    setQuery(String(query).trim());
  };

  return (
    <div className="container py-12 max-w-6xl">
      <h1 className="text-3xl font-bold mb-4">Résultats de recherche</h1>
      <form onSubmit={onSubmit} className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1">
            <SearchBar value={String(query)} onChange={setQuery} placeholder="Rechercher emplois, services, formations..." />
          </div>
          <Button type="submit">Rechercher</Button>
        </div>
      </form>

      {loading && <p>Recherche en cours…</p>}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2"><Briefcase /> Emplois</h2>
            {jobs.length === 0 ? (
              <p className="text-muted-foreground">Aucun emploi trouvé pour "{query}"</p>
            ) : (
              <ul className="space-y-3">
                {jobs.slice(0,6).map((j: any) => (
                  <li key={j.id} className="p-3 border rounded">
                    <Link to={`/recrutement/postuler/${j.id}`} className="font-semibold">{j.title}</Link>
                    <div className="text-sm text-muted-foreground">{j.company} — {j.location}</div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3">
              <Link to={`/emplois?q=${encodeURIComponent(query)}`} className="text-primary">Voir tous les emplois</Link>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2"><FileText /> Services</h2>
            <p className="text-muted-foreground mb-2">Les services correspondent au contenu du site.</p>
            <div>
              <Link to={`/services?q=${encodeURIComponent(query)}`} className="text-primary">Rechercher dans les services</Link>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2"><FileText /> Paramètres</h2>
            <p className="text-muted-foreground mb-2">Rechercher dans votre espace de paramètres.</p>
            <div>
              <Link to={`/parametres?q=${encodeURIComponent(query)}`} className="text-primary">Rechercher dans les paramètres</Link>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2"><GraduationCap /> Formations</h2>
            {formations.length === 0 ? (
              <p className="text-muted-foreground">Aucune formation trouvée pour "{query}"</p>
            ) : (
              <ul className="space-y-3">
                {formations.slice(0,6).map((f: any, idx: number) => (
                  <li key={idx} className="p-3 border rounded">
                    <div className="font-semibold">{f.title}</div>
                    <div className="text-sm text-muted-foreground">{f.category}</div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3">
              <Link to={`/formations?q=${encodeURIComponent(query)}`} className="text-primary">Voir toutes les formations</Link>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
