import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ user, toggleSidebar, theme, toggleTheme }) => {
  const location = useLocation();

  // Helper function to check if the link is currently active
  const isActive = (path) => location.pathname === path;

  return (
    <div className="navbar">
      
      
      <Link to={user ? "/dashboard" : "/"} className="brand">
        <div className="logo-icon">💸</div>
        <span>
          <span className="brand-text-1">Expense</span>
          <span className="brand-text-2">Wise</span>
        </span>
      </Link>
      
      {/* RIGHT SIDE: Links & Buttons */}
      <div className="nav-links" style={{ display: 'flex', alignItems: 'center' }}>
        
        {/* --- GLOBAL DARK MODE TOGGLE BUTTON --- */}
        <button onClick={toggleTheme} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', marginRight: '20px', color: 'white', transition: 'transform 0.3s' }}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {!user ? (
          <>
            <Link to="/" className="btn-login" style={{ marginRight: '10px' }}>Home</Link>
            <Link to="/login" className="btn-login">Sign In</Link>
            <Link to="/register" className="btn-register">Sign Up</Link>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            
           
            <Link 
              to="/dashboard" 
              className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
              style={navLinkStyle}
            >
              Dashboard
            </Link>

            <Link 
              to="/transactions" 
              className={`nav-item ${isActive('/transactions') ? 'active' : ''}`}
              style={navLinkStyle}
            >
              Transactions
            </Link>

            <Link 
              to="/budgets" 
              className={`nav-item ${isActive('/budgets') ? 'active' : ''}`}
              style={navLinkStyle}
            >
              Budgets
            </Link>

            {/* HAMBURGER BUTTON */}
            <button 
              className="hamburger-btn" 
              onClick={toggleSidebar} 
              title="Open Menu" 
              style={{ marginLeft: '10px' }}
            >
              ☰
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


const navLinkStyle = {
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '600',
  color: 'rgba(255, 255, 255, 0.7)', 
  transition: 'all 0.3s ease',
  padding: '5px 10px',
  borderRadius: '8px'
};

export default Navbar;