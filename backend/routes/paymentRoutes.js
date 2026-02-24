const express = require("express");
const {
    createOrder,
    verifyPayment,
    getPaymentStatus,
    refundPayment,
    razorpayWebhook,
} = require("../controllers/paymentController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.post("/webhook", razorpayWebhook);

// Private routes
router.use(verifyToken);
router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);
router.get("/status/:paymentId", getPaymentStatus);
router.post("/refund", refundPayment);

module.exports = router;
