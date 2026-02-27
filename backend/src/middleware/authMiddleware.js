import jwt from "jsonwebtoken";
export const protectAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
        return res.status(401).json({ message: "Non autorisé" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    }
    catch {
        res.status(401).json({ message: "Token invalide" });
    }
};
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.admin || !roles.includes(req.admin.role)) {
            return res.status(403).json({ message: "Accès interdit" });
        }
        next();
    };
};
//# sourceMappingURL=authMiddleware.js.map