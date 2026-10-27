
const express = require("express");
const router = express.Router();
const MenuItem = require("../models/MenuItem");

// Consultar todos los platos del menú.
router.get("/", async (req, res) => {
    try {
        const platos = await MenuItem.findAll({
            order: [["id", "ASC"]]
        });

        res.json(platos);

    } catch (error) {
        console.error("Error al consultar el menú:", error);

        res.status(500).json({
            error: "No fue posible consultar el menú."
        });
    }
});

module.exports = router;
