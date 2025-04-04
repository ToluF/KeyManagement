// controllers/transactionController.js (NEW FILE)
/**
 * @typedef {Object} TransactionDTO
 * @property {string} userId - ID of user receiving keys
 */

const Transaction = require('../models/transaction');
const Key = require('../models/keys');
const User = require('../models/user');
const mongoose = require('mongoose');

/**
 * @route GET /api/transactions
 * @desc Get all transactions with populated data
 * @access Authenticated users
 */
exports.getTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const statusFilter = req.query.status || 'all';

    let query= Transaction.find()
      .populate({
        path: 'user issuer',
        select: 'userId name role'
      })
      .populate({
        path: 'items.key',
        select: 'keyCode location status',
        match: { status: { $ne: 'archived' } }
      })
      .sort('-checkoutDate')
      
    
    // Add search filter
    if (search) {
      query= query.or([
        { transactionId: new RegExp(search, 'i') },
        { 'user.name': new RegExp(search, 'i') }
      ]);
    }

    const countQuery = query.clone().lean();
    
    let transactions = await query.skip(skip).limit(limit).lean();

    // Process status and apply status filter
    transactions = transactions
      .map(txn => ({
        ...txn,
        // Calculate real-time status based on items
        status: txn.items.every(i => 
          ['returned', 'lost'].includes(i.status)
        ) ? 'completed' : txn.status
      }))
      .filter(txn => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'completed') return txn.status === 'completed';
        return txn.status === statusFilter;
      })
      
    // Get total count with same filters
    // let totalQuery = Transaction.find();
    // if (search) {
    //   totalQuery.or([
    //     { transactionId: new RegExp(search, 'i') },
    //     { 'user.name': new RegExp(search, 'i') }
    //   ]);
    // }

    const total = await countQuery.countDocuments();

    res.status(200).json({
      transactions,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch transactions',
      details: error.message 
    });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('user issuer items.key');
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @route POST /api/transactions
 * @desc Create new draft transaction
 * @access Issuer+
 */
exports.createTransaction = async (req, res) => {
  try {
    console.log('Creating transaction with:', {
      userId: req.body.userId,
      issuer: req.user.id
    });

    // Validate user exists
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Validate issuer permissions
    if (!['admin', 'issuer'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient privileges' });
    }

    const transaction = await Transaction.create({
      user: user._id,
      issuer: req.user.id,
      status: 'draft'
    });

    console.log('Transaction created:', transaction);
    console.log('Created transaction document:', {
      _id: transaction._id,
      transactionId: transaction.transactionId,
      status: transaction.status
    });

    res.status(201).json({
      id: transaction._id,
      transactionId: transaction.transactionId,
      status: transaction.status
    });
  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(400).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
     });
  }
};

/**
 * @route POST /api/transactions/:id/items
 * @desc Add keys to draft transaction
 * @access Issuer+
 */
exports.addTransactionItems = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Add ID validation
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid transaction ID format' });
    }

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      status: 'draft'
    }).session(session);

    if (!transaction) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Draft transaction not found' });
    }

    // Convert keyIds to ObjectIds
    const keyIds = req.body.keyIds.map(id => new mongoose.Types.ObjectId(id));

    // Validate keys can be added
    const validKeys = await Key.find({
      _id: { $in: keyIds },
      currentTransaction: { $exists: false }
    }).session(session);

    const invalidKeys = keyIds.filter(id => 
      !validKeys.some(k => k._id.equals(id))
    ).map(id => id.toString());

    if (invalidKeys.length > 0) {
      await session.abortTransaction();
      return res.status(400).json({
        error: 'Some keys are unavailable',
        invalidKeys,
        validKeys: validKeys.map(k => k._id.toString())
      });
    }

    // Add items to transaction
    const newItems = keyIds.map(keyId => ({
      key: keyId,
      status: 'pending'
    }));

    // Add to transaction
    transaction.items.push(...newItems);
    await transaction.save({ session });

    // Reserve keys
    await Key.updateMany(
      { _id: { $in: keyIds } },
      {  
        $set: { 
          currentTransaction: transaction._id,
          status: 'checked-out' // Explicitly set status
        } 
      },
      { session }
    );

    await session.commitTransaction();
    res.json({
      addedCount: newItems.length,
      transactionId: transaction._id
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    session.endSession();
  }
};

exports.validateKeys = async (req, res) => {
  try {
    const keys = await Key.find({
      _id: { $in: req.body.keyIds },
      status: 'available',
      currentTransaction: { $exists: false }
    });

    const validKeyIds = keys.map(k => k._id.toString());
    const invalidKeys = req.body.keyIds.filter(id => 
      !validKeyIds.includes(id.toString())
    );

    res.json({
      validKeys: validKeyIds,
      invalidKeys
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.validateDraft = async (req, res, next) => {
  const transaction = await Transaction.findById(req.params.id);
  
  if (!transaction || transaction.status !== 'draft') {
    return res.status(400).json({ 
      error: 'Transaction not in draft state' 
    });
  }
  
  next();
};

/**
 * @route POST /api/transactions/:id/checkout
 * @desc Finalize transaction and check out keys
 * @access Issuer+
 */
exports.finalizeTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, status: 'draft' },
      { 
        status: 'active', 
        checkoutDate: new Date(),
        'items.$[].status': 'checked-out' 
      },
      { new: true, session }
    ).populate('items.key');

    if (!transaction) {
      return res.status(404).json({ error: 'Draft transaction not found' });
    }

    // Add key status validation
    const keys = await Key.find({
      _id: { $in: req.body.keyIds },
      status: { $ne: 'available' }
    }).session(session);

    if (keys.length > 0) {
      throw new Error(`Keys not available: ${keys.map(k => k.keyCode).join(', ')}`);
    }

    // Update all keys
    const keyUpdates = transaction.items.map(item =>
      Key.findByIdAndUpdate(item.key._id, {
        status: 'checked-out',
        currentTransaction: transaction._id,
        $push: {
          transactionHistory: {
            transaction: transaction._id,
            status: 'checked-out',
            date: new Date()
          }
        }
      }, { session })
    );

    await Promise.all(keyUpdates);
    await session.commitTransaction();

    res.json({
      status: transaction.status,
      transactionId: transaction.transactionId,
      checkoutDate: transaction.checkoutDate
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
};

// transactionController.js
exports.returnKey = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { transactionId, keyId } = req.body;

    // 1. Update transaction item status atomically
    const transaction = await Transaction.findOneAndUpdate(
      {
        _id: transactionId,
        'items.key': keyId,
        status: 'active'
      },
      {
        $set: { 'items.$.status': 'returned' },
        $push: {
          actionLogs: {
            action: 'return',
            key: keyId,
            timestamp: new Date(),
            performedBy: req.user.id
          }
        }
      },
      { new: true, session }
    );

    if (!transaction) throw new Error('Invalid transaction or key');

    // // 2. Update key document properly to trigger hooks
    // const key = await Key.findById(keyId).session(session);
    // key.currentTransaction = null;
    // key.transactionHistory.push({
    //   transaction: transactionId,
    //   status: 'returned',
    //   date: new Date()
    // });
    // await key.save({ session }); // This triggers status update via pre-save hooks

    const key = await Key.findByIdAndUpdate(
      keyId, 
      {
        $unset: { currentTransaction: 1 },
        $set: { 
          status: 'available',
        },
        $push: { 
          transactionHistory: { 
            transaction: transactionId, 
            status: 'returned',
            date: new Date()
          } 
        }
      }, 
      { new: true, session });

    // 3. Check and update transaction completion
    const remainingItems = transaction.items.filter(i => 
      !['returned', 'lost'].includes(i.status)
    );
    
    if (remainingItems.length === 0) {
      await Transaction.findByIdAndUpdate(
        transactionId,
        { status: 'completed' },
        { session }
      );
    }
   
    // const allReturned = transaction.items.every(i => ['returned', 'lost'].includes(i.status));
    // if (allReturned) {
    //   await Transaction.findByIdAndUpdate(transactionId, { status: 'completed' }, { session });
    // }
    // // 3. Check transaction completion status
    // const allItemsFinalized = transaction.items.every(i => 
    //   ['returned', 'lost'].includes(i.status)
    // );

    // if (allItemsFinalized) {
    //   await Transaction.findByIdAndUpdate(
    //     transactionId,
    //     { status: 'completed' },
    //     { session }
    //   );
    // }

    await session.commitTransaction();
    
    // // Return updated transaction with key status changes
    // const updatedTransaction = await Transaction.findById(transactionId)
    //   .populate('items.key')
    //   .lean();

    res.json({ transaction, key });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ 
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

exports.markKeyLost = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { transactionId, keyId } = req.body;

    const transaction = await Transaction.findOne({
      _id: transactionId,
      status: 'active',
      'items.key': keyId
    }).session(session);

    if (!transaction) throw new Error('Invalid transaction or key');

    const itemIndex = transaction.items.findIndex(i => i.key.equals(keyId));
    transaction.items[itemIndex].status = 'lost';

    await Key.findByIdAndUpdate(keyId, {
      status: 'lost',
      $push: {
        transactionHistory: {
          transaction: transactionId,
          status: 'lost',
          date: new Date()
        }
      }
    }, { session });

    await transaction.save({ session });
    await session.commitTransaction();
    
    res.json(transaction);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
};

// controllers/transactionController.js
exports.verifyUser = async (req, res) => {
  try {
    const { userId } = req.body;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user || user.role !== 'user') {
      return res.status(404).json({ error: 'Invalid user ID' });
    }

    res.json({
      id: user._id,
      name: user.name,
      department: user.department
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getKeyHistory = async (req, res) => {
  try {
    const history = await Transaction.find({
      'items.key': req.params.keyId
    })
      .populate('user issuer', 'name email')
      .sort('-checkoutDate');

    res.json(history);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAnalyticsData = async (req, res) => {
  try {
    const [keyStats, recentTransactions] = await Promise.all([
      Key.aggregate([
        {
          $group: {
            _id: null,
            totalKeys: { $sum: 1 },
            availableKeys: { $sum: { $cond: [{ $eq: ["$status", "available"] }, 1, 0] } },
            issuedKeys: { $sum: { $cond: [{ $eq: ["$status", "checked-out"] }, 1, 0] } }
          }
        },
        { $project: { _id: 0 } }
      ]),
      Transaction.aggregate([
        { $match: { 
          user: { $exists: true, $type: 'objectId' },
          'items.key': { $exists: true, $type: 'objectId' } 
        }},
        { $sort: { createdAt: -1 } },
        { $limit: 5 },
        { $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }},
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        { $project: {
          'user.name': 1,
          createdAt: 1,
          items: { $slice: ['$items', 1] } // Get first item only
        }}
      ])
    ]);

    const result = {
      totalKeys: keyStats[0]?.totalKeys || 0,
      availableKeys: keyStats[0]?.availableKeys || 0,
      issuedKeys: keyStats[0]?.issuedKeys || 0,
      recentActivity: recentTransactions.map(tx => ({
        _id: tx._id.toString(),
        userName: tx.user?.name || 'System',
        keyCode: tx.items[0]?.key?.toString() || 'Unknown',
        date: tx.createdAt
      }))
    };

    res.json(result);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to generate analytics',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
};

// exports.getAnalyticsData = async (req, res) => {
//   try {
//     const [transactions, keys] = await Promise.all([
//       Transaction.aggregate([
//         { $unwind: '$items' },
//         { 
//           $group: {
//             _id: '$status',
//             count: { $sum: 1 },
//             keys: { $addToSet: '$items.key' }
//           }
//         }
//       ]),
//       Key.find().lean()
//     ]);

//     const statusDistribution = transactions.reduce((acc, curr) => {
//       acc[curr._id] = {
//         count: curr.count,
//         keys: curr.keys.length
//       };
//       return acc;
//     }, {});

//     res.json({
//       totalKeys: keys.length,
//       statusDistribution,
//       recentTransactions: transactions
//         .sort((a, b) => b.checkoutDate - a.checkoutDate)
//         .slice(0, 5)
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    // Release any reserved keys
    await Key.updateMany(
      { currentTransaction: req.params.id },
      { $unset: { currentTransaction: 1 } }
    );
    
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
