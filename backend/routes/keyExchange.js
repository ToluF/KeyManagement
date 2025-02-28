const express = require('express');
const router = express.Router();
const exchangeController = require('../controllers/exchange');
const { protect, admin } = require('../Middleware/authMiddleware');

router.get('/', protect, exchangeController.getExchangeData);
router.post('/assign', protect, admin, exchangeController.assignKey);
router.post('/return', protect, admin, exchangeController.returnKey);
router.post('/mark-lost', protect, admin, exchangeController.markKeyLost);
router.get('/history/:keyId', exchangeController.getKeyHistory);

module.exports = router;