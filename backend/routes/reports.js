const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, role } = require('../Middleware/authMiddleware');

router.get('/', protect, role('admin'), reportController.generateReport);

module.exports = router;