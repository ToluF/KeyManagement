const mongoose = require('mongoose');

const keySchema = new mongoose.Schema({
  keyCode: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  type: String,
  location: String,
  status: {
    type: String,
    enum: ['available', 'checked-out', 'lost'],
    default: 'available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
});

module.exports = mongoose.model('Key', keySchema);