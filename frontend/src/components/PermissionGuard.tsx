import React from 'react';
import { useAdminNav } from '@/context/AdminNavContext';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: string;
  module?: string;
  action?: 'view' | 'edit' | 'delete' | 'special' | 'all';
  fallback?: React.ReactNode;
  requireAll?: boolean; // Si true, nécessite toutes les permissions listées
}

/**
 * Composant de sécurité qui contrôle l'affichage basé sur les permissions
 * Si la permission est absente, retourne null ou le fallback
 */
export function PermissionGuard({
  children,
  permission,
  module,
  action,
  fallback = null,
  requireAll = false
}: PermissionGuardProps) {
  const { userSession } = useAdminNav();

  // Si pas de session utilisateur, pas d'accès
  if (!userSession) {
    return <>{fallback}</>;
  }

  // Super admin a toujours accès
  if (userSession.role === 'super-admin') {
    return <>{children}</>;
  }

  const permissions = userSession.permissions || [];

  // Si une permission spécifique est demandée
  if (permission) {
    const hasPermission = permissions.includes(permission);
    return hasPermission ? <>{children}</> : <>{fallback}</>;
  }

  // Si module et action sont spécifiés
  if (module && action) {
    const requiredPermission = action === 'all' ? `${module}:all` : `${module}:${action}`;
    const hasGlobalAccess = permissions.includes(`${module}:all`);
    const hasSpecificAccess = permissions.includes(requiredPermission);

    const hasAccess = hasGlobalAccess || hasSpecificAccess;
    return hasAccess ? <>{children}</> : <>{fallback}</>;
  }

  // Si aucun critère spécifié, accès par défaut
  return <>{children}</>;
}

/**
 * Hook utilitaire pour vérifier les permissions
 */
export function usePermissions() {
  const { userSession } = useAdminNav();

  const hasPermission = (permission: string): boolean => {
    if (!userSession) return false;
    if (userSession.role === 'super-admin') return true;
    return (userSession.permissions || []).includes(permission);
  };

  const hasModuleAccess = (module: string, action?: 'view' | 'edit' | 'delete' | 'special' | 'all'): boolean => {
    if (!userSession) return false;
    if (userSession.role === 'super-admin') return true;

    const permissions = userSession.permissions || [];
    const hasGlobalAccess = permissions.includes(`${module}:all`);

    if (hasGlobalAccess) return true;
    if (!action) return permissions.some(p => p.startsWith(`${module}:`));

    const requiredPermission = action === 'all' ? `${module}:all` : `${module}:${action}`;
    return permissions.includes(requiredPermission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!userSession) return false;
    if (userSession.role === 'super-admin') return true;
    const userPermissions = userSession.permissions || [];
    return permissions.some(p => userPermissions.includes(p));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!userSession) return false;
    if (userSession.role === 'super-admin') return true;
    const userPermissions = userSession.permissions || [];
    return permissions.every(p => userPermissions.includes(p));
  };

  return {
    hasPermission,
    hasModuleAccess,
    hasAnyPermission,
    hasAllPermissions,
    isSuperAdmin: userSession?.role === 'super-admin',
    permissions: userSession?.permissions || []
  };
}