import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, Wallet, Moon, Sun } from 'lucide-react';

function Sidebar() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check local storage or system preference on mount
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <Wallet size={32} />
        <span>SmartExpense</span>
      </div>
      
      <div className="sidebar-nav" style={{ flex: 1 }}>
        <NavLink 
          to="/" 
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          end
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink 
          to="/expenses" 
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
        >
          <Receipt size={20} />
          <span>Expenses</span>
        </NavLink>
      </div>

      <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
        <button 
          onClick={toggleTheme} 
          className="nav-link" 
          style={{ background: 'transparent', border: 'none', width: '100%', cursor: 'pointer' }}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
