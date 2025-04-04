const mongoose = require('mongoose');
const Key = require('./keys');
/**
 * Represents a key exchange transaction following e-commerce patterns
 * @typedef {Object} Transaction
 * @property {string} transactionId - Unique TXN-ID (e.g., TXN-2023-001)
 * @property {ObjectId} user - Reference to User receiving keys
 * @property {ObjectId} issuer - Reference to User issuing keys
 * @property {Array<TransactionItem>} items - Keys in transaction
 * @property {string} status - Transaction lifecycle state
 * @property {Date} checkoutDate - When keys were officially checked out
 * @property {Date} expectedReturn - Calculated return date
 */
const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    unique: true,
    default: () => `TXN-${Date.now().toString().slice(-6)}`
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true 
  },
  issuer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    key: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Key',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'checked-out', 'returned', 'lost'],
      default: 'pending'
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  checkoutDate: {
    type: Date
  },
  actionLogs: [{
    action: { type: String, enum: ['checkout', 'return', 'lost'] },
    key: { type: mongoose.Schema.Types.ObjectId, ref: 'Key' },
    timestamp: Date,
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  expectedReturn: Date
}, { timestamps: true });


transactionSchema.index({ checkoutDate: -1 });
transactionSchema.index({ 'items.status': 1 });
transactionSchema.index({ _id: 1, status: 1 }); // Compound index for faster lookups

transactionSchema.pre('find', function() {
  this.where({
    user: { $exists: true, $type: 'objectId' },
    'items.key': { $exists: true, $type: 'objectId' }
  });
});

// Add virtual for UI status
transactionSchema.virtual('displayStatus').get(function() {
  if (this.status === 'active' && this.items.some(i => i.status === 'lost')) {
    return 'partially-returned';
  }
  return this.status;
});

// Add to transactionSchema
transactionSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed'; // Don't auto-calculate
});

// transactionSchema.pre('save', function(next) {
//   // Only update status if items exist
//   if (this.items.length > 0 && this.items.every(i => i.status === 'returned')) {
//     this.status = 'completed';
//   }
//   next();
// });

transactionSchema.pre('save', function(next) {
  if (this.status === 'completed' && this.items.some(i => i.status === 'checked-out')) {
    return next(new Error('Cannot complete transaction with checked-out items'));
  }
  next();
});

transactionSchema.pre('save', function(next) {
  // Auto-update status when items change
  if (this.isModified('items') && this.status === 'active') {
    const allReturned = this.items.every(i => 
      ['returned', 'lost'].includes(i.status)
    );
    if (allReturned) this.status = 'completed';
  }
  next();
});

// In transaction model
transactionSchema.post('save', async function(doc) {
  try {
    // Verify key status consistency
    const Key = mongoose.model('Key');
    const keys = await Key.find({
      _id: { $in: doc.items.map(i => i.key) }
    });
  
    keys.forEach(key => {
      if (doc.status === 'completed' && key.status !== 'available') {
        console.warn(`Key ${key._id} inconsistency detected`);
      }
    });
  } catch (error) {
    console.error('Key status check failed:', error);
  }
});

transactionSchema.post('find', function(docs) {
  docs.forEach(doc => {
    if (doc.status === 'active' && doc.items.every(i => 
      ['returned', 'lost'].includes(i.status))
    ) {
      console.warn(`Transaction ${doc._id} needs status update`);
    }
  });
});

transactionSchema.post('findOneAndUpdate', async function(doc) {
  if (doc.status === 'completed') {
    await Key.updateMany(
      { _id: { $in: doc.items.map(i => i.key) } },
      { 
        status: 'available',
        currentTransaction: null 
      }
    );
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);