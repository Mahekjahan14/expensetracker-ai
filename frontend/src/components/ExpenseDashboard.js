
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = '/api/expenses';

function ExpenseDashboard() {

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
   const res = await axios.get(API_URL);
   setExpenses(res.data);
 };

 const handleSubmit = async (e) => {
   e.preventDefault();

   await axios.post(API_URL, form);

   setForm({
     title: '',
     amount: '',
     category: '',
     date: ''
   });

   fetchExpenses();
 };

 const handleDelete = async (id) => {
   await axios.delete(`${API_URL}/${id}`);
   fetchExpenses();
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
     // clear the file input field
     document.getElementById('bill-upload').value = '';
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
     <div className="form" style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
       <h3>Scan Bill via AI</h3>
       <input id="bill-upload" type="file" accept="image/*" onChange={handleFileChange} style={{ marginBottom: '10px' }} />
       <button onClick={handleUpload} disabled={isUploading || !file} style={{ width: '100%' }}>
         {isUploading ? 'Analyzing Bill...' : 'Upload & Scan'}
       </button>
     </div>

     <form className="form" onSubmit={handleSubmit}>
       <input
         type="text"
         placeholder="Expense Title"
         value={form.title}
         onChange={(e) => setForm({...form, title: e.target.value})}
         required
       />

       <input
         type="number"
         placeholder="Amount"
         value={form.amount}
         onChange={(e) => setForm({...form, amount: e.target.value})}
         required
       />

       <input
         type="text"
         placeholder="Category"
         value={form.category}
         onChange={(e) => setForm({...form, category: e.target.value})}
         required
       />

       <input
         type="date"
         value={form.date}
         onChange={(e) => setForm({...form, date: e.target.value})}
         required
       />

       <button type="submit">Add Expense</button>
     </form>

     <div className="cards">
       {expenses.map((expense) => (
         <div className="card" key={expense._id}>
           <h3>{expense.title}</h3>
           <p>₹ {expense.amount}</p>
           <p>{expense.category}</p>
           <p>{expense.date}</p>

           <button onClick={() => handleDelete(expense._id)}>
             Delete
           </button>
         </div>
       ))}
     </div>
   </div>
 );
}

export default ExpenseDashboard;
