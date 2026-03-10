const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please provide a product name"],
            trim: true,
            minlength: [3, "Name must be at least 3 characters"],
        },
        description: {
            type: String,
            required: [true, "Please provide a product description"],
            minlength: [10, "Description must be at least 10 characters"],
        },
        price: {
            type: Number,
            required: [true, "Please provide a price"],
            min: [0, "Price cannot be negative"],
        },
        images: [
            {
                type: String,
                required: true,
            },
        ],
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            required: true,
        },
        stock: {
            type: Number,
            default: 0,
            min: 0,
        },
        sku: {
            type: String,
            unique: true,
            sparse: true,
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        numReviews: {
            type: Number,
            default: 0,
        },
        tags: [String],
        isActive: {
            type: Boolean,
            default: true,
        },
        isApproved: {
            type: Boolean,
            default: false,
        },
        specifications: mongoose.Schema.Types.Mixed,
        discount: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
