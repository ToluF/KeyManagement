const Key = require('../models/keys');
const Transaction = require('../models/transaction');
const mongoose = require('mongoose');

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

exports.getAllKeys = async (req, res) => {
  try {
    const keys = await Key.find().sort({ createdAt: -1 });
    res.json(keys);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add this new method to your existing key controller
exports.getAvailableKeys = async (req, res) => {
  try {
    const availableKeys = await Key.find({ status: 'available' })
      .select('keyCode location status')
      .lean()
      .exec();
      
    res.json(availableKeys);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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
        select: 'transactionId checkoutDate',
        populate: {
          path: 'user issuer',
          select: 'name email role'
        }
      })
      .select('transactionHistory')
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
      transactionId: entry.transaction?.transactionId,
      performedBy: entry.transaction?.issuer?.name
    }));

    res.json(history);
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
      'available': ['checked-out', 'lost'],
      'checked-out': ['available', 'lost'],
      'lost': ['available']
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
        currentTransaction: updates.status === 'available' ? null : key.currentTransaction
      },
      { new: true, runValidators: true, session }
    );

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

exports.deleteKey = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedKey = await Key.findByIdAndDelete(id);

    if (!deletedKey) {
      return res.status(404).json({ error: 'Key not found' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};