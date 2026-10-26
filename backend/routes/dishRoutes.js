
const express = require("express");
const { getDishes, createReview } = require("../controllers/dishController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticateToken, getDishes);
router.post("/:id/reviews", authenticateToken, createReview);

module.exports = router;
