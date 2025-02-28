const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  keyCheckoutDuration: {
    type: Number,
    default: 7,
    min: [1, 'Checkout duration must be at least 1 day']
  },
  allowSelfCheckout: {
    type: Boolean,
    default: false
  },
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    }
  },
  autoLogoutTime: {
    type: Number,
    default: 30,
    min: [1, 'Auto logout time must be at least 1 minute']
  }
}, { timestamps: true });

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);