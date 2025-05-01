const express = require('express');
const router = express.Router();
const { protect, role } = require('../Middleware/authMiddleware');
const userController = require('../controllers/users');

router.put('/:id/role', 
    protect, 
    role('admin'),
    userController.updateUserRole
  );
router.get('/', protect, role('admin', 'issuer'), userController.getAllUsers);
router.post('/', protect, role('admin'), userController.addUser);
router.get('/:id', protect, userController.getUser);
router.put('/:id', protect, role('admin', 'issuer'), userController.updateUser);
router.get('/me', protect, userController.getCurrentUser);
router.post('/verify', userController.verifyUser);
// Add to routes/users.js
// router.post('/migrate-passwords', userController.migratePasswords);
module.exports = router;