const mongoose = require('mongoose');

const connectDB = async () => {
  const uri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URL ||
    process.env.MONGODB_URL;
  if (!uri) {
    throw new Error('Set MONGODB_URI (or link Railway Mongo — uses MONGO_URL)');
  }
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log('MongoDB connected');
};

module.exports = connectDB;
