// migrations/add-userIds.js
const mongoose = require('mongoose');
const User = require('../models/user');
const DB_URI = 'mongodb+srv://fashinatolu:HTO3z24GoKWUUk0h@cluster0.jxr0p.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';

async function migrateUserIds() {
  await mongoose.connect(DB_URI, { 
        useNewUrlParser: true, 
        useUnifiedTopology: true 
      });
  
  const users = await User.find({ userId: { $exists: false } });
  for (const user of users) {
    user.userId = `USER-${user._id.toString().slice(-6).toUpperCase()}`;
    await user.save();
  }
  
  console.log(`Updated ${users.length} users`);
  process.exit();
}

migrateUserIds();