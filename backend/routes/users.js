const express = require('express');
const router = express.Router();
const { protect, admin } = require('../Middleware/authMiddleware');
const userController = require('../controllers/users');

router.get('/', protect, admin, userController.getAllUsers);
router.post('/', protect, admin, userController.addUser);
router.put('/:id', protect, admin, userController.updateUser);
router.get('/me', protect, userController.getCurrentUser);
router.post('/verify', userController.verifyUser);
// Add to routes/users.js
// router.post('/migrate-passwords', userController.migratePasswords);
module.exports = router;