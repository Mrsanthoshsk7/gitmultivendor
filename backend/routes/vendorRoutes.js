const express = require("express");
const {
    registerVendor,
    getVendorProfile,
    updateVendorProfile,
    getDashboardStats,
    getPublicVendorProfile,
    getVendorReviews,
    getAllVendors,
} = require("../controllers/vendorController");
const { verifyToken, authorize, authorizeApprovedVendor } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin routes (before param routes)
router.get("/", verifyToken, authorize("admin"), getAllVendors);

// Vendor routes (before /:vendorId param route)
router.post("/register", verifyToken, registerVendor);
router.get("/profile/me", verifyToken, authorize("vendor"), getVendorProfile);
router.put("/profile/me", verifyToken, authorizeApprovedVendor, updateVendorProfile);
router.get("/dashboard/stats", verifyToken, authorizeApprovedVendor, getDashboardStats);

// Public param routes (after all static paths)
router.get("/:vendorId/reviews", getVendorReviews);
router.get("/:vendorId", getPublicVendorProfile);

module.exports = router;
