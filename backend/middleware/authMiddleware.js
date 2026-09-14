const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            error: "Token requerido"
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
        if (error) {
            return res.status(403).json({
                error: "Token inválido o expirado"
            });
        }

        req.user = user;

        next();
    });
};

const requireAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({
            error: "Acceso exclusivo para administradores"
        });
    }

    next();
};

module.exports = {
    authenticateToken,
    requireAdmin
};