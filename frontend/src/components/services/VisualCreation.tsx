import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, PenTool, Mail, GraduationCap, Layout, Lock, Star } from "lucide-react";
import BusinessCardModal from "@/components/BusinessCardModal";
import { useState, useEffect } from "react";
import { sendInteraction } from "@/lib/analytics";

interface VisualCreationProps {
  isLoggedIn?: boolean;
}

export default function VisualCreation({ isLoggedIn = false }: VisualCreationProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleRestrictedAction = (action: string) => {
    if (!isLoggedIn) {
      sendInteraction({ service: action, event_type: 'restricted_action_click' });
      navigate(`/connexion?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  };

  return (
    <section id="creation-visuelle" className={`py-16 ${isLoggedIn ? 'bg-gradient-to-br from-primary/5 via-white to-secondary/5' : 'bg-white'}`}>
      <div className="container">
        <div className="text-center mb-12">
        
          <h2 className="text-4xl font-bold mb-4">
            {isLoggedIn ? "Créez vos supports visuels" : "Création visuelle"}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Modèles éditables, export PNG/JPG et PDF. 
            {isLoggedIn && <span> Profitez de tous les outils avancés pour vos créations.</span>}
            {!isLoggedIn && <span> Connectez-vous pour débloquer les options supplémentaires.</span>}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          {/* Cartes de visite */}
          <Card className={`p-6 relative overflow-hidden transition-all hover:shadow-lg ${!isLoggedIn ? 'opacity-90' : ''}`}>
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Cartes de visite</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Éditeur recto/verso, icônes et logo, export PDF/image.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button 
                  onClick={() => {
                    sendInteraction({ service: 'business-card', event_type: 'create_click' });
                    if (!isLoggedIn) {
                      handleRestrictedAction('business-card');
                    } else {
                      setOpen(true);
                    }
                  }}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  {isLoggedIn ? "Créer une carte" : "Créer"}
                </Button>
                <Button 
                  variant="outline" 
                  asChild
                  onClick={() => sendInteraction({ service: 'business-card', event_type: 'view_models' })}
                >
                  <Link to="/services/business-card-models">Voir les modèles</Link>
                </Button>
              </div>
            </div>
          </Card>

          {/* Flyers */}
          <Card className={`p-6 relative overflow-hidden transition-all hover:shadow-lg ${!isLoggedIn ? 'opacity-90' : ''}`}>
            <div className="absolute top-0 right-0 w-20 h-20 bg-rose-100/50 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="h-12 w-12 rounded-lg bg-rose-100 flex items-center justify-center mb-4">
                <PenTool className="h-5 w-5 text-rose-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Flyers</h3>
              <p className="text-sm text-muted-foreground mb-4">
                3 modèles, textes multiples, images, tailles A4/A5/DL, export PNG/JPG/PDF.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button 
                  asChild 
                  className="bg-rose-600 text-white hover:bg-rose-700"
                  onClick={() => sendInteraction({ service: 'flyers', event_type: 'create_click' })}
                >
                  <Link to="/services/flyer-creator">Créer</Link>
                </Button>
                <Button 
                  variant="outline" 
                  asChild
                  onClick={() => sendInteraction({ service: 'flyers', event_type: 'view_templates' })}
                >
                  <Link to="/services/flyer-creator">Voir</Link>
                </Button>
              </div>
            </div>
          </Card>

          {/* Bannières */}
          <Card className={`p-6 relative overflow-hidden transition-all hover:shadow-lg ${!isLoggedIn ? 'opacity-90' : ''}`}>
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-100/50 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                <Mail className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Bannières</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Formats réseaux sociaux, alignement et couleurs personnalisables.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button 
                  asChild 
                  className="bg-indigo-600 text-white hover:bg-indigo-700"
                  onClick={() => sendInteraction({ service: 'banners', event_type: 'create_click' })}
                >
                  <Link to="/services/banner-creator">Créer</Link>
                </Button>
                <Button 
                  variant="outline" 
                  asChild
                  onClick={() => sendInteraction({ service: 'banners', event_type: 'view_templates' })}
                >
                  <Link to="/services/banner-creator">Voir</Link>
                </Button>
              </div>
            </div>
          </Card>

          {/* Portfolio - Nouveau */}
          <Card className={`p-6 relative overflow-hidden transition-all hover:shadow-lg ${!isLoggedIn ? 'opacity-90' : 'ring-2 ring-primary/30'}`}>
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-100/50 rounded-full -mr-10 -mt-10"></div>
            {isLoggedIn && (
              <div className="absolute top-3 right-3 bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                Premium
              </div>
            )}
            <div className="relative z-10">
              <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                <Layout className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Portfolio</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Galerie de projets, modèles réactifs, export PDF/HTML. Présentez votre meilleur travail.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button 
                  onClick={() => {
                    sendInteraction({ service: 'portfolio', event_type: 'create_click' });
                    if (!isLoggedIn) {
                      handleRestrictedAction('portfolio');
                    } else {
                      navigate('/services/portfolio-builder');
                    }
                  }}
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  {isLoggedIn ? "Créer" : <><Lock className="h-4 w-4 mr-1" />Créer</>}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    sendInteraction({ service: 'portfolio', event_type: 'view_templates' });
                    navigate('/services/portfolio-builder');
                  }}
                >
                  Voir les modèles
                </Button>
              </div>
              {!isLoggedIn && (
                <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Connectez-vous pour créer
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      <BusinessCardModal open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
