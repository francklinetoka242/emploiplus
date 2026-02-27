import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const AuthUserFooter = () => {
  return (
    <footer className="hidden md:block bg-gray-200 dark:bg-gray-700 border-t border-gray-300 dark:border-gray-600 py-4">
      <div className="container flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
        <p>&copy; {new Date().getFullYear()} Emploi+. Tous droits réservés.</p>
        <div className="flex gap-4">
          <Link to="/privacy" className="hover:text-primary">Politique de confidentialité</Link>
          <Link to="/legal" className="hover:text-primary">Mentions légales</Link>
          <Link to="/cookies" className="hover:text-primary">Gestion des cookies</Link>
        </div>
      </div>
    </footer>
  );
};

export default AuthUserFooter;
