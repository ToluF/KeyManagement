// middleware/auditLogger.js
const AuditLog = require('../models/auditLog');

const logAction = (actionType) => async (req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    if (res.statusCode < 400) {
      AuditLog.create({
        actionType,
        user: req.user?._id,
        description: `${actionType.replace('_', ' ')} by ${req.user?.name}`,
        metadata: req.body
      });
    }
    originalSend.call(this, data);
  };
  next();
};

module.exports = logAction;