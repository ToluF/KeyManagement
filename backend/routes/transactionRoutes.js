// routes/transactionRoutes.js (NEW)
const express = require('express');
const router = express.Router();
const Key = require('../models/keys');
const mongoose = require('mongoose');
const transactionCtrl = require('../controllers/transactionController');
const { protect, role } = require('../Middleware/authMiddleware');
const { logAction } = require('../Middleware/auditLogger');
const { validateObjectIds } = require('../Middleware/validateIds');
// routes/transactionRoutes.js
// Add this at the top of the router
router.get('/getId', 
    protect, 
    role('admin', 'issuer'), // Allow all authenticated roles
    transactionCtrl.getTransactions
  );
router.post('/', 
  protect, 
  role('admin', 'issuer'),
  logAction('transaction_create'),
  transactionCtrl.createTransaction);
router.post('/:id/items',
  // Existing middleware
  async (req, res, next) => {
    const keys = await Key.find({
      _id: { $in: req.body.keyIds },
      $or: [
        { status: { $ne: 'available' } },
        { currentTransaction: { $exists: true } }
      ]
    });
    
    if (keys.length > 0) {
      return res.status(400).json({
        error: 'Key state mismatch',
        invalidKeys: keys.map(k => k._id)
      });
    }
    next();
  },
  protect, role('admin', 'issuer'), transactionCtrl.validateDraft, transactionCtrl.addTransactionItems);
  // transactionRoutes.js
router.get('/:id', 
  protect,
  role('admin', 'issuer'),
  transactionCtrl.getTransactionById
);
router.post('/:id/checkout', protect, role('admin', 'issuer'), logAction('key_checkout'), transactionCtrl.finalizeTransaction);
router.post('/return', protect, role('issuer', 'admin'),logAction('key_return'), transactionCtrl.returnKey);
router.delete('/:id/delete', protect, role('admin', 'issuer'), transactionCtrl.deleteTransaction);
router.post('/mark-lost', protect, role('admin', 'issuer'), logAction('key_lost'), transactionCtrl.markKeyLost);
router.post('/validate-keys', protect, role('admin', 'issuer'), transactionCtrl.validateKeys);
router.get('/history/:keyId', protect, role('admin', 'issuer'), transactionCtrl.getKeyHistory);
router.get('/analytics', protect, role('admin', 'issuer'), validateObjectIds, transactionCtrl.getAnalyticsData);
// Add to transactionRoutes.js
router.post('/:id/verify-key-status', 
  protect,
  role('admin', 'issuer'),
  async (req, res) => {
    try {
      const key = await Key.findById(req.params.id);
      res.json({ 
        status: key.status,
        currentTransaction: key.currentTransaction 
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);
// In transactionRoutes.js
router.param('id', (req, res, next, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  next();
});

module.exports = router;