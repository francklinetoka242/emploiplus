import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MessageSquare, Info } from "lucide-react";
import Realizations from "@/components/Realizations";
import CareerTools from "@/components/services/CareerTools";


interface Channel {
  id: number;
  channel_name: string;
  channel_url: string;
  channel_type: string;
  icon_name: string;
}

export default function ServicesNumeriques() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await fetch("/api/channels");
        const data = await res.json();
        setChannels(data);
      } catch (err) {
        console.error("Error fetching channels:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Back Button */}
      <section className="py-4 bg-background border-b">
        <div className="container">
          <Button variant="ghost" asChild className="gap-2">
            <Link to="/services">
              <ArrowLeft className="h-4 w-4" />
              Retour aux services
            </Link>
          </Button>
        </div>
      </section>

      {/* Quick Creators */}
      <section className="py-12 bg-background">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Outils de création</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Cartes de visite</h3>
              <p className="text-sm text-muted-foreground mb-3">Créez et exportez vos cartes de visite.</p>
              <Button asChild className="w-full"><Link to="/services/business-card-editor">Ouvrir</Link></Button>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">Flyers</h3>
              <p className="text-sm text-muted-foreground mb-3">Générez des flyers adaptés à vos campagnes.</p>
              <Button asChild className="w-full"><Link to="/services/flyer-creator">Ouvrir</Link></Button>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">Bannières</h3>
              <p className="text-sm text-muted-foreground mb-3">Créez des bannières pour réseaux sociaux.</p>
              <Button asChild className="w-full"><Link to="/services/banner-creator">Ouvrir</Link></Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Career Tools */}
      <CareerTools />

      {/* Hero */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container max-w-4xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">
              Services <span className="text-primary">Numériques & Web</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Tout ce dont vous avez besoin pour transformer votre entreprise en ligne
            </p>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16 bg-background">
        <div className="container max-w-4xl mx-auto">
          <div className="grid gap-8">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4">Nos spécialités :</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Rédaction stratégique</strong> : Contenus persuasifs et engageants</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Conception informatique</strong> : Sites web et applications sur mesure</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Gestion digitale</strong> : Réseaux sociaux et présence en ligne</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Design graphique</strong> : Identité visuelle et supports marketing</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 bg-primary/5 border-primary/20">
              <h2 className="text-2xl font-bold mb-4">Information multicanal</h2>
              <p className="text-muted-foreground mb-6">
                Restez informé des opportunités via nos différents canaux de communication. Nous sommes présents sur plusieurs plateformes pour vous servir au mieux.
              </p>
              
              {!loading && channels.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {channels.map((channel) => (
                    <Button
                      key={channel.id}
                      variant="outline"
                      asChild
                      className="justify-start gap-2"
                    >
                      <a href={channel.channel_url} target="_blank" rel="noopener noreferrer">
                        <MessageSquare className="h-4 w-4" />
                        {channel.channel_name}
                      </a>
                    </Button>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* Realizations */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Nos réalisations digitales</h2>
          <Realizations serviceCategory="services-numeriques" />
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-primary">
        <div className="container max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold text-primary-foreground">
            Prêt à transformer votre présence digitale ?
          </h2>
          <p className="text-primary-foreground/90">
            Contactez-nous par nos différents canaux de communication
          </p>
          {!loading && channels.length > 0 && (
            <div className="flex flex-wrap gap-3 justify-center">
              {channels.slice(0, 2).map((channel) => (
                <Button
                  key={channel.id}
                  size="lg"
                  asChild
                  className="bg-secondary hover:bg-secondary/90"
                >
                  <a href={channel.channel_url} target="_blank" rel="noopener noreferrer">
                    {channel.channel_name}
                  </a>
                </Button>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
