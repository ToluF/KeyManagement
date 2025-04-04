// reset-passwords.js
const User = require('../models/user');
const bcrypt = require('bcryptjs');

async function migrate() {
  const users = await User.find();
  
  for (const user of users) {
    if (!user.password.startsWith('$2a$')) { // Check if plaintext
      user.password = await bcrypt.hash(user.password, 10);
      await user.save();
    }
  }
  
  console.log('Migration complete');
}

migrate();