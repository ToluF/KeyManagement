const Key = require('../models/keys');

exports.addKey = async (req, res) => {
  try {
    const { keyCode, description, type, location } = req.body;
    
    // Check for existing key code
    const existingKey = await Key.findOne({ keyCode });
    if (existingKey) {
      return res.status(400).json({ error: 'Key code already exists' });
    }

    const newKey = new Key({
      keyCode,
      description,
      type,
      location,
      status: 'available'
    });

    const savedKey = await newKey.save();
    res.status(201).json(savedKey);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllKeys = async (req, res) => {
  try {
    const keys = await Key.find().sort({ createdAt: -1 });
    res.json(keys);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add this new method to your existing key controller
exports.getAvailableKeys = async (req, res) => {
  try {
    const availableKeys = await Key.find({ status: 'available' })
      .select('keyCode location status')
      .lean()
      .exec();
      
    res.json(availableKeys);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.searchKeys = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'Search query required' });
    
    const keys = await Key.find({
      $or: [
        { keyCode: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { type: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } }
      ]
    }).lean().exec();

    res.json(keys);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getKeyHistory = async (req, res) => {
  try {
    const key = await Key.findById(req.params.id)
      .populate('history.user', 'name email role')
      .select('history')
      .lean()
      .exec();
    
    if (!key) {
      return res.status(404).json({ error: 'Key not found' });
    }

    res.json(key.history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateKey = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedKey = await Key.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedKey) {
      return res.status(404).json({ error: 'Key not found' });
    }

    res.json(updatedKey);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteKey = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedKey = await Key.findByIdAndDelete(id);

    if (!deletedKey) {
      return res.status(404).json({ error: 'Key not found' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};