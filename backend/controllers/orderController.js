const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Vendor = require("../models/Vendor");
const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");

// Generate Order Number
const generateOrderNumber = () => {
  return "ORD-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
};

// @desc    Create order from cart
// @route   POST /api/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res) => {
  try {
    const { shippingAddress, paymentMethod = "Razorpay" } = req.body;
    console.log("createOrder request body:", JSON.stringify(req.body, null, 2));

    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city) {
      console.log("Invalid shipping address");
      return res.status(400).json({
        success: false,
        message: "Please provide complete shipping address",
      });
    }

    // Get cart
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      console.log("Cart is empty or not found for user:", req.user.id);
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Get user
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log("User not found in DB:", req.user.id);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    console.log("Creating order for user:", { id: user._id, name: user.name });

    // Create order items and validate stock
    const orderItems = [];
    for (const item of cart.items) {
      const product = item.product;
      console.log("Checking cart item:", {
        productId: item.product?._id,
        productName: item.product?.name,
        itemVendor: item.vendor,
        quantity: item.quantity
      });

      if (!product) {
        console.log("Product not found for item in cart");
        continue;
      }

      if (product.stock < item.quantity) {
        console.log("Insufficient stock for product:", product.name);
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }

      // Ensure vendor is present (it's required in Order schema)
      let vendorId = item.vendor;
      if (!vendorId && product.vendor) {
        vendorId = product.vendor;
        console.log("Using product vendor as fallback:", vendorId);
      }

      if (!vendorId) {
        console.error("CRITICAL: Vendor ID missing for product:", product.name, product._id);
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} has no associated vendor. Please contact support.`,
        });
      }

      const itemPrice = item.price || product.price || 0;
      if (itemPrice <= 0) {
        console.log("Warning: Item price is 0 or less:", { name: product.name, itemPrice });
      }

      orderItems.push({
        product: product._id,
        vendor: vendorId,
        quantity: item.quantity,
        price: itemPrice,
        itemTotal: itemPrice * item.quantity,
      });

      // Deduct stock using findByIdAndUpdate to avoid triggering validation on invalid category strings
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    if (orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid items in cart to order",
      });
    }

    // Calculate totals
    const totalAmount = orderItems.reduce((sum, item) => sum + item.itemTotal, 0);
    const taxAmount = Math.round(totalAmount * 0.18); // 18% GST
    const shippingCharge = 50; // Match frontend or pass from request
    const grandTotal = totalAmount + taxAmount + shippingCharge;

    console.log("Totals:", { totalAmount, taxAmount, shippingCharge, grandTotal });

    if (isNaN(grandTotal)) {
      console.error("CRITICAL: grandTotal is NaN!");
      return res.status(500).json({
        success: false,
        message: "Order calculation failed. Please try again later.",
      });
    }

    // Create order
    const orderData = {
      user: req.user.id,
      orderNumber: generateOrderNumber(),
      orderItems,
      shippingAddress: {
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        ...shippingAddress,
      },
      paymentMethod,
      totalAmount: grandTotal,
      taxAmount,
      shippingCharge,
    };
    console.log("Creating order with data:", JSON.stringify(orderData, null, 2));

    // EMERGENCY LOGGING TO FILE
    const fs = require('fs');
    const path = require('path');
    const logPath = path.join(__dirname, '../order_debug.log');
    fs.appendFileSync(logPath, `\n\n--- [${new Date().toISOString()}] ---\n`);
    fs.appendFileSync(logPath, `USER: ${req.user.id}\n`);
    fs.appendFileSync(logPath, `DATA: ${JSON.stringify(orderData, null, 2)}\n`);

    const order = await Order.create(orderData);

    // Clear cart
    await Cart.findOneAndUpdate(
      { user: req.user.id },
      { items: [], totalItems: 0, totalPrice: 0 }
    );

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("DETAILED ERROR IN createOrder:", error);

    // EMERGENCY ERROR LOGGING TO FILE
    const fs = require('fs');
    const path = require('path');
    const logPath = path.join(__dirname, '../order_debug.log');
    fs.appendFileSync(logPath, `ERROR: ${error.message}\n`);
    fs.appendFileSync(logPath, `STACK: ${error.stack}\n`);

    res.status(500).json({
      success: false,
      message: "Internal server error during order creation",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const filter = { user: req.user.id };
  if (status) filter.orderStatus = status;

  const skip = (page - 1) * limit;

  const orders = await Order.find(filter)
    .populate("orderItems.product", "name images price")
    .populate("orderItems.vendor", "storeName")
    .sort("-createdAt")
    .skip(skip)
    .limit(parseInt(limit));

  // Handle missing vendors
  orders.forEach(order => {
    order.orderItems.forEach(item => {
      if (!item.vendor) {
        item.vendor = { storeName: "Unknown Vendor" };
      }
    });
  });

  const total = await Order.countDocuments(filter);

  res.status(200).json({
    success: true,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    orders,
  });
});

// @desc    Get single order
// @route   GET /api/orders/:orderId
// @access  Private
exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId)
    .populate("orderItems.product")
    .populate("orderItems.vendor", "storeName rating")
    .populate("user", "name email phone");

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  // Handle missing vendors
  order.orderItems.forEach(item => {
    if (!item.vendor) {
      item.vendor = { storeName: "Unknown Vendor", rating: 0 };
    }
  });

  // Check authorization
  if (order.user._id.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Not authorized to view this order",
    });
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:orderId/status
// @access  Private/Admin
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body;

  const validStatus = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

  if (!validStatus.includes(orderStatus)) {
    return res.status(400).json({
      success: false,
      message: "Invalid order status",
    });
  }

  const order = await Order.findByIdAndUpdate(
    req.params.orderId,
    { orderStatus },
    { new: true, runValidators: true }
  );

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Order status updated",
    order,
  });
});

// @desc    Cancel order
// @route   POST /api/orders/:orderId/cancel
// @access  Private
exports.cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const order = await Order.findById(req.params.orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  // Check authorization
  if (order.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to cancel this order",
    });
  }

  if (["shipped", "delivered", "cancelled"].includes(order.orderStatus)) {
    return res.status(400).json({
      success: false,
      message: "Cannot cancel this order",
    });
  }

  // Restore stock
  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);
    product.stock += item.quantity;
    await product.save();
  }

  order.orderStatus = "cancelled";
  order.cancelledAt = new Date();
  order.cancellationReason = reason;
  await order.save();

  res.status(200).json({
    success: true,
    message: "Order cancelled successfully",
    order,
  });
});

// @desc    Get vendor orders
// @route   GET /api/orders/vendor/all
// @access  Private/Vendor
exports.getVendorOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const vendor = await Vendor.findOne({ user: req.user.id });

  if (!vendor) {
    return res.status(403).json({
      success: false,
      message: "Only vendors can access this route",
    });
  }

  const filter = { "orderItems.vendor": vendor._id };
  if (status) filter.orderStatus = status;

  const skip = (page - 1) * limit;

  const orders = await Order.find(filter)
    .populate("orderItems.product", "name images")
    .populate("user", "name email phone")
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
