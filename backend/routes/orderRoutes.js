const express = require("express");
const {
    createOrder,
    getUserOrders,
    getOrder,
    updateOrderStatus,
    cancelOrder,
    getVendorOrders,
} = require("../controllers/orderController");
const { verifyToken, authorize, authorizeApprovedVendor } = require("../middleware/authMiddleware");

const router = express.Router();

// User routes
router.post("/create", verifyToken, createOrder);
router.get("/", verifyToken, getUserOrders);

// Vendor routes (must be before /:orderId to avoid param conflicts)
router.get("/vendor/all", verifyToken, authorizeApprovedVendor, getVendorOrders);

// Parameterized routes
router.get("/:orderId", verifyToken, getOrder);
router.post("/:orderId/cancel", verifyToken, cancelOrder);

// Admin routes
router.put("/:orderId/status", verifyToken, authorize("admin"), updateOrderStatus);

module.exports = router;
