const bcrypt = require("bcrypt");
const User = require("../models/User");

const getUsers = async (req, res) => {
    try {
        const users = await User.findAll();

        res.json(users);

    } catch (error) {
        res.status(500).json({
            error: "Error al obtener los usuarios"
        });
    }
};

const createUser = async (req, res) => {
    try {
        const { name, age, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            age,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            id: user.id,
            name: user.name,
            age: user.age,
            email: user.email
        });

    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
};

module.exports = {
    getUsers,
    createUser
};