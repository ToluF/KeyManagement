// middleware/transactionAuth.js (NEW)
exports.transactionOwner = async (req, res, next) => {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction.user.equals(req.user.id) && 
        !transaction.issuer.equals(req.user.id)) {
      return res.status(403).json({ 
        error: 'Not authorized for this transaction' 
      });
    }
    
    req.transaction = transaction;
    next();
  };