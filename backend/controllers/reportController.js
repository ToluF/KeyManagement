const Transaction = require('../models/transaction');
const Key = require('../models/keys');
const AuditLog = require('../models/auditLog');

exports.generateReport = async (req, res) => {
    try {
      if (!req.query.type || !req.query.start || !req.query.end) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      const { type, start, end } = req.query;
      const startDate = new Date(start);
      const endDate = new Date(end);
  
      if (isNaN(startDate) || isNaN(endDate)) {
        return res.status(400).json({ error: 'Invalid date format' });
      }
  
      let reportData;
      const formatValue = (value) => {
        if (value instanceof Date) {
          return value.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        }
        return value;
      };

      switch(type) {
        case 'daily':
          // Add null check for items array
          reportData = (await Transaction.find({
            checkoutDate: { $gte: startDate, $lte: endDate }
          })
          .populate('user', 'name email')
          .populate('issuer', 'name email')
          .populate('items.key', 'keyCode location')
          .lean()).map(transaction => ({
            // Add null checks for nested objects
            transactionId: transaction.transactionId || 'N/A',
            userName: transaction.user?.name || 'System Generated',
            userEmail: transaction.user?.email || 'N/A',
            issuerName: transaction.issuer?.name || 'Automated System',
            checkoutDate: transaction.checkoutDate?.toISOString() || 'N/A',
            status: transaction.status,
            keys: transaction.items?.map(item => 
              `${item.key?.keyCode || 'Deleted Key'} (${item.status})`
            ).join(', ') || 'No keys',
            actionLogs: transaction.actionLogs?.map(log => 
              `${log.action} by ${log.performedBy?.toString() || 'System'}`
            ).join('; ') || 'No actions'
          }));
          break;
          
        // case 'keys':
        //   reportData = await Key.find({
        //     createdAt: { $gte: startDate, $lte: endDate }
        //   });
        //   break;

        case 'weekly':
          const weeklyData = await Transaction.aggregate([
            {
              $match: {
                checkoutDate: { $gte: startDate, $lte: endDate }
              }
            },
            {
              $group: {
                _id: { $week: "$checkoutDate" },
                totalTransactions: { $sum: 1 },
                totalKeys: { $sum: { $size: "$items" } },
                uniqueUsers: { $addToSet: "$user" }
              }
            },
            {
              $project: {
                week: "$_id",
                totalTransactions: 1,
                totalKeys: 1,
                uniqueUserCount: { $size: "$uniqueUsers" },
                _id: 0
              }
            }
          ]);
          
          reportData = weeklyData.map(week => ({
            week: week.week,
            totalTransactions: week.totalTransactions,
            totalKeysCheckedOut: week.totalKeys,
            uniqueUsers: week.uniqueUserCount
          }));
          break;

        case 'keys':
          const keys = await Key.find({
            $or: [
              { createdAt: { $gte: startDate, $lte: endDate } },
              { updatedAt: { $gte: startDate, $lte: endDate } }
            ]
          })
          .populate('currentTransaction', 'transactionId')
          .lean();
        
          reportData = keys.map(key => ({
            keyCode: key.keyCode,
            location: key.location || 'Unassigned',
            status: key.status,
            currentTransaction: key.currentTransaction?.transactionId || 'None',
            lastUpdated: key.updatedAt?.toISOString(),
            createdDate: key.createdAt?.toISOString()
          }));
          break;

        case 'audit':
          const auditLogs = await AuditLog.find({
            timestamp: { $gte: startDate, $lte: endDate }
          })
          .populate({
            path: 'user',
            select: 'name email',
            match: { user: { $ne: null } } // Only populate if user exists
          })
          .sort('-timestamp')
          .lean();
        
          reportData = auditLogs.map(log => ({
            timestamp: formatValue(log.timestamp) || 'N/A',
            actionType: log.actionType,
            user: log.user ? `${log.user.name} <${log.user.email}>` : 'System Action',
            description: log.description || 'No description',
            affectedKey: log.metadata?.keyCode || 'N/A',
            ipAddress: log.metadata?.ip || 'N/A'
          }));
          break;

        default:
          throw new Error('Invalid report type');
      }
  
      res.status(200).json(reportData);
    } catch (error) {
      console.error('Report Generation Error:', {
        error: error.message,
        stack: error.stack,
        query: req.query
      });
      res.status(500).json({ 
        error: 'Failed to generate report',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };