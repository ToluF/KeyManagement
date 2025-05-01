// routes/settings.js
const express = require('express');
const router = express.Router();
const Settings = require('../models/settings');
const settingsController = require('../controllers/settingsController');
const { protect, role } = require('../Middleware/authMiddleware');

router.route('/')
  .get(protect, role('admin'), settingsController.getSettings)
  .put(protect, role('admin'), settingsController.updateSettings);

module.exports = router;