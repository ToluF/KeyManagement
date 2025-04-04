// models/auditLog.js
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actionType: {
    type: String,
    enum: [
      'transaction_create', // Add this
      'transaction_update',
      'key_checkout', 
      'key_return',
      'key_lost',
      'user_modified',
      'settings_updated'
    ],
    required: true
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: String,
  timestamp: { type: Date, default: Date.now },
  metadata: mongoose.Schema.Types.Mixed
});

auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ actionType: 1 });
auditLogSchema.index({ user: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);