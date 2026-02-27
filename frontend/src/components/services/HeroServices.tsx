import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Breadcrumb from "@/components/Breadcrumb";
import servicesImage from "@/assets/services-digital.jpg";
import { useAuth } from "@/hooks/useAuth";

export default function HeroServices() {
  const { user } = useAuth();

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          {!user && (
            <div className="flex items-center justify-center gap-4">
              <Button asChild className="bg-primary text-white">
                <Link to="/inscription">S'inscrire</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/services">Explorer</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Image intentionally removed to keep hero minimal and professional */}
      </div>
    </section>
  );
}
