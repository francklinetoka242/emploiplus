import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Facebook, Linkedin, Newspaper, MessageCircle, ExternalLink } from "lucide-react";

interface Channel {
  id: number;
  channel_name: string;
  channel_url: string;
  channel_type: string;
  icon_name: string;
  display_order: number;
}

const iconMap: Record<string, typeof MessageSquare> = {
  whatsapp: MessageCircle,
  facebook: Facebook,
  linkedin: Linkedin,
  newspaper: Newspaper,
  external: ExternalLink,
};

export default function CommunicationChannels() {
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

  if (loading || channels.length === 0) {
    return null;
  }

  return (
    <section className="py-12 px-4 bg-muted/40">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Nos Canaux de Communication</h2>
          <p className="text-muted-foreground">Restez en contact avec nous</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {channels.map((channel) => {
            const Icon = iconMap[channel.icon_name] || ExternalLink;
            return (
              <Card
                key={channel.id}
                className="p-6 text-center hover:shadow-lg transition-shadow group"
              >
                <a
                  href={channel.channel_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-3 h-full justify-center"
                >
                  <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="font-semibold text-sm">{channel.channel_name}</h3>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground">
                    Contactez-nous
                  </div>
                </a>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
