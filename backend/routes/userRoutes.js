
const express = require("express");
const {
    getUsers,
    createUser,
    updateUser,
    deleteUser
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

// Actualizar usuarios: solo administradores autenticados
router.put("/:id", authenticateToken, requireAdmin, updateUser);

// Eliminar usuarios: solo administradores autenticados
router.delete("/:id", authenticateToken, requireAdmin, deleteUser);

module.exports = router;
