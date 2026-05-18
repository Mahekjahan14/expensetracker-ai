import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = '/api/expenses';

const ExpenseDashboard = () => {

  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: '',
    date: ''
  });

  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(API_URL);

      const data =
        res.data?.expenses ||
        res.data?.data ||
        res.data;

      setExpenses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setExpenses([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(API_URL, form);

      setForm({
        title: '',
        amount: '',
        category: '',
        date: ''
      });

      fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFile(null);
      document.getElementById('bill-upload').value = '';
      fetchExpenses();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>

      <div className="form">
        <h3>Scan Bill via AI</h3>

        <input
          id="bill-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />

        <button onClick={handleUpload} disabled={isUploading || !file}>
          {isUploading ? 'Analyzing...' : 'Upload & Scan'}
        </button>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Expense Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />

        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          required
        />

        <input
          type="text"
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          required
        />

        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />

        <button type="submit">Add Expense</button>
      </form>

      <div className="cards">
        {Array.isArray(expenses) && expenses.length > 0 ? (
          expenses.map((expense) => (
            <div className="card" key={expense._id}>
              <h3>{expense.title}</h3>
              <p>₹ {expense.amount}</p>
              <p>{expense.category}</p>
              <p>{expense.date}</p>

              <button onClick={() => handleDelete(expense._id)}>
                Delete
              </button>
            </div>
          ))
        ) : (
          <p>No expenses found</p>
        )}
      </div>

    </div>
  );
};

export default ExpenseDashboard;