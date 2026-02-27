import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export function AuthFooter() {
  const [language, setLanguage] = useState("fr");

  return (
    <footer className="border-t bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
          {/* Left - Links */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-primary transition">
              À propos
            </Link>
            <span className="text-border">•</span>
            <Link to="/accessibility" className="hover:text-primary transition">
              Accessibilité
            </Link>
            <span className="text-border">•</span>
            <Link to="/terms" className="hover:text-primary transition">
              Conditions générales d'utilisation de Emploi+
            </Link>
            <span className="text-border">•</span>
            <Link to="/privacy" className="hover:text-primary transition">
              Politique de confidentialité
            </Link>
            <span className="text-border">•</span>
            <Link to="/cookies" className="hover:text-primary transition">
              Politique relative aux cookies
            </Link>
            <span className="text-border">•</span>
            <Link to="/copyright" className="hover:text-primary transition">
              Politique de copyright
            </Link>
            <span className="text-border">•</span>
            <Link to="/brand" className="hover:text-primary transition">
              Politique de la marque
            </Link>
          </div>

          {/* Right - Language Selector */}
          <div className="w-full md:w-auto">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Langue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t pt-6 text-center text-sm text-muted-foreground">
          <p>© 2026 Emploi+. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
