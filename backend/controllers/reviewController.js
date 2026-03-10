const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");
const asyncHandler = require("express-async-handler");

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
exports.createReview = asyncHandler(async (req, res) => {
    const { productId, rating, comment, title } = req.body;

    if (!productId || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({
            success: false,
            message: "Please provide valid product ID and rating (1-5)",
        });
    }

    // Check if product exists
    const product = await Product.findById(productId).populate("vendor");

    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found",
        });
    }

    // Check if user has purchased this product
    const order = await Order.findOne({
        user: req.user.id,
        "orderItems.product": productId,
    });

    if (!order) {
        return res.status(403).json({
            success: false,
            message: "You can only review products you have purchased",
        });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
        user: req.user.id,
        product: productId,
    });

    if (existingReview) {
        return res.status(400).json({
            success: false,
            message: "You have already reviewed this product",
        });
    }

    const review = await Review.create({
        user: req.user.id,
        product: productId,
        vendor: product.vendor._id,
        rating,
        comment,
        title,
        verified: true,
    });

    // Update product rating
    const reviews = await Review.find({ product: productId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(productId, {
        rating: avgRating,
        numReviews: reviews.length,
    });

    res.status(201).json({
        success: true,
        message: "Review posted successfully",
        review,
    });
});

// @desc    Get product reviews
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = asyncHandler(async (req, res) => {
    const { page = 1, limit = 5, sort = "-createdAt" } = req.query;

    const skip = (page - 1) * limit;

    const reviews = await Review.find({ product: req.params.productId })
        .populate("user", "name avatar")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Review.countDocuments({ product: req.params.productId });

    res.status(200).json({
        success: true,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        reviews,
    });
});

// @desc    Update review
// @route   PUT /api/reviews/:reviewId
// @access  Private
exports.updateReview = asyncHandler(async (req, res) => {
    const { rating, comment, title } = req.body;

    const review = await Review.findById(req.params.reviewId);

    if (!review) {
        return res.status(404).json({
            success: false,
            message: "Review not found",
        });
    }

    // Check authorization
    if (review.user.toString() !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: "Not authorized to update this review",
        });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    review.title = title || review.title;

    await review.save();

    // Recalculate product rating
    const reviews = await Review.find({ product: review.product });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(review.product, {
        rating: avgRating,
    });

    res.status(200).json({
        success: true,
        message: "Review updated successfully",
        review,
    });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:reviewId
// @access  Private
exports.deleteReview = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
        return res.status(404).json({
            success: false,
            message: "Review not found",
        });
    }

    // Check authorization
    if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Not authorized to delete this review",
        });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(req.params.reviewId);

    // Recalculate product rating
    const reviews = await Review.find({ product: productId });
    const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

    await Product.findByIdAndUpdate(productId, {
        rating: avgRating,
        numReviews: reviews.length,
    });

    res.status(200).json({
        success: true,
        message: "Review deleted successfully",
    });
});

// @desc    Get user's reviews
// @route   GET /api/reviews/user/my-reviews
// @access  Private
exports.getMyReviews = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const reviews = await Review.find({ user: req.user.id })
        .populate("product", "name images")
        .populate("vendor", "storeName")
        .sort("-createdAt")
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Review.countDocuments({ user: req.user.id });

    res.status(200).json({
        success: true,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        reviews,
    });
});

// @desc    Mark review helpful
// @route   POST /api/reviews/:reviewId/helpful
// @access  Private
exports.markHelpful = asyncHandler(async (req, res) => {
    const review = await Review.findByIdAndUpdate(
        req.params.reviewId,
        { $inc: { helpful: 1 } },
        { new: true }
    );

    res.status(200).json({
        success: true,
        message: "Review marked as helpful",
        review,
    });
});
