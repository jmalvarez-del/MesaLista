
const Dish = require("../models/Dish");
const Review = require("../models/Review");
const User = require("../models/User");

const getDishes = async (req, res) => {
    try {
        const dishes = await Dish.findAll({
            include: [{
                model: Review,
                attributes: ["rating", "comment", "userId", "createdAt"],
                include: [{
                    model: User,
                    attributes: ["name"]
                }]
            }],
            order: [["name", "ASC"]]
        });

        res.json(dishes);
    } catch (error) {
        console.error("Error al consultar platos:", error);
        res.status(500).json({
            error: "No fue posible obtener los platos"
        });
    }
};

const createReview = async (req, res) => {
    try {
        const dishId = Number(req.params.id);
        const { rating, comment } = req.body;

        if (!Number.isInteger(dishId) || dishId < 1) {
            return res.status(400).json({
                error: "El plato seleccionado no es válido"
            });
        }

        const calificacion = Number(rating);

        if (!Number.isInteger(calificacion) ||
            calificacion < 1 || calificacion > 5) {
            return res.status(400).json({
                error: "La calificación debe estar entre 1 y 5 estrellas"
            });
        }

        if (typeof comment !== "string" || !comment.trim()) {
            return res.status(400).json({
                error: "Escribe un comentario para tu reseña"
            });
        }

        const dish = await Dish.findByPk(dishId);

        if (!dish) {
            return res.status(404).json({
                error: "El plato no existe"
            });
        }

        const review = await Review.create({
            userId: req.user.id,
            dishId,
            rating: calificacion,
            comment: comment.trim()
        });

        res.status(201).json({
            message: "Reseña publicada correctamente",
            review
        });
    } catch (error) {
        console.error("Error al publicar reseña:", error);
        res.status(500).json({
            error: "No fue posible publicar la reseña"
        });
    }
};

module.exports = { getDishes, createReview };
