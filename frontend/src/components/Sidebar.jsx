import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Sidebar = ({ user, isOpen, closeSidebar }) => {
  const location = useLocation();

  const handleLogout = async () => {
    try {
      const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      await axios.post(`${API}/api/auth/logout`, {}, { withCredentials: true });
      localStorage.removeItem('user'); 
      toast.success("Logged out successfully");
      setTimeout(() => window.location.href = '/login', 1000);
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
  <div className={`sidebar ${isOpen ? 'open' : ''}`} style={{
    position: 'fixed',
    top: 0,
    left: isOpen ? '0' : '-260px',
    width: '260px',
    height: '100vh',
    background: 'var(--bg-card)',
    boxShadow: '2px 0 15px rgba(0,0,0,0.05)',
    transition: '0.3s ease',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  }}>
    
    <style>{`
      .sidebar-item {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        border-radius: 8px;
        text-decoration: none;
        color: var(--text-main);
        font-weight: 600;
        transition: 0.2s;
      }

      .sidebar-item:hover {
        background: var(--hover-bg);
        color: #3b82f6;
      }

      .sidebar-item.active {
        background: #eff6ff;
        color: #3b82f6;
        font-weight: 700;
      }

      .sidebar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid var(--border-color);
      }

      .menu-title {
        font-weight: 700;
        font-size: 16px;
      }

      .close-btn {
        border: none;
        background: var(--hover-bg);
        border-radius: 50%;
        width: 32px;
        height: 32px;
        cursor: pointer;
      }

      .sidebar-nav {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 15px;
      }

      .sidebar-footer {
        padding: 15px;
        border-top: 1px solid var(--border-color);
      }

      .user-card {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
      }

      .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #3b82f6;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
      }

      .user-meta {
        display: flex;
        flex-direction: column;
      }

      .user-name {
        font-weight: 600;
        font-size: 14px;
      }

      .user-status {
        font-size: 12px;
        color: #10b981;
      }

      .logout-action-btn {
        width: 100%;
        padding: 10px;
        border-radius: 8px;
        border: none;
        background: #ef4444;
        color: white;
        font-weight: 600;
        cursor: pointer;
        transition: 0.2s;
      }

      .logout-action-btn:hover {
        opacity: 0.9;
      }

      @media (max-width: 768px) {
        .sidebar {
          width: 240px;
        }
      }
    `}</style>

    <div className="sidebar-content">

      {/* HEADER */}
      <div className="sidebar-header">
        <span className="menu-title">Menu</span>
        <button className="close-btn" onClick={closeSidebar}>✕</button>
      </div>

      {/* NAVIGATION */}
      <nav className="sidebar-nav">

        {!user && (
          <>
            <Link to="/" onClick={closeSidebar} className="sidebar-item">Home</Link>
            <Link to="/login" onClick={closeSidebar} className="sidebar-item">Sign In</Link>
            <Link to="/register" onClick={closeSidebar} className="sidebar-item">Sign Up</Link>
          </>
        )}

        {user && (
          <>
            <Link to="/" onClick={closeSidebar} className={`sidebar-item ${isActive('/') ? 'active' : ''}`}>Home</Link>
            <Link to="/dashboard" onClick={closeSidebar} className={`sidebar-item ${isActive('/dashboard') ? 'active' : ''}`}>Dashboard</Link>
            <Link to="/transactions" onClick={closeSidebar} className={`sidebar-item ${isActive('/transactions') ? 'active' : ''}`}>Transactions</Link>
            <Link to="/budgets" onClick={closeSidebar} className={`sidebar-item ${isActive('/budgets') ? 'active' : ''}`}>Budgets</Link>
          </>
        )}

      </nav>
    </div>

    {/* FOOTER */}
    {user && (
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="user-meta">
            <span className="user-name">{user.name}</span>
            <span className="user-status">Online</span>
          </div>
        </div>

        <button className="logout-action-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    )}

  </div>
);
};

export default Sidebar;