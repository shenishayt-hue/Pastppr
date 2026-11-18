const mongoose = require('mongoose');
const { mongoUri } = require('./config');

async function connectDB() {
  if (!mongoUri || mongoUri.includes('USER:PASSWORD')) {
    console.warn('MONGODB_URI not set - running without cache/stats');
    return;
  }
  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
  } catch (e) {
    console.error('MongoDB connection failed:', e.message);
  }
}

const isReady = () => mongoose.connection.readyState === 1;
module.exports = { connectDB, isReady };
