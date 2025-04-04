const Transaction = require('../models/transaction');
const Key = require('../models/keys');


exports.generateReport = async (req, res) => {
    try {
      const { type, start, end } = req.query;
      const startDate = new Date(start);
      const endDate = new Date(end);
  
      let reportData;
      
      switch(type) {
        case 'daily':
          reportData = await Transaction.find({
            checkoutDate: { $gte: startDate, $lte: endDate }
          }).populate('user issuer items.key');
          break;
          
        case 'keys':
          reportData = await Key.find({
            createdAt: { $gte: startDate, $lte: endDate }
          });
          break;
          
        case 'audit':
          reportData = await Transaction.find({
            'actionLogs.timestamp': { $gte: startDate, $lte: endDate }
          });
          break;
      }
  
      res.status(200).json(reportData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };