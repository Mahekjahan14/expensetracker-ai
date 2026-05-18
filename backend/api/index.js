const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB with connection caching for serverless functions
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not configured in Vercel Environment Variables");
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("MongoDB Connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Robust multi-path mounting to ensure Vercel serverless rewrites match correctly
const expenseRoutes = require('../routes/expenseRoutes');
app.use('/api/expenses', expenseRoutes);
app.use('/expenses', expenseRoutes);
app.use('/backend/api/expenses', expenseRoutes);
app.use('/backend/api', expenseRoutes);

// Health check
app.get('/api', (req, res) => {
  res.json({ message: 'SmartExpense AI Backend working on Vercel 🚀' });
});

module.exports = app;
