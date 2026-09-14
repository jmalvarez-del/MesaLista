const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
const User = require("./models/User");
const Reservation = require("./models/Reservation");
const bcrypt = require("bcrypt");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

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
});

app.post("/reservations", async (req, res) => {
    try {
        const { userId, tableNumber, date, time, numberOfPeople, status } = req.body;

        const reservation = await Reservation.create({
            userId,
            tableNumber,
            date,
            time,
            numberOfPeople,
            status
        });

        res.status(201).json(reservation);

    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
});

app.get("/reservations", async (req, res) => {
    try {
        const reservations = await Reservation.findAll();

        res.json(reservations);

    } catch (error) {
        res.status(500).json({
            error: "Error al obtener las reservas"
        });
    }
});

app.get("/reservations/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const reservation = await Reservation.findByPk(id);

        if (!reservation) {
            return res.status(404).json({
                error: "Reserva no encontrada"
            });
        }

        res.json(reservation);

    } catch (error) {
        res.status(500).json({
            error: "Error al obtener la reserva"
        });
    }
});

app.put("/reservations/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, tableNumber, date, time, numberOfPeople, status } = req.body;

        const reservation = await Reservation.findByPk(id);

        if (!reservation) {
            return res.status(404).json({
                error: "Reserva no encontrada"
            });
        }

        await reservation.update({
            userId,
            tableNumber,
            date,
            time,
            numberOfPeople,
            status
        });

        res.json(reservation);

    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
});

app.delete("/reservations/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const reservation = await Reservation.findByPk(id);

        if (!reservation) {
            return res.status(404).json({
                error: "Reserva no encontrada"
            });
        }

        await reservation.destroy();

        res.json({
            message: "Reserva eliminada correctamente"
        });

    } catch (error) {
        res.status(500).json({
            error: "Error al eliminar la reserva"
        });
    }
});

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
