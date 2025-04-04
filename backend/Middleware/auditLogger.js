// middleware/auditLogger.js
const AuditLog = require('../models/auditLog');
const mongoose = require('mongoose');

// Initialize plugin once when the module loads
mongoose.plugin((schema) => {
  schema.post(/^findOneAnd/, function(result, next) {
    if (this.$locals && this.$locals.userId) {
      result.$locals = result.$locals || {};
      result.$locals.userId = this.$locals.userId;
    }
    next();
  });
});

const logAction = (actionType) => async (req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;
  
  res.send = async function(data) {
    try {
      if (res.statusCode < 400) {
        await AuditLog.create({
          actionType,
          user: req.user?._id,
          description: `${actionType.replace(/_/g, ' ')} by ${req.user?.name || 'system'}`,
          metadata: {
            path: req.path,
            method: req.method,
            status: res.statusCode,
            duration: Date.now() - startTime,
            ...(actionType.startsWith('transaction_') && { 
              transactionId: data?._id 
            })
          }
        });
      }
    } catch (error) {
      console.error('Audit log failed:', error);
    } finally {
      originalSend.call(this, data);
    }
  };
  
  next();
};

// const logAudit = (req, res, next) => {
//   // Attach user context to mongoose operations
//   mongoose.set('local', { userId: req.user?._id });
//   next();
// };

module.exports = { logAction};