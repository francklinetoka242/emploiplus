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
 * Expects: { email, password, nom, prenom, phone, country, city, birth_date, avatar_url, role }
 * Maps: nom→last_name, prenom→first_name
 */
router.post("/register", async (req: Request, res: Response) => {
  console.log('👉 Requête reçue sur la route d\'inscription admin (admin-auth.ts /register)');
  console.log('   Request body:', req.body);
  // SECURITY: Role is determined by the route, NOT by user input
  // Ignore any role property sent in req.body
  const role = 'content_admin';
  console.log('   ✅ Role forced by route:', role);
  try {
    const { email, password, phone, country, city, birth_date, avatar_url } = req.body;
    // Flexible extraction: accept both lastName/firstName and nom/prenom formats
    const lastName = req.body.lastName || req.body.nom;
    const firstName = req.body.firstName || req.body.prenom;

    // Validate required fields
    if (!email || !password || !lastName || !firstName) {
      return res.status(400).json({
        success: false,
        message: "Email, mot de passe, nom/firstName et prénom/lastName sont requis",
      });
    }

    const result = await registerAdmin({
      email,
      password,
      nom: lastName,
      prenom: firstName,
      phone: phone || undefined,
      country: country || undefined,
      city: city || undefined,
      birth_date: birth_date || undefined,
      avatar_url: avatar_url || undefined,
      role, // Force role from route, not from user input
    });

    res.json(result);
  } catch (error) {
    console.error("❌ Registration error:", error);
    if (error instanceof Error) {
      console.error("   SQL Error:", error.message);
      console.error("   Stack:", error.stack);
    }
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
 * Accepts flexible format: { email, password, nom/lastName, prenom/firstName, ... }
 */
router.post("/create", authenticateToken, isSuperAdmin, async (req: Request, res: Response) => {
  console.log('👉 Requête reçue sur la route de création admin (admin-auth.ts /create)');
  console.log('   Request body:', req.body);
  // SECURITY: Role is determined by the route, NOT by user input
  // Ignore any role property sent in req.body to prevent privilege escalation
  const role = 'admin';
  console.log('   ✅ Role forced by route:', role);
  try {
    const { email, password, phone, country, city, birth_date, avatar_url } = req.body;
    // Flexible extraction: accept both lastName/firstName and nom/prenom formats
    const lastName = req.body.lastName || req.body.nom;
    const firstName = req.body.firstName || req.body.prenom;

    // Validate required fields
    if (!email || !password || !lastName || !firstName) {
      return res.status(400).json({
        success: false,
        message: "Email, mot de passe, nom/firstName et prénom/lastName sont requis",
      });
    }

    // @ts-ignore
    const result = await createAdminBySuperAdmin(
      {
        email,
        password,
        nom: lastName,
        prenom: firstName,
        phone: phone || undefined,
        country: country || undefined,
        city: city || undefined,
        birth_date: birth_date || undefined,
        avatar_url: avatar_url || undefined,
        role, // Force role from route, not from user input
      },
      req.body.userId || 0
    );

    res.json(result);
  } catch (error) {
    console.error("❌ Create admin error:", error);
    if (error instanceof Error) {
      console.error('   SQL Error:', error.message);
    }
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création de l'admin",
    });
  }
});

export default router;
