const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
const User = require("./models/User");
const bcrypt = require("bcrypt");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);

async function startServer() {
    try {
        await sequelize.authenticate();

        console.log("✅ Conexión con PostgreSQL exitosa");

        await sequelize.sync({ alter: true });

        console.log("✅ Tabla users sincronizada");

        app.listen(3000, () => {
            console.log("🚀 Servidor escuchando en el puerto 3000");
        });

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

startServer();