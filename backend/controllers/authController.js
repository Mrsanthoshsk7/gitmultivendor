const User = require("../models/User");
const Vendor = require("../models/Vendor");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { sendMail } = require("../config/email");

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role = "user" } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide name, email, and password",
    });
  }

  // Check if user exists
  let user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({
      success: false,
      message: "User already exists",
    });
  }

  // Create user
  user = await User.create({
    name,
    email,
    password,
    role,
    isApproved: role !== "vendor",
  });

  const token = generateToken(user._id, user.role);

  // Send welcome email (don't fail if email fails)
  try {
    const subject = "Welcome to Our E-commerce Platform";
    const text = `Hi ${user.name},\n\nThank you for registering on our platform. We are excited to have you on board!`;
    await sendMail(user.email, subject, text);
  } catch (emailError) {
    console.error("Email sending failed:", emailError.message);
    // Continue without failing registration
  }

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide email and password",
    });
  }

  // Check for user
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  // Check password
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: "Your account has been deactivated",
    });
  }

  const token = generateToken(user._id, user.role);

  // Send login alert (don't fail if email fails)
  try {
    const subject = "Login Alert🔐";
    const text = `Hi ${user.name},\n\nYou have successfully logged in to your account.`;
    await sendMail(user.email, subject, text);
  } catch (emailError) {
    console.error("Email sending failed:", emailError.message);
    // Continue without failing login
  }

  res.status(200).json({
    success: true,
    token,
    role: user.role,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      avatar: user.avatar,
      phone: user.phone,
    },
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      avatar: user.avatar,
      phone: user.phone,
      address: user.address,
    },
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address, avatar } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      ...(name && { name }),
      ...(phone && { phone }),
      ...(address && { address }),
      ...(avatar && { avatar }),
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      avatar: user.avatar,
      phone: user.phone,
      address: user.address,
    },
  });
});

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Please provide old and new password",
    });
  }

  const user = await User.findById(req.user.id).select("+password");

  // Check old password
  const isMatch = await user.matchPassword(oldPassword);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Old password is incorrect",
    });
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});