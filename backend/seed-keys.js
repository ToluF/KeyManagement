// seed-keys.js
const mongoose = require('mongoose');
const Key = require('./models/keys'); // Update path to your Key model

// MongoDB connection
const dbURI = 'mongodb+srv://fashinatolu:HTO3z24GoKWUUk0h@cluster0.jxr0p.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0'; // Update with your DB name

async function seedKeys() {
  try {
    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await Key.deleteMany({});
    console.log('Cleared existing keys');

    // Sample keys data
    const sampleKeys = [
      {
        keyCode: 'MAIN-001',
        description: 'Main entrance master key',
        type: 'master',
        location: 'Front Desk',
        status: 'available'
      },
      {
        keyCode: 'OFF-205',
        description: 'Office 205 key',
        type: 'office',
        location: 'Second Floor West Wing',
        status: 'checked-out'
      },
      {
        keyCode: 'STOR-12',
        description: 'Storage room key',
        type: 'padlock',
        location: 'Basement Level 1',
        status: 'available'
      },
      {
        keyCode: 'SERVER-A',
        description: 'Server room access key',
        type: 'electronic',
        location: 'IT Department',
        status: 'available'
      },
      {
        keyCode: 'VEH-07',
        description: 'Company van key',
        type: 'vehicle',
        location: 'Parking Lot B',
        status: 'lost'
      }
    ];

    // Insert sample data
    const insertedKeys = await Key.insertMany(sampleKeys);
    console.log(`Inserted ${insertedKeys.length} keys`);

    // Add sample history for the first key
    await Key.findByIdAndUpdate(
      insertedKeys[0]._id,
      {
        $push: {
          history: {
            action: 'initial registration',
            user: '6511a7b8c9c1d4e8d4c8f7a1', // Replace with actual user ID
            timestamp: new Date()
          }
        }
      }
    );

    console.log('Added sample history entry');

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedKeys();