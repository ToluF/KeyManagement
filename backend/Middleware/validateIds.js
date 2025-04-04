const mongoose = require('mongoose');

exports.validateObjectIds = (req, res, next) => {
  const validateId = (id) => 
    mongoose.Types.ObjectId.isValid(id) && 
    new mongoose.Types.ObjectId(id).toString() === id;

  // Validate route params
  if (req.params.id && !validateId(req.params.id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  // Validate body IDs
  if (req.body.transactionId && !validateId(req.body.transactionId)) {
    return res.status(400).json({ error: "Invalid transaction ID" });
  }

  if (req.body.keyId && !validateId(req.body.keyId)) {
    return res.status(400).json({ error: "Invalid key ID" });
  }

  next();
};