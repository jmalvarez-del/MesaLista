
const express = require("express");
const {
    getReviews,
    createReview
} = require("../controllers/restaurantReviewController");
const {
    authenticateToken
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getReviews);
router.post("/", authenticateToken, createReview);

module.exports = router;
