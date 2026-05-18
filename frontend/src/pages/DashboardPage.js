import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, CreditCard, PieChart as PieChartIcon } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_API_URL || ''}/api/expenses`;
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function DashboardPage() {
  const [expenses, setExpenses] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(API_URL);
      const data = res.data;
      setExpenses(data);
      processChartData(data);
    } catch (err) {
      console.error('Failed to fetch expenses', err);
    }
  };

  const processChartData = (data) => {
    let total = 0;
    const categoryMap = {};

    data.forEach(exp => {
      const amt = Number(exp.amount) || 0;
      total += amt;
      const cat = exp.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + amt;
    });

    setTotalSpent(total);

    const formattedData = Object.keys(categoryMap).map(key => ({
      name: key,
      value: categoryMap[key]
    }));

    setChartData(formattedData.sort((a, b) => b.value - a.value));
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Analytics Overview</h1>
        <p className="page-subtitle">Track where your money is going</p>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Spent</h3>
            <p>₹ {totalSpent.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>
            <CreditCard size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Transactions</h3>
            <p>{expenses.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#d1fae5', color: '#10b981' }}>
            <PieChartIcon size={24} />
          </div>
          <div className="stat-content">
            <h3>Top Category</h3>
            <p>{chartData.length > 0 ? chartData[0].name : 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="chart-card">
        <h3 className="chart-title">Expenses by Category</h3>
        {chartData.length > 0 ? (
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={100}
                  outerRadius={140}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹ ${value}`} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p style={{ color: 'var(--text-light)' }}>No expenses to display yet.</p>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
