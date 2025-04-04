// migrations/fix-transaction-statuses.js
const mongoose = require('mongoose');
const Transaction = require('../models/transaction');
const Key = require('../models/keys');
require('dotenv').config();

async function migrateTransactions() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const transactions = await Transaction.find({
    status: 'active',
    'items.status': 'checked-out'
  });

  for (const txn of transactions) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Check if all keys are available
      const keys = await Key.find({
        _id: { $in: txn.items.map(i => i.key) },
        status: 'available'
      }).session(session);

      if (keys.length === txn.items.length) {
        // Update transaction
        await Transaction.updateOne(
          { _id: txn._id },
          {
            $set: {
              status: 'completed',
              'items.$[].status': 'returned'
            },
            $push: {
              actionLogs: {
                $each: txn.items.map(item => ({
                  action: 'return',
                  key: item.key,
                  timestamp: new Date(),
                  performedBy: txn.issuer
                }))
              }
            }
          }
        ).session(session);
      }
      
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      console.error(`Failed to update transaction ${txn._id}:`, error);
    } finally {
      session.endSession();
    }
  }

  console.log(`Updated ${transactions.length} transactions`);
  process.exit(0);
}

migrateTransactions();