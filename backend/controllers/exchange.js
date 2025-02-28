const Key = require('../models/keys');
const User = require('../models/user');
const Transaction = require('../models/exchangeTransaction');

exports.getExchangeData = async (req, res) => {
  try {
    const [users, keys] = await Promise.all([
      User.find().select('-password').lean(),
      Key.find().populate('assignedTo', 'name email department').lean()
    ]);
    
    res.json({ users, keys });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.assignKey = async (req, res) => {
    try {
        const { keyId, userId } = req.body;
        
        // Validate IDs
        if (!keyId || !userId) {
        return res.status(400).json({ error: 'Missing keyId or userId' });
        }

        const key = await Key.findById(keyId);
        const user = await User.findById(userId);
        
        if (!key) return res.status(404).json({ error: 'Key not found' });
        if (!user) return res.status(404).json({ error: 'User not found' });

        key.assignedTo = userId;
        key.status = 'checked-out';
        await key.save();
        
        // Create transaction
        const transaction = new Transaction({
            key: keyId,
            user: req.user.id, // Admin who performed the action
            action: 'checkout',
            notes: `Assigned to ${user.name} (${user.email})`
        });
        await transaction.save();
        
        res.json(await Key.findById(keyId).populate('assignedTo'));
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

exports.returnKey = async (req, res) => {
  try {
    const { keyId } = req.body;

    const key = await Key.findById(keyId);
    if (!key) return res.status(404).json({ error: 'Key not found' });

    // Create transaction first
    const transaction = new Transaction({
      key: keyId,
      user: req.user.id,
      action: 'return',
      notes: `Returned by ${key.assignedTo.name}`
    });
    
    // Update key status
    key.assignedTo = null;
    key.status = 'available';
    
    await Promise.all([key.save(), transaction.save()]);
    res.json(key);
  } catch (error) {
    res.status(400).json({ error: error.message});
  }
};

exports.markKeyLost = async (req, res) => {
  try {
    const { keyId } = req.body;
    
    if (!keyId) return res.status(400).json({ error: 'Missing keyId' });

    const key = await Key.findById(keyId);
    if (!key) return res.status(404).json({ error: 'Key not found' });

    // Create transaction
    const transaction = new Transaction({
        key: keyId,
        user: req.user.id,
        action: 'marked_lost',
        notes: `Marked as lost by administrator`
    });
      
      // Update key status
    key.status = 'lost';
      
    await Promise.all([key.save(), transaction.save()]);
    res.json(key);
  } catch (error) {
    res.status(400).json({ 
      error: error.message.startsWith('Cast to ObjectId failed') 
        ? 'Invalid ID format' 
        : error.message 
    });
  }
};

exports.getKeyHistory = async (req, res) => {
    try {
      const history = await Transaction.find({ key: req.params.keyId })
        .populate('user', 'name email')
        .sort('-timestamp');
        
      res.json(history);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };