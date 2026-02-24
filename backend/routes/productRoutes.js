const express = require("express");
const {
    getAllProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getVendorProducts,
    getMyVendorProducts,
    getCategories,
} = require("../controllers/productController");
const { verifyToken, authorize, authorizeApprovedVendor } = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");

const router = express.Router();

// Public routes
router.get("/", getAllProducts);
router.get("/categories", getCategories);

// Vendor routes (must be before /:productId to avoid param conflicts)
router.get("/vendor/me", verifyToken, authorizeApprovedVendor, getMyVendorProducts);
router.get("/vendor/:vendorId", getVendorProducts);
router.get("/:productId", getProduct);
router.post("/", verifyToken, authorizeApprovedVendor, upload.array("images", 10), createProduct);
router.put("/:productId", verifyToken, authorizeApprovedVendor, updateProduct);
router.delete("/:productId", verifyToken, authorizeApprovedVendor, deleteProduct);

module.exports = router;
