require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB connection...');
console.log('URI:', process.env.ATLASDB_URL?.replace(/:[^:@]+@/, ':****@')); // Hide password

mongoose.connect(process.env.ATLASDB_URL)
    .then(() => {
        console.log('✅ Connected successfully!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    });