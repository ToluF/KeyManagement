// models/auditLog.js
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actionType: {
    type: String,
    enum: ['key_checkout', 'key_return', 'key_lost', 'user_modified', 'settings_updated'],
    required: true
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: String,
  timestamp: { type: Date, default: Date.now },
  metadata: mongoose.Schema.Types.Mixed
});

module.exports = mongoose.model('AuditLog', auditLogSchema);