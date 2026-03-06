import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermissions } from './PermissionGuard';

interface RouteGuardProps {
  children: React.ReactNode;
  module?: string;
  action?: 'view' | 'edit' | 'delete' | 'special' | 'all';
  permission?: string;
  requireAll?: boolean;
  redirectTo?: string;
}

/**
 * Composant de protection des routes basé sur les permissions
 * Redirige vers une page d'accès refusé ou le dashboard si pas autorisé
 */
export function RouteGuard({
  children,
  module,
  action,
  permission,
  requireAll = false,
  redirectTo = '/admin/access-denied'
}: RouteGuardProps) {
  const { hasModuleAccess, hasPermission, hasAllPermissions, isSuperAdmin } = usePermissions();
  const location = useLocation();

  // Super admin a toujours accès
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  let hasAccess = false;

  // Vérification par permission spécifique
  if (permission) {
    hasAccess = hasPermission(permission);
  }
  // Vérification par module et action
  else if (module && action) {
    hasAccess = hasModuleAccess(module, action);
  }
  // Si aucun critère, accès par défaut
  else {
    hasAccess = true;
  }

  if (!hasAccess) {
    // Rediriger vers le dashboard avec un message d'erreur
    return <Navigate to={redirectTo} state={{ from: location, accessDenied: true }} replace />;
  }

  return <>{children}</>;
}

/**
 * Hook pour vérifier l'accès aux routes
 */
export function useRouteAccess() {
  const { hasModuleAccess, hasPermission, isSuperAdmin } = usePermissions();

  const checkRouteAccess = (module?: string, action?: 'view' | 'edit' | 'delete' | 'special' | 'all', permission?: string) => {
    if (isSuperAdmin) return true;

    if (permission) {
      return hasPermission(permission);
    }

    if (module && action) {
      return hasModuleAccess(module, action);
    }

    return true;
  };

  return { checkRouteAccess };
}