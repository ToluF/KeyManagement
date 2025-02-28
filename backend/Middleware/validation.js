// Create validation.js
const validateKey = (req, res, next) => {
    const { name, location } = req.body;
    if (!name || !location) {
      return res.status(400).json({ error: 'Name and location are required' });
    }
    next();
  };
  
  // In server.js
  app.post('/api/keys', validateKey, (req, res) => {
    // ... existing code ...
  });