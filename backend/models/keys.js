const mongoose = require('mongoose');
const Transaction = require('./transaction');

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
  currentTransaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
  },
  transactionHistory: [{
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    },
    status: String,
    date: {
      type: Date,
      default: Date.now
    }
  }]
});
keySchema.index({ currentTransaction: 1 });

//1. Keep the currentTransaction -> status sync
keySchema.pre('save', async function(next) {
  if (this.isModified('currentTransaction')) {
    if (this.currentTransaction) {
      this.status = 'checked-out';
    } else {
      this.status = 'available';
    }
  }
  next();
});

// 2. Add the new validation hook (modified to handle original status correctly)
keySchema.pre('save', async function(next) {
  if (this.isModified('status')) {
    // Check for active transactions
    const activeTransaction = await Transaction.findOne({
      'items.key': this._id,
      status: 'active'
    });

    if (activeTransaction) {
      return next(new Error(
        `Cannot modify key status - it's part of active transaction ${activeTransaction.transactionId}`
      ));
    }

    // Get original status from database if existing document
    let originalStatus;
    if (!this.isNew) {
      const originalDoc = await Key.findById(this._id).lean();
      originalStatus = originalDoc.status;
    } else {
      originalStatus = this.status; // For new documents
    }

    // Validate status transitions
    const validTransitions = {
      'available': ['checked-out', 'lost'],
      'checked-out': ['available', 'lost'],
      'lost': ['available']
    };

    if (!validTransitions[originalStatus]?.includes(this.status)) {
      return next(new Error(
        `Invalid status transition: ${originalStatus} → ${this.status}`
      ));
    }
  }
  next();
});

// // 3. Add the post-save hook to update related transactions
// keySchema.post('save', async function(doc) {
//   if (doc.status === 'available') {
//     await Transaction.updateMany(
//       { 'items.key': doc._id, status: 'active' },
//       { $set: { 'items.$[elem].status': 'returned' } },
//       { arrayFilters: [{ 'elem.key': doc._id }] }
//     );
//   }
// });

// 4. Add the post-save hook to log status changes
keySchema.post('save', async function(doc, next) {
  try {
    // Get user from context (needs middleware setup)
    const userId = doc.$locals.userId || 'system';

    await AuditLog.create({
      action: 'key_status_change',
      target: doc._id,
      user: userId,
      changes: {
        from: doc._originalStatus,
        to: doc.status
      }
    });
  } catch (error) {
    console.error('Audit log failed:', error);
  }
  next();
});


module.exports = mongoose.model('Key', keySchema);