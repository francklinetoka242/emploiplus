// backend/src/routes/admin-auth.ts
import { Router, Request, Response } from "express";
import {
  registerAdmin,
  verifyEmailToken,
  loginAdmin,
  createAdminBySuperAdmin,
} from "../services/adminAuthService.js";
import { authenticateToken, isSuperAdmin } from "../middleware/auth.js";

const router = Router();

/**
 * POST /api/admin/register
 * Register a new super admin (first admin only)
 */
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, nom, prenom, telephone, pays, ville, date_naissance, avatar_url, role } = req.body;

    // Validate required fields
    if (!email || !password || !nom || !prenom) {
      return res.status(400).json({
        success: false,
        message: "Email, mot de passe, nom et prénom sont requis",
      });
    }

    const result = await registerAdmin({
      email,
      password,
      nom,
      prenom,
      telephone: telephone || undefined,
      pays: pays || undefined,
      ville: ville || undefined,
      date_naissance: date_naissance || undefined,
      avatar_url: avatar_url || undefined,
      role: role || "super_admin",
    });

    res.json(result);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'inscription",
    });
  }
});

/**
 * GET /api/admin/verify-email
 * Verify email with token
 */
router.get("/verify-email", async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return res.status(400).json({
        success: false,
        message: "Token manquant ou invalide",
      });
    }

    const result = await verifyEmailToken(token);
    res.json(result);
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la vérification",
    });
  }
});

/**
 * POST /api/admin/login
 * Login admin
 */
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email et mot de passe sont requis",
      });
    }

    const result = await loginAdmin(email, password);
    res.json(result);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la connexion",
    });
  }
});

/**
 * POST /api/admin/create
 * Create admin by super admin
 * Requires authentication and super_admin role
 */
router.post("/create", authenticateToken, isSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { email, password, nom, prenom, telephone, pays, ville, date_naissance, avatar_url, role } = req.body;

    // Validate required fields
    if (!email || !password || !nom || !prenom) {
      return res.status(400).json({
        success: false,
        message: "Email, mot de passe, nom et prénom sont requis",
      });
    }

    // @ts-ignore
    const result = await createAdminBySuperAdmin(
      {
        email,
        password,
        nom,
        prenom,
        telephone: telephone || undefined,
        pays: pays || undefined,
        ville: ville || undefined,
        date_naissance: date_naissance || undefined,
        avatar_url: avatar_url || undefined,
        role: role || "admin",
      },
      req.body.userId || 0
    );

    res.json(result);
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création de l'admin",
    });
  }
});

export default router;
