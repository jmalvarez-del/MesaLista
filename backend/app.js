
const express = require("express");
const path = require("path");
const cors = require("cors");
const sequelize = require("./config/database");

const User = require("./models/User");
const Reservation = require("./models/Reservation");
const Table = require("./models/Table");
const Dish = require("./models/Dish");
const Review = require("./models/Review");
const RestaurantReview = require("./models/RestaurantReview");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const dishRoutes = require("./routes/dishRoutes");
const restaurantReviewRoutes = require("./routes/restaurantReviewRoutes");

const {
    authenticateToken,
    requireAdmin
} = require("./middleware/authMiddleware");

const app = express();

// Relaciones entre platos y reseñas de platos.
Dish.hasMany(Review, {
    foreignKey: "dishId",
    onDelete: "CASCADE"
});

Review.belongsTo(Dish, {
    foreignKey: "dishId"
});

User.hasMany(Review, {
    foreignKey: "userId",
    onDelete: "CASCADE"
});

Review.belongsTo(User, {
    foreignKey: "userId"
});

// Relaciones entre usuarios y reseñas del restaurante.
User.hasMany(RestaurantReview, {
    foreignKey: "userId",
    onDelete: "CASCADE"
});

RestaurantReview.belongsTo(User, {
    foreignKey: "userId"
});

// Middlewares.
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// Rutas principales.
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/dishes", dishRoutes);
app.use("/restaurant-reviews", restaurantReviewRoutes);

// Crear una reserva desde el panel del cliente.
app.post(
    "/reservations/client",
    authenticateToken,
    async (req, res) => {
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

            if (
                !Number.isInteger(personas) ||
                personas < 1 ||
                !Number.isInteger(numeroMesa) ||
                numeroMesa < 1
            ) {
                return res.status(400).json({
                    error: "La mesa y el número de personas deben ser válidos"
                });
            }

            const mesa = await Table.findOne({
                where: { number: numeroMesa }
            });

            if (!mesa) {
                return res.status(404).json({
                    error: "La mesa seleccionada no existe"
                });
            }

            if (personas > mesa.capacity) {
                return res.status(400).json({
                    error: "La mesa no tiene capacidad suficiente"
                });
            }

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

            const reserva = await Reservation.create({
                userId: req.user.id,
                tableNumber: numeroMesa,
                date,
                time,
                numberOfPeople: personas,
                status: "pendiente"
            });

            return res.status(201).json({
                message: "Reserva creada correctamente",
                reserva
            });
        } catch (error) {
            console.error("Error al crear reserva:", error);

            return res.status(500).json({
                error: "Error al crear la reserva"
            });
        }
    }
);

// Crear una reserva desde el panel de administración.
app.post(
    "/reservations",
    authenticateToken,
    requireAdmin,
    async (req, res) => {
        try {
            const {
                userId,
                tableNumber,
                date,
                time,
                numberOfPeople,
                status
            } = req.body;

            const reservation = await Reservation.create({
                userId,
                tableNumber,
                date,
                time,
                numberOfPeople,
                status
            });

            return res.status(201).json(reservation);
        } catch (error) {
            return res.status(400).json({
                error: error.message
            });
        }
    }
);

// Consultar mesas disponibles.
app.get(
    "/reservations/available",
    authenticateToken,
    async (req, res) => {
        try {
            const { date, time, numberOfPeople } = req.query;

            if (!date || !time || !numberOfPeople) {
                return res.status(400).json({
                    error: "Fecha, hora y número de personas son obligatorios"
                });
            }

            const personas = Number(numberOfPeople);

            if (!Number.isInteger(personas) || personas < 1) {
                return res.status(400).json({
                    error: "El número de personas debe ser válido"
                });
            }

            const { Op } = require("sequelize");

            const mesas = await Table.findAll({
                where: {
                    capacity: {
                        [Op.gte]: personas
                    }
                }
            });

            const reservas = await Reservation.findAll({
                where: { date, time }
            });

            const mesasOcupadas = reservas.map(
                reserva => reserva.tableNumber
            );

            const mesasDisponibles = mesas.filter(
                mesa => !mesasOcupadas.includes(mesa.number)
            );

            return res.json(mesasDisponibles);
        } catch (error) {
            console.error("Error al consultar mesas:", error);

            return res.status(500).json({
                error: "Error al consultar las mesas disponibles"
            });
        }
    }
);

// Consultar las reservas del usuario autenticado.
app.get(
    "/reservations/my",
    authenticateToken,
    async (req, res) => {
        try {
            const reservas = await Reservation.findAll({
                where: { userId: req.user.id },
                order: [["date", "ASC"], ["time", "ASC"]]
            });

            return res.json(reservas);
        } catch (error) {
            console.error("Error al obtener reservas:", error);

            return res.status(500).json({
                error: "Error al obtener tus reservas"
            });
        }
    }
);

// Consultar todas las reservas (administrador).
app.get(
    "/reservations",
    authenticateToken,
    requireAdmin,
    async (req, res) => {
        try {
            const reservations = await Reservation.findAll();
            return res.json(reservations);
        } catch (error) {
            return res.status(500).json({
                error: "Error al obtener las reservas"
            });
        }
    }
);

// Consultar una reserva por ID (administrador).
app.get(
    "/reservations/:id",
    authenticateToken,
    requireAdmin,
    async (req, res) => {
        try {
            const reservation = await Reservation.findByPk(req.params.id);

            if (!reservation) {
                return res.status(404).json({
                    error: "Reserva no encontrada"
                });
            }

            return res.json(reservation);
        } catch (error) {
            return res.status(500).json({
                error: "Error al obtener la reserva"
            });
        }
    }
);

// Actualizar una reserva (administrador).
app.put(
    "/reservations/:id",
    authenticateToken,
    requireAdmin,
    async (req, res) => {
        try {
            const reservation = await Reservation.findByPk(req.params.id);

            if (!reservation) {
                return res.status(404).json({
                    error: "Reserva no encontrada"
                });
            }

            const {
                userId,
                tableNumber,
                date,
                time,
                numberOfPeople,
                status
            } = req.body;

            await reservation.update({
                userId,
                tableNumber,
                date,
                time,
                numberOfPeople,
                status
            });

            return res.json(reservation);
        } catch (error) {
            return res.status(400).json({
                error: error.message
            });
        }
    }
);

// Eliminar una reserva (administrador).
app.delete(
    "/reservations/:id",
    authenticateToken,
    requireAdmin,
    async (req, res) => {
        try {
            const reservation = await Reservation.findByPk(req.params.id);

            if (!reservation) {
                return res.status(404).json({
                    error: "Reserva no encontrada"
                });
            }

            await reservation.destroy();

            return res.json({
                message: "Reserva eliminada correctamente"
            });
        } catch (error) {
            return res.status(500).json({
                error: "Error al eliminar la reserva"
            });
        }
    }
);

async function startServer() {
    try {
        await sequelize.authenticate();

        console.log("✅ Conexión con PostgreSQL exitosa");

        // Sincronizar modelos y relaciones con la base de datos.
        await sequelize.sync({ alter: true });

        console.log("✅ Tablas sincronizadas correctamente");

        // Crear platos de ejemplo si el menú está vacío.
        const cantidadPlatos = await Dish.count();

        if (cantidadPlatos === 0) {
            await Dish.bulkCreate([
                {
                    name: "Pollo a la plancha",
                    description: "Pollo a la plancha acompañado de papas y verduras.",
                    price: 25000,
                    image: ""
                },
                {
                    name: "Hamburguesa de la casa",
                    description: "Hamburguesa con carne, queso, lechuga y tomate.",
                    price: 22000,
                    image: ""
                },
                {
                    name: "Pasta Alfredo",
                    description: "Pasta en salsa cremosa con queso parmesano.",
                    price: 20000,
                    image: ""
                },
                {
                    name: "Ensalada César",
                    description: "Lechuga fresca, pollo, crutones y aderezo César.",
                    price: 16000,
                    image: ""
                }
            ]);

            console.log("✅ Platos de ejemplo creados correctamente");
        }

        // Crear mesas iniciales si no existen.
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
        console.error("❌ Error al iniciar el servidor:", error);
    }
}

startServer();
