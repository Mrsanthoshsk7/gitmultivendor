const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Vendor = require("../models/Vendor");
const asyncHandler = require("express-async-handler");

// @desc    Get cart
// @route   GET /api/cart
// @access  Private
exports.getCart = asyncHandler(async (req, res) => {
    let cart = await Cart.findOne({ user: req.user.id })
        .populate({
            path: "items.product",
            select: "name price images stock discount",
        })
        .populate({
            path: "items.vendor",
            select: "storeName",
        });

    if (!cart) {
        cart = { items: [], totalItems: 0, totalPrice: 0 };
    } else {
        // Handle missing vendors
        cart.items.forEach(item => {
            if (!item.vendor) {
                item.vendor = { storeName: "Unknown Vendor" };
            }
        });
    }

    res.status(200).json({
        success: true,
        cart,
    });
});

// @desc    Add to cart
// @route   POST /api/cart/add
// @access  Private
exports.addToCart = asyncHandler(async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        console.log("addToCart request:", { productId, quantity, userId: req.user.id });

        if (!productId || quantity < 1) {
            console.log("Missing productId or invalid quantity");
            return res.status(400).json({
                success: false,
                message: "Please provide product ID and valid quantity",
            });
        }

        const product = await Product.findById(productId).populate("vendor");

        if (!product) {
            console.log("Product not found:", productId);
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        if (product.stock < quantity) {
            console.log("Insufficient stock:", { stock: product.stock, quantity });
            return res.status(400).json({
                success: false,
                message: "Insufficient stock",
            });
        }

        // Check if vendor exists
        if (!product.vendor) {
            console.log("Product has no vendor or vendor not found in DB");
            return res.status(400).json({
                success: false,
                message: "This product is currently unavailable. Please try again later.",
            });
        }

        if (!product.price || product.price < 0) {
            console.log("Invalid product price:", product.price);
            return res.status(400).json({
                success: false,
                message: "This product has an invalid price. Please try again later.",
            });
        }

        const vendorId = product.vendor._id;

        let cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            cart = await Cart.create({
                user: req.user.id,
                items: [
                    {
                        product: productId,
                        vendor: vendorId,
                        quantity,
                        price: product.price,
                    },
                ],
            });
        } else {
            // Check if product already in cart
            const existingItem = cart.items.find(
                (item) => item.product.toString() === productId
            );

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.items.push({
                    product: productId,
                    vendor: vendorId,
                    quantity,
                    price: product.price,
                });
            }
        }

        // Calculate totals
        let totalItems = 0;
        let totalPrice = 0;

        cart.items.forEach((item) => {
            totalItems += item.quantity;
            totalPrice += item.quantity * item.price;
        });

        cart.totalItems = totalItems;
        cart.totalPrice = totalPrice;

        await cart.save();

        res.status(200).json({
            success: true,
            message: "Product added to cart",
            cart,
        });
    } catch (error) {
        console.error("Error in addToCart:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});

// @desc    Update cart item
// @route   PUT /api/cart/item/:itemId
// @access  Private
exports.updateCartItem = asyncHandler(async (req, res) => {
    const { quantity } = req.body;

    if (quantity < 1) {
        return res.status(400).json({
            success: false,
            message: "Quantity must be at least 1",
        });
    }

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        return res.status(404).json({
            success: false,
            message: "Cart not found",
        });
    }

    const item = cart.items.id(req.params.itemId);

    if (!item) {
        return res.status(404).json({
            success: false,
            message: "Item not found in cart",
        });
    }

    const product = await Product.findById(item.product);

    if (product.stock < quantity) {
        return res.status(400).json({
            success: false,
            message: "Insufficient stock",
        });
    }

    item.quantity = quantity;

    // Recalculate totals
    let totalItems = 0;
    let totalPrice = 0;

    cart.items.forEach((item) => {
        totalItems += item.quantity;
        totalPrice += item.quantity * item.price;
    });

    cart.totalItems = totalItems;
    cart.totalPrice = totalPrice;

    await cart.save();

    res.status(200).json({
        success: true,
        message: "Cart item updated",
        cart,
    });
});

// @desc    Remove from cart
// @route   DELETE /api/cart/item/:itemId
// @access  Private
exports.removeFromCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        return res.status(404).json({
            success: false,
            message: "Cart not found",
        });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== req.params.itemId);

    // Recalculate totals
    let totalItems = 0;
    let totalPrice = 0;

    cart.items.forEach((item) => {
        totalItems += item.quantity;
        totalPrice += item.quantity * item.price;
    });

    cart.totalItems = totalItems;
    cart.totalPrice = totalPrice;

    await cart.save();

    res.status(200).json({
        success: true,
        message: "Item removed from cart",
        cart,
    });
});

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
exports.clearCart = asyncHandler(async (req, res) => {
    await Cart.findOneAndUpdate(
        { user: req.user.id },
        { items: [], totalItems: 0, totalPrice: 0 }
    );

    res.status(200).json({
        success: true,
        message: "Cart cleared",
    });

});
