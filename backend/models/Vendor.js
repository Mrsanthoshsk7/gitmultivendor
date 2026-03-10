const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        storeName: {
            type: String,
            required: [true, "Please provide a store name"],
            unique: true,
            trim: true,
        },
        storeDescription: {
            type: String,
            maxlength: [500, "Description cannot be more than 500 characters"],
        },
        storeLogo: {
            type: String,
            default: null,
        },
        storeImage: {
            type: String,
            default: null,
        },
        commissionRate: {
            type: Number,
            default: 10,
            min: 0,
            max: 100,
        },
        totalEarnings: {
            type: Number,
            default: 0,
        },
        totalRevenue: {
            type: Number,
            default: 0,
        },
        totalOrders: {
            type: Number,
            default: 0,
        },
        isApproved: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        totalReviews: {
            type: Number,
            default: 0,
        },
        bankDetails: {
            accountHolder: String,
            accountNumber: String,
            ifscCode: String,
        },
        rejectionReason: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model("Vendor", vendorSchema);
