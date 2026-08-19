const mongoose = require('mongoose');
const env = require('../config/env');

async function connectDatabase() {
  if (!env.mongoUri) {
    throw new Error('MONGODB_URI is required');
  }

  await mongoose.connect(env.mongoUri);
  return mongoose.connection;
}

module.exports = { connectDatabase };
