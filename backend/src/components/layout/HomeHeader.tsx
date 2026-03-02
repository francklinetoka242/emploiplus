import { useState } from "react";
import { Menu, X, Info, Mail } from "lucide-react";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { Link } from "react-router-dom";

interface HomeHeaderProps {
  onMenuClick?: () => void;
}

export const HomeHeader = ({ onMenuClick }: HomeHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isVisible } = useScrollDirection(80);

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
    onMenuClick?.();
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50 md:hidden transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link to="/" className="font-bold text-lg text-primary">
          Emploi+
        </Link>

        {/* Menu Button */}
        <button
          onClick={handleMenuClick}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {isMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t border-slate-200 bg-white">
          <nav className="flex flex-col p-4 space-y-2">
            <Link
              to="/emplois"
              className="block px-4 py-2 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Emplois
            </Link>
            <Link
              to="/formations"
              className="block px-4 py-2 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Formations
            </Link>
            <Link
              to="/services"
              className="block px-4 py-2 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Services
            </Link>
            <div className="border-t border-slate-200 pt-2 mt-2">
              <Link
                to="/contact"
                className="block px-4 py-2 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                <Mail className="h-4 w-4" />
                Contact
              </Link>
              <Link
                to="/about"
                className="block px-4 py-2 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                <Info className="h-4 w-4" />
                À propos
              </Link>
            </div>
            <Link
              to="/connexion"
              className="block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-center mt-2"
            >
              Connexion
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
