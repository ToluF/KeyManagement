const express = require('express');
const router = express.Router();
const { protect, admin } = require('../Middleware/authMiddleware');
const userController = require('../controllers/users');

router.get('/', protect, admin, userController.getAllUsers);
router.post('/', protect, admin, userController.addUser);
router.get('/me', protect, userController.getCurrentUser);

module.exports = router;