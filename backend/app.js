const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
const User = require("./models/User");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/users", async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({
            error: "Error al obtener los usuarios"
        });
    }
});

app.post("/users", async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
});

async function startServer() {
    try {
        await sequelize.authenticate();

        console.log("✅ Conexión con PostgreSQL exitosa");

        await sequelize.sync();

        console.log("✅ Tabla users sincronizada");

        app.listen(3000, () => {
            console.log("🚀 Servidor escuchando en el puerto 3000");
        });

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

startServer();