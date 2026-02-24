const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        orderNumber: {
            type: String,
            unique: true,
            required: true,
        },
        orderItems: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                vendor: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Vendor",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                price: {
                    type: Number,
                    required: true,
                },
                itemTotal: {
                    type: Number,
                    required: true,
                },
            },
        ],
        shippingAddress: {
            name: String,
            email: String,
            phone: String,
            address: String,
            city: String,
            state: String,
            postalCode: String,
            country: String,
        },
        paymentMethod: {
            type: String,
            enum: ["UPI", "CARD", "COD", "SIM_UPI", "Razorpay"],
            default: "Razorpay",
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending",
        },
        paymentId: String,
        orderStatus: {
            type: String,
            enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
            default: "pending",
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        taxAmount: {
            type: Number,
            default: 0,
        },
        shippingCharge: {
            type: Number,
            default: 0,
        },
        discount: {
            type: Number,
            default: 0,
        },
        isDelivered: {
            type: Boolean,
            default: false,
        },
        deliveredAt: Date,
        cancelledAt: Date,
        cancellationReason: String,
        notes: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
