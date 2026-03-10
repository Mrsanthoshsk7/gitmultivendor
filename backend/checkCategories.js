require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("./models/Category");

const checkCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const categories = await Category.find();
        console.log("Categories in DB:", JSON.stringify(categories, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkCategories();
