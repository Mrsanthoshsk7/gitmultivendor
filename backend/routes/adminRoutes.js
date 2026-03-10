const express = require("express");
const {
  getAnalytics,
  approveVendor,
  approveProduct,
  getPendingProducts,
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  getAllUsers,
  getRevenueAnalytics,
  getAllOrders,
} = require("../controllers/adminController");
const { verifyToken, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(verifyToken, authorize("admin")); // All admin routes need authentication

// Analytics
router.get("/analytics", getAnalytics);
router.get("/analytics/revenue", getRevenueAnalytics);

// Vendor management
router.put("/vendors/:vendorId/approve", approveVendor);

// Product management
router.get("/products/pending", getPendingProducts);
router.put("/products/:productId/approve", approveProduct);

// Category management
router.get("/categories", getCategories);
router.post("/categories", createCategory);
router.put("/categories/:categoryId", updateCategory);
router.delete("/categories/:categoryId", deleteCategory);

// User management
router.get("/users", getAllUsers);

// Order management
router.get("/orders", getAllOrders);

module.exports = router;
