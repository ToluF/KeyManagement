
// import Transaction from '../models/transaction';
const Transaction = require('../models/transaction');
async function updateTransactionStatus() {
  await Transaction.updateMany(
    { 
      status: "active",
      items: { $not: { $elemMatch: { status: "checked-out" } } }
    },
    { $set: { status: "completed" } }
  );
}

updateTransactionStatus();