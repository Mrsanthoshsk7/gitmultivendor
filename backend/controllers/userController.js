const User = require("../models/User");

// Get all users (admin)
exports.getAllUsers = async (req, res) => {
    const users = await User.find().select("-password");
    res.json(users);
};

// Get user by id
exports.getUserById = async (req, res) => {
    const user = await User.findById(req.params.id).select("-password");
    res.json(user);
};

// Delete user
exports.deleteUser = async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
};
