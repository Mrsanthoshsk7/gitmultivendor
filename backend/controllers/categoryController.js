const Category = require("../models/Category");

exports.createCategory = async (req, res) => {
    const category = await Category.create(req.body);
    res.json(category);
};

exports.getCategories = async (req, res) => {
    const categories = await Category.find();
    res.json(categories);
};

exports.deleteCategory = async (req, res) => {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted" });
};
