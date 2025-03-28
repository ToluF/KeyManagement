// backend/server.js
// require('./Middleware/polyfills');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB} = require('./Middleware/dbConnection');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const keyRoutes = require('./routes/key');
const userRoutes = require('./routes/users');
const loginRoutes = require('./routes/loginRoute');
const exchangeRoutes = require('./routes/keyExchange');
const lookupsRoute = require("./routes/lookups")
const auditRoutes = require('./routes/audit');
const settingsRoutes = require('./routes/settings');
const Key = require('./models/keys'); // Assuming Mongoose models
// const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse JSON bodies
app.use(express.json());
// Enable CORS so that your React front end can access the API
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Connect to MongoDB
connectDB().then(() => {
  app.use('/api/auth', loginRoutes);
  app.use('/api/keys', keyRoutes);
  app.use('/api/lookups', lookupsRoute);
  app.use('/api/users', userRoutes);
  app.use('/api/exchange', exchangeRoutes);
  app.use('/api/audit', auditRoutes);
  app.use('/api/settings', settingsRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok',
      database: process.env.MONGODB_URI
    });
  });

  // Add to your existing auth routes
  app.post('/api/register', async (req, res) => {
    try {
      const { name, email, password } = req.body;
      
      // Validation
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      // Create user
      const user = new User({ name, email, password: hashedPassword, role: 'user' });
      await user.save();

      // Generate token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
      });

      res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // app.get('/analytics', async (req, res) => {
  //   try {
  //     const keys = await Key.find();
  //     const users = await User.find();
  
  //     // Compute statistics
  //     const totalKeys = keys.length;
  //     const availableKeys = keys.filter(k => k.status === 'available').length;
  //     const issuedKeys = keys.filter(k => k.assignedTo).length;
  
  //     // Status distribution for the chart
  //     const statusDistribution = [
  //       { label: 'Available', value: availableKeys },
  //       { label: 'Issued', value: issuedKeys },
  //       { label: 'Lost', value: keys.filter(k => k.status === 'lost').length }
  //     ];
  
  //     // Fetch recent checkouts (last 5 transactions)
  //     const recentActivity = keys
  //       .filter(k => k.assignedTo)
  //       .slice(-5) // Assuming the latest transactions are at the end
  //       .map(k => ({
  //         userName: users.find(u => u._id.toString() === k.assignedTo.toString())?.name || 'Unknown',
  //         keyName: k.name
  //       }));
  
  //     res.json({
  //       totalKeys,
  //       availableKeys,
  //       issuedKeys,
  //       statusDistribution,
  //       recentActivity
  //     });
  //   } catch (error) {
  //     res.status(500).json({ error: 'Server error' });
  //   }
  // });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}).catch(error => {
  console.error('❌ MongoDB connection failed:', error);
  process.exit(1);
});





// app.use('/api/users', userRoutes);
// app.use('/api/analytics', analyticsRoutes);






