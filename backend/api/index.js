const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB (Vercel keeps connections warm between calls)
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
}

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

app.use('/api/expenses', require('../routes/expenseRoutes'));

// Health check
app.get('/api', (req, res) => {
  res.json({ message: 'SmartExpense AI Backend working on Vercel 🚀' });
});

module.exports = app;
