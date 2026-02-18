import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Briefcase, Users, Award, TrendingUp, Building2, GraduationCap, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { PWALayout } from "@/components/layout/PWALayout";
import { useEffect } from "react";
import HeroBanner from "@/components/HeroBanner";
import Realizations from "@/components/Realizations";
import Publications from "@/components/Publications";
import DashboardNewsfeed from "@/components/DashboardNewsfeed";
import logoMonango from "@/assets/logo_monago.jpg";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // If user is logged in, redirect to newsfeed
  useEffect(() => {
    if (user) {
      navigate('/fil-actualite', { replace: true });
    }
  }, [user, navigate]);

  // Otherwise, show standard home page
  return (
    <PWALayout notificationCount={0} messageCount={0}>

      <div className="flex flex-col ">
        <HeroBanner />

      {/* Mission & Values */}
      <section className="py-20 bg-background">
        <div className="w-full px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Notre mission
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simplifier la recherche d'emploi et faciliter le recrutement en offrant des outils innovants et efficaces.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
           
           <a href="/emplois">
            <Card className="p-6 space-y-4 border-2 hover:border-primary transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-xl">Publication d'offres d'emploi</h3>
              <p className="text-sm text-muted-foreground">
                Recevez des offres d'emploi adaptée à votre profil.
              </p>
            </Card>

            </a>
<a href="">
            <Card className="p-6 space-y-4 border-2 hover:border-secondary transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-xl">Recrutement facilité</h3>
              <p className="text-sm text-muted-foreground">
                Trouvez les meilleurs profils grâce à nos outils de recherche avancés.
              </p>
            </Card>
</a>
<a href="/services">
            <Card className="p-6 space-y-4 border-2 hover:border-primary transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-xl">Services numériques</h3>
              <p className="text-sm text-muted-foreground">
                Bénéficiez de nos services de rédaction, conception et conseil.
              </p>
            </Card>
</a>

<a href="">
            <Card className="p-6 space-y-4 border-2 hover:border-secondary transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-xl">Information multicanal</h3>
              <p className="text-sm text-muted-foreground">
                Restez informé des opportunités via nos différents canaux.
              </p>
            </Card>

            </a>

          </div>
        </div>
      </section>

      {/* Why Emploi+ */}
      <section className="py-20 bg-muted/30">
        <div className="w-full px-4">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
           
           
           
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-medium bg-black">
              <video 
                width="100%" 
                height="100%" 
                controls 
                className="w-full h-full object-cover"
              >
                <source src="https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4" type="video/mp4" />
                Votre navigateur ne supporte pas la balise vidéo.
              </video>
            </div>
            

            
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Pourquoi choisir <span className="text-primary">Emploi+</span> ?
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <span className="font-bold text-primary">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Plateforme locale</h3>
                    <p className="text-sm text-muted-foreground">
                      Spécialisée dans le marché du travail congolais et de la sous-région.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/10">
                    <span className="font-bold text-secondary">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Outils complets</h3>
                    <p className="text-sm text-muted-foreground">
                      De la création de CV à la recherche d'emploi, tout en un seul endroit.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <span className="font-bold text-primary">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Accompagnement personnalisé</h3>
                    <p className="text-sm text-muted-foreground">
                      Nos experts vous accompagnent dans votre recherche d'emploi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-16 bg-background">
        <div className="w-full px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Nos partenaires</h2>
          
          <div className="flex justify-center items-center gap-12 flex-wrap opacity- ">
           
           <div className="h-14 w-24 rounded-lg bg-muted flex items-center justify-center">
              <img src={logoMonango} alt="Logo MONANGO" />
            </div> 
            <div className="h-14 w- rounded-lg bg-muted flex items-center justify-center">
              <img src="/partnerLJEC.png" alt="Logo LJEC" />
            </div>

          </div>
        </div>
      </section>

      {/* Publications / Newsfeed (instead of Realizations on Home) */}
      <Publications />
    </div>
    </PWALayout>
  );
};

export default Home;
