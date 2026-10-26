
const bcrypt = require("bcrypt");
const User = require("../models/User");

const getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: {
                exclude: ["password"]
            }
        });

        return res.json(users);
    } catch (error) {
        console.error("Error al consultar usuarios:", error);
        return res.status(500).json({
            error: "Error al obtener los usuarios"
        });
    }
};

const createUser = async (req, res) => {
    try {
        const { name, age, email, password } = req.body;

        // Validar que se hayan enviado todos los campos
        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            age === undefined ||
            age === null ||
            String(name).trim() === "" ||
            String(email).trim() === "" ||
            password === ""
        ) {
            return res.status(400).json({
                error: "Todos los campos son obligatorios"
            });
        }

        const nombre = name.trim();
        const correo = email.trim().toLowerCase();
        const edad = Number(age);

        if (!Number.isInteger(edad) || edad < 18 || edad > 120) {
            return res.status(400).json({
                error: "La edad debe ser un número entero entre 18 y 120"
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
            return res.status(400).json({
                error: "Ingresa un correo electrónico válido"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                error: "La contraseña debe tener al menos 8 caracteres"
            });
        }

        const usuarioExistente = await User.findOne({
            where: { email: correo }
        });

        if (usuarioExistente) {
            return res.status(409).json({
                error: "Ya existe una cuenta con ese correo electrónico"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: nombre,
            age: edad,
            email: correo,
            password: hashedPassword,
            role: "usuario"
        });

        return res.status(201).json({
            message: "Usuario registrado correctamente",
            user: {
                id: user.id,
                name: user.name,
                age: user.age,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Error al registrar usuario:", error);

        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({
                error: "Ya existe una cuenta con ese correo electrónico"
            });
        }

        return res.status(500).json({
            error: "No fue posible registrar el usuario"
        });
    }
};

module.exports = {
    getUsers,
    createUser
};
