const connectDB = require('../../utils/db');
const Expense = require('../../models/Expense');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;

  try {
    await connectDB();

    if (req.method === 'PUT') {
      const updatedExpense = await Expense.findByIdAndUpdate(id, req.body, { new: true });
      res.status(200).json(updatedExpense);
      return;
    }

    if (req.method === 'DELETE') {
      await Expense.findByIdAndDelete(id);
      res.status(200).json({ message: 'Expense deleted successfully' });
      return;
    }

    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (err) {
    console.error("API Error in [id].js:", err);
    res.status(500).json({ error: err.message });
  }
};
