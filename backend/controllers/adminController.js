const User = require("../models/User");
const Vendor = require("../models/Vendor");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Category = require("../models/Category");
const asyncHandler = require("express-async-handler");

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalVendors = await User.countDocuments({ role: "vendor" });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    const totalRevenue = await Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const pendingApprovals = await Product.countDocuments({ isApproved: false });
    const approvedVendors = await User.countDocuments({ role: "vendor", isApproved: true });
    const pendingVendorApprovals = await User.countDocuments({ role: "vendor", isApproved: false });
    const pendingOrders = await Order.countDocuments({ orderStatus: "pending" });

    const vendorPerformance = await Order.aggregate([
        { $unwind: "$orderItems" },
        {
            $group: {
                _id: "$orderItems.vendor",
                totalRevenue: { $sum: "$orderItems.itemTotal" },
                orderCount: { $sum: 1 },
            },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: "vendors",
                localField: "_id",
                foreignField: "_id",
                as: "vendor",
            },
        },
        { $unwind: "$vendor" },
        {
            $project: {
                _id: 1,
                totalRevenue: 1,
                orderCount: 1,
                storeName: "$vendor.storeName"
            }
        }
    ]);

    const topProducts = await Product.find()
        .populate("vendor", "storeName")
        .sort({ numReviews: -1 })
        .limit(10);

    res.status(200).json({
        success: true,
        analytics: {
            totalUsers,
            totalVendors,
            totalProducts,
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            pendingOrders,
            pendingApprovals,
            approvedVendors,
            pendingVendorApprovals,
            topVendors: vendorPerformance,
            topProducts,
        },
    });
});

// @desc    Approve/Reject vendor
// @route   PUT /api/admin/vendors/:vendorId/approve
// @access  Private/Admin
exports.approveVendor = asyncHandler(async (req, res) => {
    const { isApproved, rejectionReason } = req.body;
    const { vendorId } = req.params;

    // Check if vendorId is actually a user ID (from users management page)
    let vendor;
    let isUserId = false;

    // First try to find by vendor ID
    vendor = await Vendor.findById(vendorId);

    if (!vendor) {
        // If not found, try to find vendor by user ID
        vendor = await Vendor.findOne({ user: vendorId });
        isUserId = true;
    }

    if (!vendor) {
        return res.status(404).json({
            success: false,
            message: "Vendor not found",
        });
    }

    // Update vendor
    vendor.isApproved = isApproved;
    if (rejectionReason) {
        vendor.rejectionReason = rejectionReason;
    }
    await vendor.save();

    // Update user isApproved status
    if (isApproved) {
        await User.findByIdAndUpdate(vendor.user, { isApproved: true });
    }

    res.status(200).json({
        success: true,
        message: isApproved ? "Vendor approved" : "Vendor rejected",
        vendor,
    });
});

// @desc    Approve/Reject product
// @route   PUT /api/admin/products/:productId/approve
// @access  Private/Admin
exports.approveProduct = asyncHandler(async (req, res) => {
    const { isApproved } = req.body;

    const product = await Product.findByIdAndUpdate(
        req.params.productId,
        { isApproved },
        { new: true }
    );

    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found",
        });
    }

    res.status(200).json({
        success: true,
        message: isApproved ? "Product approved" : "Product rejected",
        product,
    });
});

// @desc    Get pending products
// @route   GET /api/admin/products/pending
// @access  Private/Admin
exports.getPendingProducts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const products = await Product.find({ isApproved: false })
        .populate("vendor", "storeName user")
        .populate("category", "name")
        .sort("-createdAt")
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Product.countDocuments({ isApproved: false });

    res.status(200).json({
        success: true,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        products,
    });
});

// @desc    Create category
// @route   POST /api/admin/categories
// @access  Private/Admin
exports.createCategory = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({
            success: false,
            message: "Please provide category name",
        });
    }

    const category = await Category.create({ name, description });

    res.status(201).json({
        success: true,
        message: "Category created",
        category,
    });
});

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find().sort("name");

    res.status(200).json({
        success: true,
        categories,
    });
});

// @desc    Update category
// @route   PUT /api/admin/categories/:categoryId
// @access  Private/Admin
exports.updateCategory = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    const category = await Category.findByIdAndUpdate(
        req.params.categoryId,
        {
            ...(name && { name }),
            ...(description && { description }),
        },
        { new: true, runValidators: true }
    );

    if (!category) {
        return res.status(404).json({
            success: false,
            message: "Category not found",
        });
    }

    res.status(200).json({
        success: true,
        message: "Category updated",
        category,
    });
});

// @desc    Delete category
// @route   DELETE /api/admin/categories/:categoryId
// @access  Private/Admin
exports.deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndDelete(req.params.categoryId);

    if (!category) {
        return res.status(404).json({
            success: false,
            message: "Category not found",
        });
    }

    res.status(200).json({
        success: true,
        message: "Category deleted",
    });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, role } = req.query;

    const filter = {};
    if (role) filter.role = role;

    const skip = (page - 1) * limit;

    const users = await User.find(filter)
        .select("-password")
        .sort("-createdAt")
        .skip(skip)
        .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.status(200).json({
        success: true,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        users,
    });
});

// @desc    Get revenue analytics
// @route   GET /api/admin/analytics/revenue
// @access  Private/Admin
exports.getRevenueAnalytics = asyncHandler(async (req, res) => {
    const monthlyRevenue = await Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        {
            $group: {
                _id: { $month: "$createdAt" },
                total: { $sum: "$totalAmount" },
                count: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    const vendorRevenue = await Order.aggregate([
        { $unwind: "$orderItems" },
        { $match: { paymentStatus: "paid" } },
        {
            $group: {
                _id: "$orderItems.vendor",
                totalRevenue: { $sum: "$orderItems.itemTotal" },
            },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: "vendors",
                localField: "_id",
                foreignField: "_id",
                as: "vendor",
            },
        },
        { $unwind: "$vendor" },
    ]);

    res.status(200).json({
        success: true,
        monthlyRevenue,
        vendorRevenue,
    });
});

// @desc    Get all orders (Admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getAllOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;

    const filter = {};
    if (status) filter.orderStatus = status;

    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
        .populate("user", "name email phone")
        .populate("orderItems.product", "name images price")
        .populate("orderItems.vendor", "storeName")
        .sort("-createdAt")
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.status(200).json({
        success: true,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        orders,
    });
});
