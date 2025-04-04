// // migrations/convertAssignmentsToTransactions.js (NEW FILE)
// /**
//  * Converts legacy assignedTo system to transaction-based system
//  * Usage: node migrations/convertAssignmentsToTransactions.js
//  */
require('dotenv').config();
const mongoose = require('mongoose');
const Key = require('../models/keys');
const User = require('../models/user');
const Transaction = require('../models/transaction');

// const migrate = async () => {
//   await mongoose.connect(process.env.MONGODB_URI);

//   const keys = await Key.find({ 
//     assignedTo: { $exists: true, $ne: null } 
//   }).populate('assignedTo');

//   for (const key of keys) {
//     const session = await mongoose.startSession();
//     session.startTransaction();
    
//     try {
//       // 1. Create transaction
//       const txn = await Transaction.create([{
//         user: key.assignedTo._id,
//         issuer: key.lastModifiedBy || key.assignedTo._id, // Fallback
//         items: [{
//           key: key._id,
//           status: 'checked-out'
//         }],
//         status: 'active',
//         checkoutDate: key.updatedAt
//       }], { session });

//       // 2. Update key document
//       await Key.findByIdAndUpdate(key._id, {
//         $unset: { assignedTo: 1 },
//         $set: { currentTransaction: txn[0]._id },
//         $push: {
//           transactionHistory: {
//             transaction: txn[0]._id,
//             status: 'checked-out',
//             date: key.updatedAt
//           }
//         }
//       }, { session });

//       await session.commitTransaction();
//     } catch (error) {
//       await session.abortTransaction();
//       console.error(`Migration failed for key ${key._id}:`, error);
//     } finally {
//       session.endSession();
//     }
//   }

//   console.log(`Migrated ${keys.length} key assignments`);
//   process.exit(0);
// };

// migrate();



// migrations/convertOldTransactions.js
const migrateTransactions = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  // 1. Find all old transactions
  const oldTransactions = await mongoose.connection.db.collection('transactions')
    .find({ action: { $exists: true } }) // Identify legacy docs
    .toArray();

  // 2. Process each transaction
  for (const oldTxn of oldTransactions) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Create new transaction structure
      const newTxn = {
        transactionId: `MIG-${oldTxn._id.toString().slice(-6)}`,
        user: oldTxn.user,
        issuer: oldTxn.user, // Assuming same as user in old system
        items: [{
          key: oldTxn.key,
          status: convertActionToStatus(oldTxn.action)
        }],
        status: 'active',
        checkoutDate: oldTxn.timestamp,
        actionLogs: [{
          action: oldTxn.action,
          key: oldTxn.key,
          timestamp: oldTxn.timestamp,
          performedBy: oldTxn.user
        }]
      };

      // 3. Insert new transaction
      await mongoose.connection.db.collection('transactions')
        .insertOne(newTxn, { session });

      // 4. Archive old transaction
      await mongoose.connection.db.collection('transactions')
        .deleteOne({ _id: oldTxn._id }, { session });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      console.error(`Failed migrating transaction ${oldTxn._id}:`, error);
    } finally {
      session.endSession();
    }
  }

  console.log(`Migrated ${oldTransactions.length} old transactions`);
  process.exit(0);
};

// Helper function
const convertActionToStatus = (action) => {
  const statusMap = {
    checkout: 'checked-out',
    return: 'returned',
    marked_lost: 'lost'
  };
  return statusMap[action] || 'completed';
};

migrateTransactions();