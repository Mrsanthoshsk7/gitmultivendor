const Vendor = require("../models/Vendor");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Review = require("../models/Review");
const asyncHandler = require("express-async-handler");

// @desc    Register as vendor
// @route   POST /api/vendors/register
// @access  Private
exports.registerVendor = asyncHandler(async (req, res) => {
  const { storeName, storeDescription, bankDetails } = req.body;

  // Check if already vendor
  let vendor = await Vendor.findOne({ user: req.user.id });
  if (vendor) {
    return res.status(400).json({
      success: false,
      message: "You are already registered as a vendor",
    });
  }

  // Update user role
  await User.findByIdAndUpdate(req.user.id, { role: "vendor" });

  vendor = await Vendor.create({
    user: req.user.id,
    storeName,
    storeDescription,
    bankDetails,
  });

  res.status(201).json({
    success: true,
    message: "Vendor registration submitted. Awaiting admin approval.",
    vendor,
  });
});

// @desc    Get vendor profile
// @route   GET /api/vendors/profile
// @access  Private/Vendor
exports.getVendorProfile = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ user: req.user.id }).populate(
    "user",
    "name email phone avatar"
  );

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: "Vendor profile not found",
    });
  }

  res.status(200).json({
    success: true,
    vendor,
  });
});

// @desc    Update vendor profile
// @route   PUT /api/vendors/profile
// @access  Private/Vendor
exports.updateVendorProfile = asyncHandler(async (req, res) => {
  const { storeDescription, storeLogo, storeImage, bankDetails } = req.body;

  const vendor = await Vendor.findOneAndUpdate(
    { user: req.user.id },
    {
      ...(storeDescription && { storeDescription }),
      ...(storeLogo && { storeLogo }),
      ...(storeImage && { storeImage }),
      ...(bankDetails && { bankDetails }),
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Vendor profile updated",
    vendor,
  });
});

// @desc    Get vendor dashboard stats
// @route   GET /api/vendors/dashboard/stats
// @access  Private/Vendor
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ user: req.user.id });

  if (!vendor) {
    return res.status(403).json({
      success: false,
      message: "Vendor not found",
    });
  }

  // Get stats
  const totalProducts = await Product.countDocuments({ vendor: vendor._id });
  const totalOrders = await Order.countDocuments({ "orderItems.vendor": vendor._id });
  const totalRevenue = await Order.aggregate([
    { $match: { "orderItems.vendor": vendor._id } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);

  const totalReviews = await Review.countDocuments({ vendor: vendor._id });
  const avgRating = await Review.aggregate([
    { $match: { vendor: vendor._id } },
    { $group: { _id: null, avgRating: { $avg: "$rating" } } },
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalReviews,
      avgRating: avgRating[0]?.avgRating || 0,
      isApproved: vendor.isApproved,
      totalEarnings: vendor.totalEarnings,
    },
  });
});

// @desc    Get public vendor profile
// @route   GET /api/vendors/:vendorId
// @access  Public
exports.getPublicVendorProfile = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.vendorId)
    .populate("user", "name avatar")
    .select("-bankDetails");

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: "Vendor not found",
    });
  }

  res.status(200).json({
    success: true,
    vendor,
  });
});

// @desc    Get vendor reviews
// @route   GET /api/vendors/:vendorId/reviews
// @access  Public
exports.getVendorReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const skip = (page - 1) * limit;

  const reviews = await Review.find({ vendor: req.params.vendorId })
    .populate("user", "name avatar")
    .populate("product", "name")
    .sort("-createdAt")
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Review.countDocuments({ vendor: req.params.vendorId });

  res.status(200).json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    reviews,
  });
});

// @desc    Get all vendors (admin)
// @route   GET /api/vendors
// @access  Private/Admin
exports.getAllVendors = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, approved } = req.query;

  const filter = {};
  if (approved === "true") filter.isApproved = true;
  if (approved === "false") filter.isApproved = false;

  const skip = (page - 1) * limit;

  const vendors = await Vendor.find(filter)
    .populate("user", "name email phone")
    .sort("-createdAt")
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Vendor.countDocuments(filter);

  res.status(200).json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    vendors,
  });
});
