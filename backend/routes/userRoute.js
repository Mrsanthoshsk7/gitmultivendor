const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, deleteUser } = require('../controllers/userController');
const { verifyToken, authorize } = require('../middleware/authmiddleware');

// Admin routes
router.get('/', verifyToken, authorize('admin'), getAllUsers);
router.get('/:id', verifyToken, authorize('admin'), getUserById);
router.delete('/:id', verifyToken, authorize('admin'), deleteUser);

module.exports = router;