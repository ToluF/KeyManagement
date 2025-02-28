const mongoose = require('mongoose');
const Key = require('./models/keys');
const Transaction = require('./models/exchangeTransaction');
require('dotenv').config();

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Find keys with existing history array
        const keys = await Key.find({
        history: { $exists: true, $type: 'array', $ne: [] }
        });
        
        console.log(`Found ${keys.length} keys with history to migrate`);
        
        for (const key of keys) {
        // Ensure history exists and is an array
        if (key.history && Array.isArray(key.history)) {
            const transactions = key.history.map(entry => ({
            key: key._id,
            user: entry.user,
            action: entry.action,
            timestamp: entry.timestamp || new Date(),
            notes: `Migrated from old history - ${entry.action}`
            }));
            
            await Transaction.insertMany(transactions);
            await Key.updateOne({ _id: key._id }, { $unset: { history: 1 } });
        }
        }
        
        console.log(`Migrated ${keys.length} key histories`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();