import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Camera, Plus, Trash2, Receipt, Edit2, Check, X } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/expenses';

function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: '',
    date: ''
  });
  
  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', amount: '', category: '', date: '' });

  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(API_URL);
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(API_URL, form);
    setForm({ title: '', amount: '', category: '', date: '' });
    fetchExpenses();
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    fetchExpenses();
  };

  const startEdit = (expense) => {
    setEditingId(expense._id);
    setEditForm({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: expense.date
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ title: '', amount: '', category: '', date: '' });
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}`, editForm);
      setEditingId(null);
      fetchExpenses();
    } catch (err) {
      console.error('Error updating expense:', err);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
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
      if (document.getElementById('bill-upload')) {
        document.getElementById('bill-upload').value = '';
      }
      fetchExpenses();
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Error processing bill image. Please check backend logs and API Key.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Manage Expenses</h1>
        <p className="page-subtitle">Add new expenses manually or scan bills with AI</p>
      </div>

      <div className="ai-scanner">
        <div className="ai-scanner-content">
          <h3><Camera size={28} /> AI Bill Scanner</h3>
          <p>Upload a receipt or bill and let Gemini AI automatically extract the details for you.</p>
          <div className="file-input-wrapper">
            <button className="btn btn-upload">Select Image</button>
            <input id="bill-upload" type="file" accept="image/*" onChange={handleFileChange} />
          </div>
          {file && <span style={{ marginLeft: '12px' }}>{file.name}</span>}
        </div>
        <div>
          <button 
            className="btn btn-scan" 
            onClick={handleUpload} 
            disabled={isUploading || !file}
          >
            {isUploading ? 'Analyzing with AI...' : 'Scan & Extract'}
          </button>
        </div>
      </div>

      <div className="form-card">
        <h3 className="chart-title" style={{ marginBottom: '20px' }}>Add Expense Manually</h3>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label>Title</label>
            <input
              className="form-control"
              type="text"
              placeholder="e.g. Groceries"
              value={form.title}
              onChange={(e) => setForm({...form, title: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Amount (₹)</label>
            <input
              className="form-control"
              type="number"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({...form, amount: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <input
              className="form-control"
              type="text"
              placeholder="e.g. Food"
              value={form.category}
              onChange={(e) => setForm({...form, category: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              className="form-control"
              type="date"
              value={form.date}
              onChange={(e) => setForm({...form, date: e.target.value})}
              required
            />
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: '12px' }}>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <Plus size={18} /> Add Expense
            </button>
          </div>
        </form>
      </div>

      <h3 className="chart-title">Recent Expenses</h3>
      <div className="expense-list">
        {expenses.length === 0 ? (
          <p style={{ color: 'var(--text-light)' }}>No expenses recorded yet.</p>
        ) : (
          expenses.map((expense) => (
            <div className="expense-item" key={expense._id}>
              {editingId === expense._id ? (
                // EDIT MODE
                <div style={{ display: 'flex', gap: '12px', flex: 1, alignItems: 'center' }}>
                  <input
                    className="form-control"
                    type="text"
                    value={editForm.title}
                    onChange={e => setEditForm({...editForm, title: e.target.value})}
                    style={{ flex: 1.5 }}
                  />
                  <input
                    className="form-control"
                    type="text"
                    value={editForm.category}
                    onChange={e => setEditForm({...editForm, category: e.target.value})}
                    style={{ flex: 1 }}
                  />
                  <input
                    className="form-control"
                    type="date"
                    value={editForm.date}
                    onChange={e => setEditForm({...editForm, date: e.target.value})}
                    style={{ flex: 1 }}
                  />
                  <input
                    className="form-control"
                    type="number"
                    value={editForm.amount}
                    onChange={e => setEditForm({...editForm, amount: e.target.value})}
                    style={{ flex: 1 }}
                  />
                  
                  <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                    <button className="btn btn-primary" onClick={() => handleUpdate(expense._id)} style={{ padding: '8px 12px' }}>
                      <Check size={18} />
                    </button>
                    <button className="btn btn-secondary" onClick={cancelEdit} style={{ padding: '8px 12px' }}>
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                // VIEW MODE
                <>
                  <div className="expense-info">
                    <div className="expense-icon">
                      <Receipt size={24} />
                    </div>
                    <div className="expense-details">
                      <h4>{expense.title}</h4>
                      <p>{expense.category} • {new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="expense-actions">
                    <div className="expense-amount">₹ {Number(expense.amount).toLocaleString()}</div>
                    
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => startEdit(expense)}
                      style={{ padding: '8px 12px' }}
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>

                    <button 
                      className="btn btn-danger" 
                      onClick={() => handleDelete(expense._id)}
                      style={{ padding: '8px 12px' }}
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ExpensesPage;
