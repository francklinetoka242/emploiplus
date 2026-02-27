import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/database.js";
const JWT_SECRET = process.env.JWT_SECRET || "emploi_connect_congo_secret_2025";
export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { rows } = await pool.query("SELECT * FROM admins WHERE email = $1", [email]);
        const admin = rows[0];
        if (!admin || !bcrypt.compareSync(password, admin.password)) {
            return res.status(401).json({ success: false, message: "Identifiants incorrects" });
        }
        const token = jwt.sign({ id: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: "7d" });
        const { password: _, ...safeAdmin } = admin;
        res.json({ success: true, token, admin: safeAdmin });
    }
    catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ success: false });
    }
};
export const registerAdmin = async (req, res) => {
    try {
        const { full_name, email, password } = req.body;
        // Vérifier si l'email existe déjà
        const { rows } = await pool.query("SELECT * FROM admins WHERE email = $1", [email]);
        if (rows.length > 0) {
            return res.status(400).json({ success: false, message: "Cet email existe déjà" });
        }
        // Hasher le mot de passe
        const hashedPassword = bcrypt.hashSync(password, 10);
        // Créer l'admin
        const result = await pool.query(`INSERT INTO admins (email, password, full_name, role)
       VALUES ($1, $2, $3, 'admin') 
       RETURNING id, email, full_name, role`, [email, hashedPassword, full_name || null]);
        const newAdmin = result.rows[0];
        const token = jwt.sign({ id: newAdmin.id, role: newAdmin.role }, JWT_SECRET, { expiresIn: "7d" });
        res.json({ success: true, token, admin: newAdmin });
    }
    catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ success: false });
    }
};
//# sourceMappingURL=auth.controller.js.map