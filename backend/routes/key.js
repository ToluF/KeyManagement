const express = require('express');
const router = express.Router();
const key = require('../controllers/keys');
const { protect, role } = require('../Middleware/authMiddleware');
const mongoose = require('mongoose');
const {validateKeyId} = require('../Middleware/validateIds');

// const validateKeyId = (req, res, next) => {
//     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//       return res.status(400).json({ error: 'Invalid key ID format' });
//     }
//     next();
//   };

// GET /api/keys/available - Get available keys
router.get('/available', key.getAvailableKeys); // New route

// GET /api/keys/search?query= - Search keys
router.get('/search', key.searchKeys);

// POST /api/keys - Create new key
router.post('/add', protect, role('admin', 'issuer'), key.addKey);

router.get('/analytics', key.getKeyAnalytics);

// Bulk deactivation
router.put('/bulk', key.bulkDeactivateKeys);

// GET /api/keys - Get all keys
router.get('/', key.getAllKeys);

// GET /api/keys/:id/details - Get key details
router.get('/:id/details',validateKeyId, key.getKeyDetails);

// GET /api/keys/:id - Get single key
router.get('/:id', validateKeyId, key.getKey); // Add this line

router.get('/:id/reserved', validateKeyId, protect, role('admin', 'issuer'), key.getReservedKeys);

// GET /api/keys/:id/history - Get key history
router.get('/:id/history', validateKeyId ,protect, role('admin', 'issuer'), key.getKeyHistory);


// PUT /api/keys/:id - Update key
router.put('/:id/update', protect, role('admin', 'issuer'), key.updateKey);

// // DELETE /api/keys/:id - Delete key
// router.delete('/:id', validateKeyId, key.deleteKey);

// Deactivate key
router.put('/:id/deactivate', validateKeyId, protect, role('admin'), key.deactivateKey); 

module.exports = router;