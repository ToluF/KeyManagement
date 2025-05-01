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
    required: true,
    enum: ['available', 'reserved', 'checked-out', 'lost', 'unavailable'],
    default: 'available'
  },
  reservationExpiry: {
    type: Date,
    index: { expires: '24h' } // Auto-expire reservations after 24 hours
  },
  reservedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  currentTransaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
  },
  transactionHistory: {
    type: [{
      transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
      },
      status: String,
      date: {
        type: Date,
        default: Date.now
      }
    }],
    default: []
  }
});
keySchema.index({ currentTransaction: 1 });
keySchema.index({ status: 1 });
keySchema.index({ 'transactionHistory.request': 1 });

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
     // Force-clear transaction reference when marking available
    if (this.status === 'available') {
      this.currentTransaction = undefined;
       
      // Additional cleanup for any transaction references
      await this.constructor.updateOne(
        { _id: this._id },
        { $unset: { currentTransaction: 1 } }
      );
    }

    // Check for active transactions
    const existingTransaction = await Transaction.findOne({
      'items.key': this._id
    });

    if (existingTransaction) {
      return next(new Error(
        `Key ${this.keyCode} is referenced in transaction ${existingTransaction.transactionId}`
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
      'available': ['checked-out', 'lost', 'unavailable'],
      'unavailable': ['available'],
      'checked-out': ['available', 'lost','unavailable'],
      'lost': ['available', 'unavailable']
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

// Add periodic sync method
keySchema.statics.syncTransactionStates = async function() {
  await this.updateMany(
    {
      status: "available",
      currentTransaction: { $exists: true }
    },
    {
      $unset: { currentTransaction: 1 }
    }
  );
  console.log('Key transaction states synchronized');
};

keySchema.statics.reconcileKeyStates = async function() {
  const mismatchedKeys = await this.find({
    $or: [
      { status: 'available', currentTransaction: { $exists: true } },
      { status: 'checked-out', currentTransaction: { $exists: false } }
    ]
  });

  for (const key of mismatchedKeys) {
    if (key.status === 'available') {
      await this.findByIdAndUpdate(
        key._id,
        { $unset: { currentTransaction: 1 } }
      );
    } else {
      const transaction = await Transaction.findOne({
        'items.key': key._id,
        status: 'active'
      });
      
      if (transaction) {
        await this.findByIdAndUpdate(
          key._id,
          { currentTransaction: transaction._id }
        );
      }
    }
  }
};

module.exports = mongoose.model('Key', keySchema);