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
  source: {
    type: String,
    enum: ['manual', 'request'],
    default: 'manual',
    required: true
  },
  relatedRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request'
  },
  expectedReturn: Date
}, { timestamps: true });


transactionSchema.index({ checkoutDate: -1 });
transactionSchema.index({ 'items.status': 1 });
transactionSchema.index({ _id: 1, status: 1 }); // Compound index for faster lookups

transactionSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate();
  
  if (update.$set?.status === 'completed') {
    const session = this.getOptions().session;
    const doc = await this.model.findOne(this.getFilter()).session(session);

    // Atomic update of keys and transaction items
    await Promise.all([
      Key.updateMany(
        { _id: { $in: doc.items.map(i => i.key) } },
        { 
          $set: { status: 'available' },
          $unset: { currentTransaction: 1 }
        },
        { session }
      ),
      
      this.model.updateOne(
        { _id: doc._id },
        { 
          $set: { 
            'items.$[].status': 'returned',
            status: 'completed'
          }
        }
      ).session(session)
    ]);
  }
  next();
});

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
transactionSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate();
  
  if (update.$set?.status === 'completed') {
    const doc = await this.model.findOne(this.getFilter());
    await Key.updateMany(
      { _id: { $in: doc.items.map(i => i.key) } },
      { $set: { status: 'available', currentTransaction: null } }
    );
  }
  next();
});

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

transactionSchema.post('save', async function(doc) {
  try {
    if (doc.status === 'completed') {
      await Key.updateMany(
        { _id: { $in: doc.items.map(i => i.key) } },
        { 
          $set: { status: 'available' },
          $unset: { currentTransaction: 1 }
        }
      );
    }
  } catch (error) {
    console.error('Transaction completion cleanup failed:', error);
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