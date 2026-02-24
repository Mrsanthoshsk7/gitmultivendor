const express = require("express");
const router = express.Router();
const { sendEmail } = require("../controllers/emailController");
const { register, login } = require("../controllers/authController");
// const { verifytoken } = require("../middleware/authmiddleware");
router.post("/register", register);
router.post("/login", login);
router.post("/email", sendEmail);
module.exports = router;
