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
      padding: '0 25px',
      minHeight: '70px',
      background: 'linear-gradient(135deg, #0b2478 0%, #254982 100%)',
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
      zIndex: 10
    }}>
      
      {/* INJECTED RESPONSIVE CSS */}
      <style>
        {`
          /* Mobile Responsiveness */
          @media (max-width: 850px) {
            .desktop-links { display: none !important; }
            .navbar { padding: 0 15px !important; }
          }
          
          /* Extra Small Phones */
          @media (max-width: 400px) {
            .brand-text-1 { font-size: 16px !important; }
            .brand-text-2 { font-size: 16px !important; }
            .logo-icon { font-size: 16px !important; padding: 6px 8px !important; }
            .btn-login { font-size: 12px !important; padding: 6px 10px !important; }
            .btn-register { font-size: 12px !important; padding: 8px 12px !important; }
            .nav-links { gap: 8px !important; }
          }
        `}
      </style>

      {/* LOGO */}
      <Link 
        to={user ? "/dashboard" : "/"} 
        className="brand"
        style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
      >
        <div className="logo-icon" style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 10px', borderRadius: '8px', color: 'white' }}>💸</div>
        <span style={{ fontWeight: '800', fontSize: '20px' }}>
          <span className="brand-text-1" style={{ color: 'white' }}>Expense</span>
          <span className="brand-text-2" style={{ color: '#bfdbfe' }}>Wise</span>
        </span>
      </Link>
      
      {/* RIGHT SIDE */}
      <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        
        {/* DARK MODE TOGGLE */}
        <button 
          onClick={toggleTheme} 
          style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: 'white', transition: 'transform 0.2s', display: 'flex' }}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {!user ? (
          <>
            <Link to="/" className="btn-login" style={{ color: '#e2e8f0', textDecoration: 'none', fontWeight: '600' }}>Home</Link>
            <Link to="/login" className="btn-login" style={{ color: '#e2e8f0', textDecoration: 'none', fontWeight: '600' }}>Sign In</Link>
            <Link to="/register" className="btn-register" style={{ background: 'white', color: '#1e40af', textDecoration: 'none', fontWeight: '700', padding: '10px 18px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>Sign Up</Link>
          </>
        ) : (
          <>
            {/* DESKTOP LINKS (Hidden on smaller screens) */}
            <div className="desktop-links" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`} style={navLinkStyle}>Dashboard</Link>
              <Link to="/transactions" className={`nav-item ${isActive('/transactions') ? 'active' : ''}`} style={navLinkStyle}>Transactions</Link>
              <Link to="/budgets" className={`nav-item ${isActive('/budgets') ? 'active' : ''}`} style={navLinkStyle}>Budgets</Link>
            </div>

            {/* HAMBURGER MENU */}
            <button 
              className="hamburger-btn" 
              onClick={toggleSidebar}
              style={{ fontSize: '26px', background: 'none', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center' }}
            >
              ☰
            </button>
          </>
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
  padding: '8px 12px',
  borderRadius: '8px',
  transition: '0.2s'
};

export default Navbar;