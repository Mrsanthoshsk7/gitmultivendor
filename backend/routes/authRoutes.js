const express = require("express");
const {
    register,
    login,
    getCurrentUser,
    updateProfile,
    changePassword,
    logout,
} = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
// logout is defined below with verifyToken

// Protected routes
router.get("/me", verifyToken, getCurrentUser);
router.put("/profile", verifyToken, updateProfile);
router.post("/change-password", verifyToken, changePassword);
router.post("/logout", verifyToken, logout);

module.exports = router;
