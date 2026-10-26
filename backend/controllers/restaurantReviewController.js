
const RestaurantReview = require("../models/RestaurantReview");
const User = require("../models/User");

const getReviews = async (req, res) => {
    try {
        const reviews = await RestaurantReview.findAll({
            include: [{
                model: User,
                attributes: ["name"]
            }],
            order: [["createdAt", "DESC"]]
        });

        res.json(reviews);
    } catch (error) {
        console.error("Error al consultar reseñas:", error);
        res.status(500).json({
            error: "No fue posible obtener las reseñas"
        });
    }
};

const createReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const calificacion = Number(rating);

        if (!Number.isInteger(calificacion) ||
            calificacion < 1 ||
            calificacion > 5) {
            return res.status(400).json({
                error: "La calificación debe estar entre 1 y 5 estrellas"
            });
        }

        if (typeof comment !== "string" || !comment.trim()) {
            return res.status(400).json({
                error: "Escribe tu experiencia en el restaurante"
            });
        }

        const review = await RestaurantReview.create({
            userId: req.user.id,
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

module.exports = { getReviews, createReview };
