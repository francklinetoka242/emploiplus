import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AdminRequest extends Request {
  admin?: { id: string; role: string };
}

export const protectAdmin = (req: any, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Non autorisé" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };
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