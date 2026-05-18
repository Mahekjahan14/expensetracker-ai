
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
 title: String,
 amount: Number,
 category: String,
 date: String,
 imageUrl: String
});

module.exports = mongoose.model('Expense', expenseSchema);
