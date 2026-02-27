import { Request } from "express";
import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AdminUser } from '../types/index.js';

interface AdminRequest extends Request {
  admin?: any;
}

export const protectAdmin = (req: AdminRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Non autorisé" });

  try {
    const decoded = (jwt.verify(token, process.env.JWT_SECRET!) as any);
    // Attach minimal admin info; code downstream can rely on proper AdminUser when available
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Token invalide" });
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      return res.status(403).json({ message: "Accès interdit" });
    }
    next();
  };
};