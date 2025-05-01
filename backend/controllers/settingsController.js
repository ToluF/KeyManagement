const Settings = require('../models/settings');

exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    let settings = await Settings.getSettings();
    
    // Update allowed fields
    const allowedUpdates = ['keyCheckoutDuration', 'allowSelfCheckout', 'notificationPreferences', 'autoLogoutTime'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};