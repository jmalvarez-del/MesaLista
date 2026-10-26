
const express = require("express");
const {
    getUsers,
    createUser
} = require("../controllers/userController");

const {
    authenticateToken,
    requireAdmin
} = require("../middleware/authMiddleware");

const router = express.Router();

// Consultar usuarios: solo administradores autenticados
router.get("/", authenticateToken, requireAdmin, getUsers);

// Registrar usuarios: público
router.post("/", createUser);

module.exports = router;
