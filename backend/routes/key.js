const express = require('express');
const router = express.Router();
const key = require('../controllers/keys');

// POST /api/keys - Create new key
router.post('/add', key.addKey);

// GET /api/keys - Get all keys
router.get('/', key.getAllKeys);

// GET /api/keys/available - Get available keys
router.get('/available', key.getAvailableKeys); // New route

// GET /api/keys/search?query= - Search keys
router.get('/search', key.searchKeys);

// GET /api/keys/:id/history - Get key history
router.get('/:id/history', key.getKeyHistory);

// PUT /api/keys/:id - Update key
router.put('/:id', key.updateKey);

// DELETE /api/keys/:id - Delete key
router.delete('/:id', key.deleteKey);

module.exports = router;