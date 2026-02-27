import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, ExternalLink, Phone } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Annuaire() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [sortBy, setSortBy] = useState<'az' | 'country' | 'city'>('az');
  const [loading, setLoading] = useState(false);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Erreur');
      const data = await res.json();
      // backend returns all users; filter companies
      const comps = Array.isArray(data) ? data.filter((u: any) => String(u.user_type).toLowerCase() === 'company') : [];
      setCompanies(comps);
    } catch (e) {
      setCompanies([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCompanies(); }, []);

  const filtered = companies.filter(c => {
    if (!q) return true;
    const hay = `${c.company_name || ''} ${c.city || ''} ${c.sector || ''}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  // Trier les résultats
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'az') {
      return (a.company_name || '').localeCompare((b.company_name || ''), 'fr');
    } else if (sortBy === 'country') {
      return (a.country || '').localeCompare((b.country || ''), 'fr');
    } else if (sortBy === 'city') {
      return (a.city || '').localeCompare((b.city || ''), 'fr');
    }
    return 0;
  });

  // Vérifie si une information est publique
  const isPublic = (company: any, field: string): boolean => {
    // Par défaut, afficher tous les champs publiquement
    // Sauf si explicitement défini à false dans public_settings
    const publicSettings = company.public_settings;
    if (!publicSettings) return true; // Si pas de settings, afficher par défaut
    if (typeof publicSettings === 'string') {
      try {
        const parsed = JSON.parse(publicSettings);
        return parsed[field] !== false;
      } catch {
        return true;
      }
    }
    return publicSettings[field] !== false;
  };

  return (
    <div className="container py-12 max-w-6xl">
      <h1 className="text-3xl font-bold mb-4">Annuaire des entreprises</h1>
      <p className="text-muted-foreground mb-6">Liste des entreprises enregistrées au Congo. Recherchez par nom, ville ou secteur.</p>

      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <Input value={q} onChange={(e:any)=>setQ(e.target.value)} placeholder="Rechercher entreprise, ville ou secteur..." className="flex-1" />
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={()=>setQ('')}>Effacer</Button>
          </div>
        </div>
        
        {/* Boutons de tri */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm font-semibold text-muted-foreground self-center">Trier par:</span>
          <Button 
            variant={sortBy === 'az' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSortBy('az')}
          >
            A-Z
          </Button>
          <Button 
            variant={sortBy === 'city' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSortBy('city')}
          >
            Ville
          </Button>
          <Button 
            variant={sortBy === 'country' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSortBy('country')}
          >
            Pays
          </Button>
        </div>
      </Card>

      {loading ? <p>Chargement...</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((c:any) => (
            <div key={c.id} className="block">
              <Card className="p-4 hover:shadow-lg transition h-full flex flex-col">
                {/* Logo et Nom de l'entreprise */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="shrink-0">
                    {c.profile_image_url && isPublic(c, 'company_logo') ? (
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={c.profile_image_url} alt={c.company_name} />
                        <AvatarFallback className="font-bold">
                          {String(c.company_name || '').split(/\s+/).slice(0, 2).map((word: string) => word.charAt(0)).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <Avatar className="h-14 w-14">
                        <AvatarFallback className="font-bold bg-primary/10 text-primary">
                          {String(c.company_name || '').split(/\s+/).slice(0, 2).map((word: string) => word.charAt(0)).join('').toUpperCase() || 'EC'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{c.company_name || 'Entreprise'}</h3>
                    {c.sector && (
                      <div className="text-sm text-muted-foreground mt-1">{c.sector}</div>
                    )}
                  </div>
                </div>

                {/* Taille de l'entreprise */}
                {c.company_size && (
                  <div className="text-sm text-muted-foreground mb-2">
                    👥 {c.company_size}
                  </div>
                )}

                {/* Description / À propos */}
                {c.description && (
                  <div className="text-sm text-muted-foreground mb-3">
                    {String(c.description).slice(0,140) + (String(c.description).length>140? '…':'')}
                  </div>
                )}

                {/* Localisation */}
                {(c.city || c.country) && (
                  <div className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> {[c.city, c.country].filter(Boolean).join(', ')}
                  </div>
                )}

                {/* Contact et actions */}
                <div className="mt-auto pt-4 border-t space-y-2">
                  <Link to={`/company/${c.id}`} className="block w-full text-center text-sm text-primary font-semibold hover:underline">
                    Voir la fiche complète
                  </Link>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {c.website && (
                      <a 
                        href={c.website} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> Site web
                      </a>
                    )}
                    {c.phone && (
                      <a 
                        href={`tel:${c.phone}`} 
                        className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" /> {String(c.phone).slice(0, 10)}...
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          ))}
          {sorted.length === 0 && <div className="text-muted-foreground">Aucune entreprise trouvée.</div>}
        </div>
      )}
    </div>
  );
}
