const Product = require("../models/Product");
const Vendor = require("../models/Vendor");
const Category = require("../models/Category");
const asyncHandler = require("express-async-handler");

// @desc    Get all products (public)
// @route   GET /api/products
// @access  Public
exports.getAllProducts = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        category,
        vendor,
        minPrice,
        maxPrice,
        search,
        sort = "-createdAt",
    } = req.query;

    const filter = { isActive: true, isApproved: true };

    if (category) {
        // Find category by name or ID
        const categoryDoc = await Category.findOne({
            $or: [
                { _id: category },
                { name: category }
            ]
        });
        if (categoryDoc) {
            filter.category = categoryDoc._id;
        }
    }
    if (vendor) filter.vendor = vendor;
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ];
    }

    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = minPrice;
        if (maxPrice) filter.price.$lte = maxPrice;
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
        .populate({
            path: "vendor",
            select: "storeName storeLogo rating",
            options: { lean: false }
        })
        .populate("category", "name")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

    // Handle missing vendors
    products.forEach(product => {
        if (!product.vendor) {
            product.vendor = {
                storeName: "Unknown Vendor",
                storeLogo: null,
                rating: 0
            };
        }
    });

    const total = await Product.countDocuments(filter);

    res.status(200).json({
        success: true,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        products,
    });
});

// @desc    Get all categories (public)
// @route   GET /api/products/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({ isActive: true }).sort('name');

    res.status(200).json({
        success: true,
        categories,
    });
});

// @desc    Get single product
// @route   GET /api/products/:productId
// @access  Public
exports.getProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.productId)
        .populate({
            path: "vendor",
            select: "storeName storeDescription storeLogo rating totalReviews",
            options: { lean: false }
        })
        .populate("category", "name");

    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found",
        });
    }

    // If vendor was not found during populate, set a default vendor object
    if (!product.vendor) {
        product.vendor = {
            storeName: "Unknown Vendor",
            storeDescription: "",
            storeLogo: null,
            rating: 0,
            totalReviews: 0
        };
    }

    res.status(200).json({
        success: true,
        product,
    });
});

// @desc    Create product (vendor only)
// @route   POST /api/products
// @access  Private/Vendor
exports.createProduct = asyncHandler(async (req, res) => {
    const {
        name,
        description,
        price,
        category,
        stock,
        sku,
        tags,
        discount,
        specifications,
    } = req.body;

    // Get images from uploaded files
    console.log("Uploaded files:", req.files);
    let images = [];
    try {
        images = req.files ? req.files.map(file => file.path) : [];
    } catch (err) {
        console.error("Error mapping images:", err);
    }

    const missingFields = [];
    if (!name) missingFields.push("name");
    if (!description) missingFields.push("description");
    if (!price && price !== 0) missingFields.push("price");
    if (!category) missingFields.push("category");
    if (!stock && stock !== 0) missingFields.push("stock");
    if (images.length === 0) missingFields.push("images");

    if (missingFields.length > 0) {
        return res.status(400).json({
            success: false,
            message: `Please provide all required fields. Missing: ${missingFields.join(", ")}`,
        });
    }

    // Find category by name (case-insensitive)
    const categoryDoc = await Category.findOne({
        name: { $regex: new RegExp(`^${category}$`, "i") }
    });

    if (!categoryDoc) {
        return res.status(400).json({
            success: false,
            message: `Category "${category}" not found.`,
        });
    }

    // Get vendor
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
        return res.status(403).json({
            success: false,
            message: "You must be a vendor to create products. Register as vendor first.",
        });
    }

    try {
        const product = await Product.create({
            name,
            description,
            price,
            images,
            category: categoryDoc._id,
            vendor: vendor._id,
            stock,
            sku,
            tags,
            discount,
            specifications,
            isApproved: false,
        });

        res.status(201).json({
            success: true,
            message: "Product created successfully. Awaiting admin approval.",
            product,
        });
    } catch (error) {
        console.error("Database error creating product:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create product in database",
            error: error.message
        });
    }
});

// @desc    Update product (vendor only)
// @route   PUT /api/products/:productId
// @access  Private/Vendor
exports.updateProduct = asyncHandler(async (req, res) => {
    let product = await Product.findById(req.params.productId);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found",
        });
    }

    // Check if user is vendor owner
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor || product.vendor.toString() !== vendor._id.toString()) {
        return res.status(403).json({
            success: false,
            message: "Not authorized to update this product",
        });
    }

    const {
        name,
        description,
        price,
        images,
        category,
        stock,
        tags,
        discount,
        specifications,
    } = req.body;

    product = await Product.findByIdAndUpdate(
        req.params.productId,
        {
            ...(name && { name }),
            ...(description && { description }),
            ...(price && { price }),
            ...(images && { images }),
            ...(category && { category }),
            ...(stock !== undefined && { stock }),
            ...(tags && { tags }),
            ...(discount !== undefined && { discount }),
            ...(specifications && { specifications }),
            isApproved: false,
        },
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        message: "Product updated. Awaiting admin approval.",
        product,
    });
});

// @desc    Delete product (vendor only)
// @route   DELETE /api/products/:productId
// @access  Private/Vendor
exports.deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.productId);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found",
        });
    }

    // Check if user is vendor owner
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor || product.vendor.toString() !== vendor._id.toString()) {
        return res.status(403).json({
            success: false,
            message: "Not authorized to delete this product",
        });
    }

    await Product.findByIdAndDelete(req.params.productId);

    res.status(200).json({
        success: true,
        message: "Product deleted successfully",
    });
});

// @desc    Get vendor products
// @route   GET /api/products/vendor/:vendorId
// @access  Public
exports.getVendorProducts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search } = req.query;

    const filter = { vendor: req.params.vendorId, isActive: true, isApproved: true };

    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ];
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
        .populate("category", "name")
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.status(200).json({
        success: true,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        products,
    });
});

// @desc    Get current vendor's products
// @route   GET /api/products/vendor/me
// @access  Private/Vendor
exports.getMyVendorProducts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search } = req.query;

    // Get vendor
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
        return res.status(403).json({
            success: false,
            message: "You must be a vendor to view products",
        });
    }

    const filter = { vendor: vendor._id, isActive: true };

    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ];
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
        .populate("category", "name")
        .sort("-createdAt")
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.status(200).json({
        success: true,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        products,
    });
});

