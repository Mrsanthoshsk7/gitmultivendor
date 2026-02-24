require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");
const Category = require("./models/Category");

const fixProductCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Find all products
        const products = await Product.find({});
        console.log(`Found ${products.length} products`);

        let fixedCount = 0;

        for (const product of products) {
            // Check if category is a string (not ObjectId)
            if (typeof product.category === 'string') {
                console.log(`Fixing product: ${product.name}, category: ${product.category}`);

                // Find the category by name
                const categoryDoc = await Category.findOne({ name: product.category });
                if (categoryDoc) {
                    // Update product with ObjectId reference
                    await Product.findByIdAndUpdate(product._id, {
                        category: categoryDoc._id
                    });
                    console.log(`✓ Fixed: ${product.name} -> ${categoryDoc.name} (${categoryDoc._id})`);
                    fixedCount++;
                } else {
                    console.log(`✗ Category not found for: ${product.category} in product ${product.name}`);
                }
            }
        }

        console.log(`\nFixed ${fixedCount} products`);
        console.log("Category fix completed!");
        process.exit(0);
    } catch (err) {
        console.error("Error fixing categories:", err);
        process.exit(1);
    }
};

fixProductCategories();