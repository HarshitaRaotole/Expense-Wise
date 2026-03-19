import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ user, toggleSidebar, theme, toggleTheme }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="navbar" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 15px',
      flexWrap: 'wrap',
      gap: '10px'
    }}>
      
      {/* LOGO */}
      <Link 
        to={user ? "/dashboard" : "/"} 
        className="brand"
        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <div className="logo-icon">💸</div>
        <span style={{ fontWeight: '700', fontSize: '16px' }}>
          <span className="brand-text-1">Expense</span>
          <span className="brand-text-2">Wise</span>
        </span>
      </Link>
      
      {/* RIGHT SIDE */}
      <div className="nav-links" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        
        {/* DARK MODE */}
        <button 
          onClick={toggleTheme} 
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: 'white'
          }}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {!user ? (
          <>
            <Link to="/" className="btn-login">Home</Link>
            <Link to="/login" className="btn-login">Sign In</Link>
            <Link to="/register" className="btn-register">Sign Up</Link>
          </>
        ) : (
          <>
            {/* DESKTOP LINKS */}
            <div className="desktop-links" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
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
            </div>

            {/* HAMBURGER (Always visible on mobile) */}
            <button 
              className="hamburger-btn" 
              onClick={toggleSidebar}
              style={{
                fontSize: '22px',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              ☰
            </button>
          </>
        )}
      </div>

      {/* RESPONSIVE STYLE */}
      <style>
        {`
          @media (max-width: 768px) {
            .desktop-links {
              display: none !important;
            }

            .btn-login, .btn-register {
              font-size: 12px;
              padding: 6px 10px;
            }

            .brand span {
              font-size: 14px;
            }
          }
        `}
      </style>
    </div>
  );
};

const navLinkStyle = {
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '600',
  color: 'rgba(255, 255, 255, 0.7)',
  padding: '5px 10px',
  borderRadius: '8px'
};

export default Navbar;