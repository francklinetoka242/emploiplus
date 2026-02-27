import { Navigate } from "react-router-dom";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

/**
 * ProtectedRoute Component
 * Vérifie l'authentification et le rôle avant d'accéder à une route
 * 
 * @param children - Composant à rendre si autorisé
 * @param requiredRoles - Liste des rôles autorisés (vide = authentification seule)
 * @returns L'enfant si autorisé, sinon redirige vers /admin/login
 */
export const ProtectedRoute = ({ children, requiredRoles = [] }: ProtectedRouteProps) => {
  // Vérifier l'authentification
  const adminToken = localStorage.getItem("adminToken");
  if (!adminToken) {
    toast.error("Veuillez vous connecter");
    return <Navigate to="/admin/login" replace />;
  }

  // Si aucun rôle requis, l'authentification suffit
  if (requiredRoles.length === 0) {
    return <>{children}</>;
  }

  // Vérifier le rôle
  const adminData = localStorage.getItem("admin");
  if (!adminData) {
    toast.error("Données d'authentification invalides");
    localStorage.removeItem("adminToken");
    return <Navigate to="/admin/login" replace />;
  }

  try {
    const admin = JSON.parse(adminData);
    const userRole = admin?.role;

    if (!userRole || !requiredRoles.includes(userRole)) {
      toast.error("Accès non autorisé pour votre rôle");
      return <Navigate to="/admin" replace />;
    }

    return <>{children}</>;
  } catch (error) {
    console.error("Erreur parsing admin data:", error);
    toast.error("Erreur d'authentification");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    return <Navigate to="/admin/login" replace />;
  }
};

export default ProtectedRoute;
