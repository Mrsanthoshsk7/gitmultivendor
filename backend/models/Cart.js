const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                vendor: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Vendor",
                    required: false, // Made optional to handle legacy data
                },
                quantity: {
                    type: Number,
                    default: 1,
                    min: 1,
                },
                price: Number,
                addedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        totalItems: {
            type: Number,
            default: 0,
        },
        totalPrice: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
