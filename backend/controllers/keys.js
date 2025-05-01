const Key = require('../models/keys');
const Transaction = require('../models/transaction');
const Request = require('../models/Request');
const mongoose = require('mongoose');

// Add to controllers/keys.js
exports.getKey = async (req, res) => {
  try {
    const key = await Key.findById(req.params.id)
      .populate('currentTransaction', 'transactionId')
      .lean();

    if (!key) {
      return res.status(404).json({ error: 'Key not found' });
    }

    res.json(key);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addKey = async (req, res) => {
  try {
    const { keyCode, description, type, location } = req.body;
    
    // Check for existing key code
    const existingKey = await Key.findOne({ keyCode });
    if (existingKey) {
      return res.status(400).json({ error: 'Key code already exists' });
    }

    const newKey = new Key({
      keyCode,
      description,
      type,
      location,
      status: 'available'
    });

    const savedKey = await newKey.save();
    res.status(201).json(savedKey);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// controllers/keyController.js
exports.getAllKeys = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { keyCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const keys = await Key.find(query)
      .populate('currentTransaction', 'transactionId')
      .sort({ status: 1, keyCode: 1 })
      .lean();

    res.json(keys);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAvailableKeys = async (req, res) => {
  try {
    const keys = await Key.find({ 
      status: 'available',
      currentTransaction: { $exists: false }
    })
    .select('keyCode location status description')
    .lean();
    
    // Check for pending requests
    const requests = await Request.find({
      keys: { $in: keys.map(k => k._id) },
      status: 'pending'
    });
    
    const keysWithRequests = keys.map(key => ({
      ...key,
      pendingRequests: requests.filter(r => r.keys.includes(key._id)).length
    }));
    
    res.json(keysWithRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReservedKeys = async (req, res) => {
  try {
    const keys = await Key.find({
      status: 'reserved',
      reservedFor: req.params.userId,
      reservationExpiry: { $gt: new Date() }
    }).lean();

    res.json(keys);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// exports.getAvailableKeys = async (req, res) => {
//   try {
//     const availableKeys = await Key.find({ 
//       status: 'available',
//       currentTransaction: { $exists: false }
//     })
//     .select('keyCode location status description')
//     .lean();
    
//     // console.log('Fetched available keys:', availableKeys);
//     res.json(availableKeys);
//   } catch (error) {
//     res.status(500).json({
//       error: 'Failed to fetch available keys',
//       details: error.message
//     });
//   }
// };

exports.searchKeys = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'Search query required' });
    
    const keys = await Key.find({
      $or: [
        { keyCode: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { type: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } }
      ]
    }).lean().exec();

    res.json(keys);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getKeyHistory = async (req, res) => {
  try {
    const key = await Key.findById(req.params.id)
      .populate({
        path: 'transactionHistory.transaction',
        select: 'transactionId checkoutDate returnDate status',
        populate: {
          path: 'user issuer',
          select: 'name email role'
        }
      })
      .select('transactionHistory keyCode')
      .lean()
      .exec();
    
    if (!key) {
      return res.status(404).json({ error: 'Key not found' });
    }

    
    // Transform the data for better client-side consumption
    const history = key.transactionHistory.map(entry => ({
      action: entry.status,
      date: entry.date,
      user: entry.transaction?.user?.name || 'System',
      issuer: entry.transaction?.issuer?.name,
      transactionId: entry.transaction?.transactionId,
      performedBy: entry.transaction?.issuer?.name,
      notes: entry.notes
    }));

    res.json({
      keyCode: key.keyCode,
      history
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateKey = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent manual status overrides
    const key = await Key.findById(id).session(session);
    if (!key) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Key not found' });
    }

    // Check for active transactions
    const activeTransaction = await Transaction.findOne({
      'items.key': id,
      status: 'active'
    }).session(session);

    if (activeTransaction) {
      await session.abortTransaction();
      return res.status(400).json({
        error: `Key is part of active transaction ${activeTransaction.transactionId}`
      });
    }

    // Validate status transitions
    const validTransitions = {
      'available': ['checked-out', 'lost', 'unavailable'],
      'unavailable': ['available'],
      'reserved': ['available', 'unavailable'],
      'checked-out': ['available', 'lost','unavailable'],
      'lost': ['available', 'unavailable']
    };

    if (updates.status && !validTransitions[key.status]?.includes(updates.status)) {
      await session.abortTransaction();
      return res.status(400).json({
        error: `Invalid status transition: ${key.status} → ${updates.status}`
      });
    }

    const updatedKey = await Key.findByIdAndUpdate(
      id,
      {
        ...updates,
        // Force clear transaction reference when marking available
        currentTransaction: (updates.status === 'available' && !key.currentTransaction) ? 
          null : key.currentTransaction
      },
      { new: true, runValidators: true, session }
    );

        // Add transaction validation after update
    if (updatedKey.status === 'available' && updatedKey.currentTransaction) {
      await Transaction.updateOne(
        { _id: updatedKey.currentTransaction },
        { $pull: { items: { key: updatedKey._id } }} // Remove key from transaction
      ).session(session);
    }
    await session.commitTransaction();
    res.json(updatedKey);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  } finally {
    session.endSession();
  }
};

exports.getKeyAnalytics = async (req, res) => {
  try {
    

    const keyStats = await Key.aggregate([
      { 
        $group: { 
          _id: '$status', 
          count: { $sum: 1 } 
        } 
      },
      { 
        $project: {
          status: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    const totalKeys = await Key.estimatedDocumentCount();

    res.json({
      totalKeys,
      keyStatuses: keyStats.map(stat => ({
        status: stat.status,
        count: stat.count
      })),
      success: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// exports.deleteKey = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deletedKey = await Key.findByIdAndDelete(id);

//     if (!deletedKey) {
//       return res.status(404).json({ error: 'Key not found' });
//     }

//     res.status(204).send();
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

exports.deactivateKey = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedKey = await Key.findByIdAndUpdate(
      id,
      { status: 'unavailable' },
      { new: true }
    );

    if (!updatedKey) {
      return res.status(404).json({ error: 'Key not found' });
    }

    res.status(200).json(updatedKey);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.bulkDeactivateKeys = async (req, res) => {
  try {
    const { ids } = req.body;
    const result = await Key.updateMany(
      { _id: { $in: ids } },
      { $set: { status: 'unavailable' } }
    );

    res.status(200).json({ message: `${result.nModified} keys deactivated` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
exports.getKeyDetails = async (req, res) => {
  try {
    const keyId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(keyId)) {
      return res.status(400).json({ error: 'Invalid key ID format' });
    }
    
    const key = await Key.findById(keyId)
      .populate({
        path: 'currentTransaction',
        select: 'transactionId checkoutDate',
        populate: [
          { path: 'user', select: 'name email' },
          { path: 'issuer', select: 'name role' }
        ]
      })
      .populate({
        path: 'transactionHistory.transaction',
        select: 'transactionId status checkoutDate returnDate',
        populate: [
          { path: 'user', select: 'name' },
          { path: 'issuer', select: 'name' }
        ]
      })
      .lean();

    if (!key) {
      return res.status(404).json({ error: 'Key not found' });
    }

    // Ensure transactionHistory is always an array
    const transactionHistory = Array.isArray(key.transactionHistory) ? 
      key.transactionHistory : [];

    const transformed = {
      ...key,
      currentTransaction: key.currentTransaction ? {
        transactionId: key.currentTransaction.transactionId,
        checkoutDate: key.currentTransaction.checkoutDate,
        user: key.currentTransaction.user?.name,
        issuer: key.currentTransaction.issuer?.name
      } : null,
      transactionHistory: transactionHistory.map(entry => ({
        action: entry.status,
        date: entry.date,
        transaction: {
          id: entry.transaction?._id,
          status: entry.transaction?.status,
          checkoutDate: entry.transaction?.checkoutDate,
          returnDate: entry.transaction?.returnDate,
          user: entry.transaction?.user?.name || 'System',
          issuer: entry.transaction?.issuer?.name || 'Auto-system'
        }
      }))
    };

    res.json(transformed);
  } catch (error) {
    res.status(500).json({ 
      error: 'Server error',
      details: error.message 
    });
  }
};