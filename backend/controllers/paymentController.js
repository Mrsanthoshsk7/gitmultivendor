const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require("../models/Order");
const Vendor = require("../models/Vendor");
const asyncHandler = require("express-async-handler");

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private
exports.createOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({
      success: false,
      message: "Please provide orderId",
    });
  }

  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  // Check if order belongs to user
  if (order.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to pay for this order",
    });
  }

  if (order.paymentStatus === "paid") {
    return res.status(400).json({
      success: false,
      message: "Order already paid",
    });
  }

  // Create Razorpay order
  const options = {
    amount: order.totalAmount * 100, // Razorpay expects amount in paisa
    currency: "INR",
    receipt: `receipt_${order._id}`,
    payment_capture: 1, // Auto capture
  };

  try {
    const razorpayOrder = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order: razorpayOrder,
      orderId: order._id,
      amount: order.totalAmount,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment order",
    });
  }
});

// @desc    Verify Razorpay payment
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
    return res.status(400).json({
      success: false,
      message: "Missing payment verification data",
    });
  }

  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  // Check if order belongs to user
  if (order.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "Not authorized",
    });
  }

  // Verify signature
  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature !== expectedSign) {
    return res.status(400).json({
      success: false,
      message: "Payment verification failed",
    });
  }

  // Payment successful
  order.paymentStatus = "paid";
  order.paymentId = razorpay_payment_id;
  order.orderStatus = "confirmed";

  // Update vendor earnings
  for (const item of order.orderItems) {
    const vendor = await Vendor.findById(item.vendor);
    if (vendor) {
      const commission = (item.itemTotal * vendor.commissionRate) / 100;
      const earnings = item.itemTotal - commission;
      vendor.totalEarnings += earnings;
      vendor.totalRevenue += item.itemTotal;
      vendor.totalOrders += 1;
      await vendor.save();
    }
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: "Payment verified successfully",
    payment: {
      paymentId: razorpay_payment_id,
      order: order,
      status: "success",
    },
  });
});

// @desc    Get payment status
// @route   GET /api/payments/status/:paymentId
// @access  Private
exports.getPaymentStatus = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ paymentId: req.params.paymentId });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Payment not found",
    });
  }

  // Check authorization
  if (order.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "Not authorized",
    });
  }

  res.status(200).json({
    success: true,
    payment: {
      paymentId: req.params.paymentId,
      orderId: order._id,
      status: order.paymentStatus,
      amount: order.totalAmount,
    },
  });
});

// @desc    Refund payment
// @route   POST /api/payments/refund
// @access  Private
exports.refundPayment = asyncHandler(async (req, res) => {
  const { orderId, reason } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  // Check authorization
  if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Not authorized",
    });
  }

  if (order.paymentStatus !== "paid") {
    return res.status(400).json({
      success: false,
      message: "Only paid orders can be refunded",
    });
  }

  try {
    // Create refund using Razorpay
    const refund = await razorpay.payments.refund(order.paymentId, {
      amount: order.totalAmount * 100, // Amount in paisa
      notes: {
        reason: reason || "Customer requested refund",
      },
    });

    order.paymentStatus = "refunded";
    order.orderStatus = "cancelled";
    await order.save();

    // Reverse vendor earnings
    for (const item of order.orderItems) {
      const vendor = await Vendor.findById(item.vendor);
      if (vendor) {
        const commission = (item.itemTotal * vendor.commissionRate) / 100;
        const earnings = item.itemTotal - commission;
        vendor.totalEarnings -= earnings;
        vendor.totalRevenue -= item.itemTotal;
        await vendor.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      refund: {
        refundId: refund.id,
        orderId,
        amount: order.totalAmount,
        status: refund.status,
        reason,
      },
    });
  } catch (error) {
    console.error('Refund failed:', error);
    res.status(500).json({
      success: false,
      message: "Refund processing failed",
    });
  }
});
// @desc    Handle Razorpay Webhook
// @route   POST /api/payments/webhook
// @access  Public
exports.razorpayWebhook = asyncHandler(async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "your_webhook_secret";

  const signature = req.headers["x-razorpay-signature"];

  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  if (signature === digest) {
    const event = req.body.event;
    const payload = req.body.payload;

    if (event === "payment.captured") {
      const paymentId = payload.payment.entity.id;
      const orderId = payload.payment.entity.notes.order_id;
      const razorpayOrderId = payload.payment.entity.order_id;

      const order = await Order.findById(orderId);
      if (order && order.paymentStatus !== "paid") {
        order.paymentStatus = "paid";
        order.paymentId = paymentId;
        order.orderStatus = "confirmed";

        // Update vendor earnings
        for (const item of order.orderItems) {
          const vendor = await Vendor.findById(item.vendor);
          if (vendor) {
            const commission = (item.itemTotal * vendor.commissionRate) / 100;
            const earnings = item.itemTotal - commission;
            vendor.totalEarnings += earnings;
            vendor.totalRevenue += item.itemTotal;
            vendor.totalOrders += 1;
            await vendor.save();
          }
        }
        await order.save();
      }
    }
    res.status(200).json({ status: "ok" });
  } else {
    res.status(400).json({ status: "invalid signature" });
  }
});
