// routes/settings.js
const express = require('express');
const router = express.Router();
const Settings = require('../models/settings');
const { protect, admin } = require('../Middleware/authMiddleware');

router.get('/', protect, admin, async (req, res) => {
    try {
      const settings = await Settings.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});
  
router.put('/', protect, admin, async (req, res) => {
    try {
      const settings = await Settings.findOneAndUpdate(
        {},
        req.body,
        { new: true, upsert: true, runValidators: true }
      );
      res.json(settings);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
});

module.exports = router;