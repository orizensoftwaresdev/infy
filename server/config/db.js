// server/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri || uri.includes('<username>') || uri.includes('<password>')) {
      console.warn('⚠️  MONGO_URI not configured. Update your .env file with MongoDB Atlas credentials.');
      console.warn('   Server running without database — API calls will fail until DB is connected.');
      return;
    }
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('   Server will continue running. Fix MONGO_URI in .env and restart.');
  }
};

module.exports = connectDB;

