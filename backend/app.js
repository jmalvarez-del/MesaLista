const express = require("express");
const path = require("path");
const cors = require("cors");
const sequelize = require("./config/database");
const User = require("./models/User");
const Reservation = require("./models/Reservation");
const Table = require("./models/Table");
const bcrypt = require("bcrypt");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const { authenticateToken, requireAdmin } = require("./middleware/authMiddleware");

const MenuItem = require("./models/MenuItem");
const menuRoutes = require("./routes/menuRoutes");

const app = express();
app.use(express.static(path.join(__dirname, "../frontend")));
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/menu", menuRoutes);

app.post("/reservations/client", authenticateToken, async (req, res) => {
    try {
        const {
            tableNumber,
            date,
            time,
            numberOfPeople
        } = req.body;

        if (!tableNumber || !date || !time || !numberOfPeople) {
            return res.status(400).json({
                error: "Mesa, fecha, hora y número de personas son obligatorios"
            });
        }

        const personas = Number(numberOfPeople);
        const numeroMesa = Number(tableNumber);

        if (personas < 1) {
            return res.status(400).json({
                error: "El número de personas debe ser mayor que 0"
            });
        }

        // Buscar la mesa seleccionada
        const mesa = await Table.findOne({
            where: {
                number: numeroMesa
            }
        });

        if (!mesa) {
            return res.status(404).json({
                error: "La mesa seleccionada no existe"
            });
        }

        // Verificar capacidad
        if (personas > mesa.capacity) {
            return res.status(400).json({
                error: "La mesa no tiene capacidad suficiente"
            });
        }

        // Verificar que la mesa siga disponible
        const reservaExistente = await Reservation.findOne({
            where: {
                tableNumber: numeroMesa,
                date,
                time
            }
        });

        if (reservaExistente) {
            return res.status(409).json({
                error: "La mesa ya fue reservada para esa fecha y hora"
            });
        }

        // Crear reserva usando el usuario del token
        const reserva = await Reservation.create({
            userId: req.user.id,
            tableNumber: numeroMesa,
            date,
            time,
            numberOfPeople: personas,
            status: "pendiente"
        });

        res.status(201).json({
            message: "Reserva creada correctamente",
            reserva
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Error al crear la reserva"
        });
    }
});

app.post("/reservations", authenticateToken, requireAdmin, async (req, res) => {
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

app.get("/reservations/available", authenticateToken, async (req, res) => {
    try {
        const { date, time, numberOfPeople } = req.query;

        if (!date || !time || !numberOfPeople) {
            return res.status(400).json({
                error: "Fecha, hora y número de personas son obligatorios"
            });
        }

        const personas = Number(numberOfPeople);

        if (personas < 1) {
            return res.status(400).json({
                error: "El número de personas debe ser mayor que 0"
            });
        }

        const mesas = await Table.findAll({
            where: {
                capacity: {
                    [require("sequelize").Op.gte]: personas
                }
            }
        });

        const reservas = await Reservation.findAll({
            where: {
                date,
                time
            }
        });

        const mesasOcupadas = reservas.map(reserva => reserva.tableNumber);

        const mesasDisponibles = mesas.filter(
            mesa => !mesasOcupadas.includes(mesa.number)
        );

        res.json(mesasDisponibles);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Error al consultar las mesas disponibles"
        });
    }
});

app.get("/reservations/my", authenticateToken, async (req, res) => {
    try {
        const reservas = await Reservation.findAll({
            where: {
                userId: req.user.id
            },
            order: [["date", "ASC"], ["time", "ASC"]]
        });

        res.json(reservas);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Error al obtener tus reservas"
        });
    }
});

app.get("/reservations", authenticateToken, requireAdmin, async (req, res) => {
    try {
        const reservations = await Reservation.findAll();

        res.json(reservations);

    } catch (error) {
        res.status(500).json({
            error: "Error al obtener las reservas"
        });
    }
});


app.get("/reservations/:id", authenticateToken, requireAdmin, async (req, res) => {
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


app.put("/reservations/:id", authenticateToken, requireAdmin, async (req, res) => {
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


app.delete("/reservations/:id", authenticateToken, requireAdmin, async (req, res) => {
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

        await sequelize.sync();

        console.log("✅ Tabla users sincronizada");

        const cantidadMesas = await Table.count();

if (cantidadMesas === 0) {
    for (let i = 1; i <= 8; i++) {
        await Table.create({
            number: i,
            type: "familiar",
            capacity: 12
        });
    }

    for (let i = 9; i <= 15; i++) {
        await Table.create({
            number: i,
            type: "sencilla",
            capacity: 6
        });
    }

    console.log("✅ 15 mesas creadas correctamente");
}

        app.listen(3000, () => {
            console.log("🚀 Servidor escuchando en el puerto 3000");
        });

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

startServer();