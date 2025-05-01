import mongoose from 'mongoose';

// Generic ObjectId validation
const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Key ID validation middleware
export const validateKeyId = (req, res, next) => {
  const keyId = req.params.keyId || req.params.id;
  
  if (!keyId || !validateObjectId(keyId)) {
    console.error('Invalid Key ID:', keyId);
    return res.status(400).json({
      error: 'Invalid Key ID format',
      receivedId: keyId,
      expectedFormat: 'MongoDB ObjectId'
    });
  }
  next();
};

// Transaction ID validation middleware
export const validateTransactionId = (req, res, next) => {
  const transactionId = req.params.transactionId || req.params.id;
  
  if (!transactionId || !validateObjectId(transactionId)) {
    console.error('Invalid Transaction ID:', transactionId);
    return res.status(400).json({
      error: 'Invalid Transaction ID format',
      receivedId: transactionId,
      expectedFormat: 'MongoDB ObjectId'
    });
  }
  next();
};

// Multi-ID validation middleware
export const validateObjectIds = (paramNames) => (req, res, next) => {
  try {
    paramNames.forEach(param => {
      const id = req.params[param];
      if (!validateObjectId(id)) {
        throw new Error(`Invalid ${param} ID format`);
      }
    });
    next();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};