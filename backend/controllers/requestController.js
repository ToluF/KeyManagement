const Transaction = require('../models/transaction');
const Key = require('../models/keys');
const User = require('../models/user');
const Request = require('../models/Request');
const mongoose = require('mongoose');

exports.createRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
    try {
        
      if (!req.body.purpose || req.body.purpose.trim() === '') {
        return res.status(400).json({ error: 'Purpose is required' });
      }
      const { keys, preferredDates, purpose } = req.body;
      
      // 1. Check key availability
      const existingKeys = await Key.find({
        _id: { $in: keys },
        status: { $ne: 'available' }
      }).session(session);

      if (existingKeys.length > 0) {
        throw new Error(
          `Some keys are already reserved/checked-out: ${
            existingKeys.map(k => k.keyCode).join(', ')
          }`
        );
      }

       // 2. Create request
      const newRequest = await Request.create([{
        user: req.user.id,
        keys,
        preferredDates: preferredDates.map(pd => ({
            date: pd.date,
            timeSlot: pd.timeSlot
          })),
        purpose,
        status: 'pending'
      }], { session });
  
      // 3. Reserve keys
      await Key.updateMany(
        { _id: { $in: keys } },
        { 
          status: 'reserved',
          $push: {
            transactionHistory: {
              status: 'reserved',
              date: new Date(),
              request: newRequest[0]._id
            }
          }
        },
        { session }
      );

      await session.commitTransaction();
      res.status(201).json(newRequest[0]);
    } catch (error) {
      await session.abortTransaction();
      res.status(400).json({ error: error.message });
    } finally {
      session.endSession();
    }
  };
  
exports.getUserRequests = async (req, res) => {
    try {
      const requests = await Request.find({ user: req.user.id })
        .populate('keys', 'keyCode description')
        .populate('issuer', 'name email');
      
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};
  
exports.getIssuerRequests = async (req, res) => {
    try {
      const requests = await Request.find({ status: 'pending' })
        .populate('user', 'name department')
        .populate('keys', 'keyCode location');
      
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};
// Add WebSocket broadcast function
function broadcastUpdate(type, data) {
    wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type, data }));
    }
    });
}

exports.updateRequestStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const request = await Request.findById(req.params.id)
      .populate({
        path: 'keys',
        select: '_id status'  // Include status in the populated keys
      })
      .populate('user')
      .session(session);

       // Handle rejection - release keys
    if (req.body.status === 'rejected') {
      await Key.updateMany(
        { _id: { $in: request.keys.map(k => k._id) } },
        { 
          status: 'available',
          $pull: { transactionHistory: { request: request._id } }
        },
        { session }
      );
    }

    if (req.body.status === 'approved') {
      // Validate request has keys
      if (!request.keys || request.keys.length === 0) {
        throw new Error('Request has no keys to approve');
      }

      // 1. Create transaction
      const transaction = await Transaction.create([{
        user: request.user._id,
        issuer: req.user.id,
        items: request.keys.map(key => ({
          key: key._id,
          status: 'checked-out'
        })),
        status: 'active',
        source: 'request',
        relatedRequest: request._id,
        checkoutDate: new Date()
      }], { session });

      // 2. Update keys
      const keyIds = request.keys.map(key => key._id);
      await Key.updateMany(
        { _id: { $in: keyIds } },
        { 
          status: 'checked-out',
          currentTransaction: transaction[0]._id,
          $push: {
            transactionHistory: {
              transaction: transaction[0]._id,
              status: 'checked-out',
              date: new Date()
            }
          }
        },
        { session }
      );
    }

    // 3. Update request status
    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      { 
        status: req.body.status,
        ...(req.body.status === 'approved' && { issuer: req.user.id })
      },
      { new: true, session }
    );

    await session.commitTransaction();
    broadcastUpdate('REQUEST_UPDATE', updatedRequest);
    res.json(updatedRequest);

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

// In requestController.js
exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await Request.find({ status: 'pending' })
      .populate('user', 'name email')
      .populate('keys', 'keyCode location');
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};