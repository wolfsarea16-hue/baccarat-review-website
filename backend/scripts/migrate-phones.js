// backend/scripts/migrate-phones.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: '../.env' });

const normalizePhone = (phone) => {
    if (!phone) return phone;
    return phone.replace(/\D/g, '');
};

async function migrate() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/product-review-db';
        console.log('Connecting to MongoDB:', mongoUri);
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const users = await User.find({});
        console.log(`Found ${users.length} users to check`);

        let updatedCount = 0;
        for (const user of users) {
            const originalPhone = user.phoneNumber;
            const normalizedPhone = normalizePhone(originalPhone);

            if (originalPhone !== normalizedPhone) {
                console.log(`Updating user ${user.username}: ${originalPhone} -> ${normalizedPhone}`);
                user.phoneNumber = normalizedPhone;
                await user.save();
                updatedCount++;
            }
        }

        console.log(`Migration completed. ${updatedCount} users updated.`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
