const mongoose = require('mongoose');
const Key = require('./models/keys');

// Configuration
const DB_URI = 'mongodb+srv://fashinatolu:HTO3z24GoKWUUk0h@cluster0.jxr0p.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';
const NEW_KEYS_TO_ADD = 20; // Number of new keys to generate
const KEY_CONFIG = {
  prefix: 'KEY-',
  startNumber: 1001, // Start from a high number to avoid conflicts
  types: ['office', 'padlock', 'electronic', 'storage', 'lab'],
  locations: [
    'Front Desk', 
    'Second Floor West Wing',
    'Main Office',
    'Science Wing',
    'Security Room'
  ]
};

function generateKeyData(sequence) {
  return {
    keyCode: `${KEY_CONFIG.prefix}${sequence.toString().padStart(4, '0')}`,
    description: `${KEY_CONFIG.types[Math.floor(Math.random() * KEY_CONFIG.types.length)]} key`,
    type: KEY_CONFIG.types[Math.floor(Math.random() * KEY_CONFIG.types.length)],
    location: KEY_CONFIG.locations[Math.floor(Math.random() * KEY_CONFIG.locations.length)],
    status: 'available', // Force available status
    createdAt: new Date() // Explicit creation date
  };
}

async function addNewKeys() {
  try {
    await mongoose.connect(DB_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log('Connected to MongoDB');

    // Generate new keys
    const newKeys = Array.from({ length: NEW_KEYS_TO_ADD }, (_, i) => 
      generateKeyData(KEY_CONFIG.startNumber + i)
    );

    // Add special demo keys (only if they don't exist)
    const demoKeys = [
      {
        keyCode: 'MAIN-001',
        description: 'Main entrance master key',
        type: 'master',
        location: 'Front Desk',
        status: 'available'
      },
      {
        keyCode: 'SERVER-A',
        description: 'Server room access key',
        type: 'electronic',
        location: 'IT Department',
        status: 'available'
      }
    ];

    // Insert only new keys that don't already exist
    const insertResults = await Key.insertMany([...demoKeys, ...newKeys], {
      ordered: false, // Continue on error
      rawResult: true
    });

    console.log(`Successfully added ${insertResults.insertedCount} new keys`);
    if (insertResults.writeErrors?.length > 0) {
      console.log(`Skipped ${insertResults.writeErrors.length} duplicate keys`);
    }

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

addNewKeys();