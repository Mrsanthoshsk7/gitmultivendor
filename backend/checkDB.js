require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const count = await Product.countDocuments();
        console.log(`Total products in DB: ${count}`);

        const approvedCount = await Product.countDocuments({ isApproved: true });
        console.log(`Approved products: ${approvedCount}`);

        const pendingCount = await Product.countDocuments({ isApproved: false });
        console.log(`Pending products: ${pendingCount}`);

        if (count > 0) {
            const sample = await Product.findOne();
            console.log("Sample product:", JSON.stringify(sample, null, 2));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkDB();
