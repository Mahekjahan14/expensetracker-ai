const connectDB = require('../utils/db');
const Expense = require('../models/Expense');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await connectDB();

    if (req.method === 'GET') {
      const expenses = await Expense.find().sort({ date: -1 });
      res.status(200).json(expenses);
      return;
    }

    if (req.method === 'POST') {
      const expense = await Expense.create(req.body);
      res.status(201).json(expense);
      return;
    }

    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (err) {
    console.error("API Error in expenses.js:", err);
    res.status(500).json({ error: err.message });
  }
};
