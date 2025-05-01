// backend/server.js
// require('./Middleware/polyfills');
const WebSocket = require('ws');
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
// const exchangeRoutes = require('./routes/keyExchange');
const auditRoutes = require('./routes/audit');
const settingsRoutes = require('./routes/settings');
const transactions = require('./routes/transactionRoutes');
const reports = require('./routes/reports');
const request = require('./routes/requestRoutes');
const Key = require('./models/keys'); // Assuming Mongoose models
// const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
const port = process.env.PORT || 5000;
// Create WebSocket server
const wss = new WebSocket.Server({ noServer: true });

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
  app.use('/api/users', userRoutes);
  // app.use('/api/exchange', exchangeRoutes);
  app.use('/api/audit', auditRoutes);
  app.use('/api/settings', settingsRoutes);
  // New transaction system
  app.use('/api/transactions', transactions);
  app.use('/api/reports', reports);
  app.use('/api/requests', request);

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


  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
  // Handle WebSocket upgrade
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, ws => {
    wss.emit('connection', ws, request);
  });
});


}).catch(error => {
  console.error('❌ MongoDB connection failed:', error);
  process.exit(1);
});





// app.use('/api/users', userRoutes);
// app.use('/api/analytics', analyticsRoutes);






