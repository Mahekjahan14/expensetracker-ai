const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not configured in Vercel Environment Variables");
    throw new Error("MONGO_URI is missing in Vercel environment settings");
  }
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false, // Disable buffering so errors fail fast rather than timing out after 10s
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log("MongoDB Connected successfully");
  } catch (err) {
    console.error("MongoDB Atlas connection error. Please verify MONGO_URI and check that Network Access in MongoDB Atlas is set to Allow Anywhere (0.0.0.0/0):", err);
    throw new Error("Database connection failed. Verify MONGO_URI and MongoDB Atlas IP access whitelist (0.0.0.0/0).");
  }
}

module.exports = connectDB;
