// routes/audit.js
const express = require('express');
const router = express.Router();
const AuditLog = require('../models/auditLog');

router.get('/', async (req, res) => {
  try {
    const { page = 1, actionType, userId, startDate, endDate } = req.query;
    const limit = 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (actionType) query.actionType = actionType;
    if (userId) query.user = userId;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('user', 'name email')
        .sort('-timestamp')
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(query)
    ]);

    res.json({
      logs,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;