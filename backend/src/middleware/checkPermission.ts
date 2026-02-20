import { Request, Response, NextFunction } from 'express';

// Middleware factory: checkPermission('perm_users')
export default function checkPermission(permissionName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Assumes authentication middleware has attached admin object to req.admin
    // e.g. req.admin = { id, role, perm_jobs, perm_users, ... }
    // Types may need adjustment depending on your auth implementation.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin: any = (req as any).admin;
    if (!admin) {
      return res.status(401).json({ error: 'Not authenticated as admin' });
    }

    // Super admin bypasses permission checks
    if (admin.role === 'super_admin') return next();

    // If the permission property exists and is truthy, allow
    if (typeof admin[permissionName] === 'boolean' && admin[permissionName]) {
      return next();
    }

    return res.status(403).json({ error: 'Insufficient permissions' });
  };
}
