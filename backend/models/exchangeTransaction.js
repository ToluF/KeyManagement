const mongoose = require('mongoose');

const exchangetransactionSchema = new mongoose.Schema({
  key: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Key',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['checkout', 'return', 'marked_lost', 'initial_registration'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  notes: String
});

module.exports = mongoose.model('Transactions', exchangetransactionSchema);