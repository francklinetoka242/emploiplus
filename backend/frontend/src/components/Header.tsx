import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SearchBar from '@/components/SearchBar';
import GlobalSearchDropdown from '@/components/GlobalSearchDropdown';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { authHeaders, buildApiUrl } from '@/lib/headers';
import { Menu, X, Briefcase, User, LogOut, Settings, Bell, Search, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useMessaging } from "@/hooks/useMessaging";
import NotificationDropdown from '@/components/NotificationDropdown';
import LanguageToggle from '@/components/LanguageToggle';

interface UserProfile {
  id?: number;
  full_name?: string;
  company_name?: string;
  profile_image_url?: string;
  user_type?: string;
}

interface Notification {
  id: number;
  read: boolean;
}

interface NavLink {
  path: string;
  label: string;
  children?: NavLink[];
}

const AccountQuickMenu = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);

  // Fetch user profile on mount
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          const token = localStorage.getItem('token');
          const headers: Record<string,string> = {};
          Object.assign(headers, authHeaders());
          const res = await fetch(buildApiUrl('/users/me'), { headers });
          if (res.ok) {
            const data: UserProfile = await res.json();
            setProfileData(data);
          }
        } catch (err) {
          console.error('Failed to fetch profile:', err);
        }
      };
      fetchProfile();
    }
  }, [user, location.pathname]);

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isCompany = String(profileData?.user_type).toLowerCase() === 'company';
  const displayName = isCompany ? profileData?.company_name : profileData?.full_name;
  
  const initials = (displayName || user.email)
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, isCompany ? 2 : 2);

  return (
    <div className="relative ml-3">
      <button
        onClick={() => setOpen(!open)}
        className="p-1 rounded-full hover:bg-muted/50 transition-colors"
        aria-label="Menu compte"
      >
        <Avatar className="h-9 w-9">
          <AvatarImage src={profileData?.profile_image_url || undefined} alt={displayName} />
          <AvatarFallback className={`text-xs font-semibold ${isCompany ? 'bg-primary/10 text-primary' : ''}`}>{initials}</AvatarFallback>
        </Avatar>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-md border bg-background shadow-lg z-50">
          {isCompany && (
            <Link to="/parametres/profil-entreprise" className="flex items-center px-3 py-2 text-sm hover:bg-muted/50 transition-colors border-b" onClick={() => setOpen(false)}>
              <Settings className="h-4 w-4 mr-2" /> Mon profil entreprise
            </Link>
          )}
          <Link to="/parametres" className="flex items-center px-3 py-2 text-sm hover:bg-muted/50 transition-colors" onClick={() => setOpen(false)}>
            <Settings className="h-4 w-4 mr-2" /> Paramètres
          </Link>
          <Link to="/a-propos" className="flex items-center px-3 py-2 text-sm hover:bg-muted/50 transition-colors" onClick={() => setOpen(false)}>
            <User className="h-4 w-4 mr-2" /> À propos
          </Link>
          <Link to="/contact" className="flex items-center px-3 py-2 text-sm hover:bg-muted/50 transition-colors" onClick={() => setOpen(false)}>
            <Briefcase className="h-4 w-4 mr-2" /> Contact
          </Link>
          <button onClick={handleSignOut} className="w-full text-left flex items-center px-3 py-2 text-sm hover:bg-muted/50 transition-colors border-t">
            <LogOut className="h-4 w-4 mr-2" /> Déconnexion
          </button>
        </div>
      )}
    </div>
  );
};

const Header = () => {
  const location = useLocation();
    const path = location.pathname;
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const { role } = useUserRole(user);
  const { unreadCount: messageUnreadCount } = useMessaging();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    const fetchCount = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers: Record<string,string> = {};
        Object.assign(headers, authHeaders());
        const res = await fetch(buildApiUrl('/notifications'), { headers });
        if (!res.ok) return;
        const data = await res.json() as Notification[];
        if (!mounted) return;
        const count = (data || []).filter((n: Notification) => !n.read).length;
        setUnreadCount(count);
      } catch (e) {
        console.error('Fetch notifications count error', e);
      }
    };

    // If currently on notifications page, clear badge locally (do not mark server-side)
    if (location.pathname === '/notifications') {
      setUnreadCount(0);
    } else {
      fetchCount();
    }

    const iv = setInterval(() => {
      if (location.pathname !== '/notifications') fetchCount();
    }, 30_000);

    const onUpdated = () => {
      if (location.pathname === '/notifications') {
        setUnreadCount(0);
      } else {
        fetchCount();
      }
    };
    window.addEventListener('notifications-updated', onUpdated);

    return () => { mounted = false; clearInterval(iv); window.removeEventListener('notifications-updated', onUpdated); };
  }, [user, location.pathname]);

    // Minimal header for auth pages
    if (path === '/connexion' || path === '/inscription' || path === '/register' || path === '/login') {
      return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95">
          <nav className="container flex h-16 items-center justify-start">
            <Link to="/" className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg">
                <img src="/Logo.png" alt="Logo Emploi+" />
              </div>
            </Link>
          </nav>
        </header>
      );
    }

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  const performSearch = (q?: string) => {
    const query = String(q ?? globalSearch ?? '').trim();
    if (!query) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setMobileMenuOpen(false);
  };

  const getNavLinks = () => {
    // Standard ordered navigation required by product: Accueil, Emplois, Services, Formations, À propos, Contact
    const base = [
      { path: "/", label: "Accueil" },
      { path: "/emplois", label: "Emplois" },
      { path: "/services", label: "Services" },
      { path: "/resources", label: "Ressources", children: [ { path: '/annuaire', label: 'Annuaire' }, { path: '/documents', label: 'Documentation' } ] },
      { path: "/formations", label: "Formations" },
      { path: "/a-propos", label: "À propos" },
      { path: "/contact", label: "Contact" },
    ];

    // If no user, show base nav
    if (!user) return base;

    // For authenticated users we remove About/Contact from the main nav (they will be in profile menu)
    const filtered = base.filter((l) => l.path !== '/a-propos' && l.path !== '/contact');
    
    // For candidates, show only newsfeed (not both newsfeed and accueil)
    if (role === 'candidate') {
      return [
        { path: "/fil-actualite", label: "Fil d'actualité" },
        { path: "/connexions", label: "Connexions" },
        { path: "/emplois", label: "Emplois" },
        { path: "/services", label: "Services" },
        { path: "/resources", label: "Ressources", children: [ { path: '/annuaire', label: 'Annuaire' }, { path: '/documents', label: 'Documents' } ] },
        { path: "/formations", label: "Formations" },
      ];
    }

    // For companies, use custom order: Fil d'actualité, Service, Recrutement, Candidats
    if (role === 'company') {
      return [
        { path: "/fil-actualite", label: "Fil d'actualité" },
        { path: "/connexions", label: "Connexions" },
        { path: "/services", label: "Service" },
        { path: "/recrutement", label: "Recrutement" },
        { path: "/candidats", label: "Candidats" },
      ];
    }

    // Admin roles: keep admin entry then newsfeed
    if (role === 'super_admin' || role === 'admin_offers' || role === 'admin_users') {
      return [
        { path: "/admin", label: "Admin" },
        { path: "/fil-actualite", label: "Fil d'actualité" },
        ...filtered
      ];
    }

    return base;
  };

  const navLinks = getNavLinks();
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="hidden md:block sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg">
              <img src="/Logo.png" alt="Logo Emploi+" />
            </div>
          </Link>
        </div>


        {/* Desktop Navigation */}
        <div className="hidden items-center md:flex" style={{ marginLeft: '2rem', gap: '1.5rem' }}>
          {navLinks.map((link, index) => {
            if (!user && link.path === '/resources') return null;
            if (link.path === '/services') {
              return (
                <div 
                  key={link.path} 
                  className="relative"
                  onMouseEnter={() => setOpenMenu('services')}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <Link to="/services" className={`text-sm font-medium transition-colors px-2 py-1 rounded ${isActive('/services') ? 'text-primary' : 'text-muted-foreground'} `}>{link.label}</Link>
                  {openMenu === 'services' && (
                    <div className="absolute left-0 mt-2 w-64 rounded-md border bg-white shadow-lg z-50">
                      <div className="flex flex-col p-2 space-y-1">
                       <a href="/services#optimisation-candidature" className="px-3 py-2 text-sm rounded hover:bg-gray-50">Optimisation Candidature</a>
                       <a href="/services#Entretiens-preparation" className="px-3 py-2 text-sm rounded hover:bg-gray-50">Entretiens</a>
                        <a href="/services#creation-visuelle" className="px-3 py-2 text-sm rounded hover:bg-gray-50">créations visuelles</a>
                        <a href="/services#numeriques" className="px-3 py-2 text-sm rounded hover:bg-gray-50">Services Numériques</a>
                        <div className="border-t my-1" />
                        <a href="/contact" className="px-3 py-2 text-sm rounded hover:bg-gray-50">Assistance par experts</a>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            if ((link as NavLink & { children?: NavLink[] }).children) {
              return (
                <div 
                  key={link.path} 
                  className="relative"
                  onMouseEnter={() => setOpenMenu(link.label)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <button className={`text-sm font-medium transition-colors px-2 py-1 rounded ${isActive(link.path) ? 'text-primary' : 'text-muted-foreground'}`}>
                    {link.label}
                  </button>
                  {openMenu === link.label && (
                    <div className="absolute left-0 mt-2 w-44 rounded-md border bg-white shadow-lg z-50">
                      <div className="flex flex-col p-2 space-y-1">
                        {((link as NavLink & { children?: NavLink[] }).children || []).map((c: NavLink) => (
                          <Link key={c.path} to={c.path} className="px-3 py-2 text-sm rounded hover:bg-gray-50">{c.label}</Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.path) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop Auth Buttons - Icons & Profile */}
        <div className="hidden items-center md:flex gap-2">
          {user ? (
            <>
              {/* Icons Group (Search, Messages, Notifications) */}
              <div className="flex items-center space-x-1 pr-4 border-r border-border">
                {/* Search Button */}
                {!searchOpen && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setSearchOpen(true)} 
                    className="text-slate-500 hover:text-primary"
                    title="Rechercher"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                )}
                {searchOpen && (
                  <div className="relative w-96">
                    <GlobalSearchDropdown 
                      className="w-full"
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => { setSearchOpen(false); setGlobalSearch(''); }}
                      className="absolute right-0 top-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                {/* Messages */}
                <Link 
                  to="/messages" 
                  className="relative p-2 text-muted-foreground hover:text-primary transition-colors"
                  title="Messagerie"
                >
                  <MessageCircle size={20} />
                  {messageUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {messageUnreadCount > 9 ? '9+' : messageUnreadCount}
                    </span>
                  )}
                </Link>
                
                {/* Notifications */}
                <NotificationDropdown />
              </div>
              
              {/* Profile Menu with spacing */}
              <div className="ml-2">
                <AccountQuickMenu />
              </div>
            </>
          ) : null}
        </div>

        {/* Language toggle on the right (desktop) */}
        <div className="hidden md:flex items-center ml-4">
          <LanguageToggle />
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="container space-y-3 py-4">
            {user && (
              <div className="px-2">
                <SearchBar value={globalSearch} onChange={setGlobalSearch} placeholder={role === 'company' ? 'Rechercher candidatures...' : 'Rechercher emplois, services...'} />
                <div className="mt-2 flex gap-2">
                  <Button onClick={() => performSearch()} size="sm"><Search className="h-4 w-4" /></Button>
                </div>
              </div>
            )}
            {navLinks.map((link) => {
              if ((link as NavLink & { children?: NavLink[] }).children) {
                return (
                  <div key={link.path} className="space-y-1">
                    <div className="py-2 text-sm font-medium text-muted-foreground">{link.label}</div>
                    {((link as NavLink & { children?: NavLink[] }).children || []).map((c: NavLink) => (
                      <Link key={c.path} to={c.path} className="block py-2 pl-4 text-sm font-medium transition-colors text-muted-foreground hover:text-primary" onClick={() => setMobileMenuOpen(false)}>{c.label}</Link>
                    ))}
                  </div>
                );
              }

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block py-2 text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            {user && (
              <div className="flex flex-col space-y-2 pt-2 border-t border-border mt-4">
                <Button variant="ghost" asChild>
                  <Link to="/compte" onClick={() => setMobileMenuOpen(false)}>
                    <User className="h-4 w-4 mr-2" />
                    Compte
                  </Link>
                </Button>
                <Button variant="ghost" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
