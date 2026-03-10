const express = require("express");
const {
    createReview,
    getProductReviews,
    updateReview,
    deleteReview,
    getMyReviews,
    markHelpful,
} = require("../controllers/reviewController");
const { verifyToken, optionalAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", verifyToken, createReview);
router.get("/product/:productId", optionalAuth, getProductReviews);
router.get("/user/my-reviews", verifyToken, getMyReviews);
router.put("/:reviewId", verifyToken, updateReview);
router.delete("/:reviewId", verifyToken, deleteReview);
router.post("/:reviewId/helpful", verifyToken, markHelpful);

module.exports = router;
