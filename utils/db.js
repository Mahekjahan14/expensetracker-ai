const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }
  
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;
  
  if (!uri) {
    console.error("MongoDB Connection URI is not configured in Vercel Environment Variables (checked MONGO_URI, MONGODB_URI, and DATABASE_URL)");
    throw new Error("MONGO_URI is missing in Vercel environment settings");
  }
  
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(uri, {
      bufferCommands: false, // Disable buffering so errors fail fast
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log("MongoDB Connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw new Error("Database connection failed. Verify MONGO_URI and MongoDB Atlas IP access whitelist (0.0.0.0/0).");
  }
}

module.exports = connectDB;
