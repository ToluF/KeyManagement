const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  issuer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  keys: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Key',
    required: true
  }],
  preferredDates: [{
    date: {
      type: String,  // Change from Date to String
      required: true
    },
    timeSlot: {
      type: String,
      required: true
    }
  }],
  purpose: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);