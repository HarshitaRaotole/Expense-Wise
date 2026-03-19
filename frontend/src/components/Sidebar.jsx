import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext'; // IMPORT THIS!

const Sidebar = ({ user, isOpen, closeSidebar }) => {
  const location = useLocation();
  const { logout } = useAuth(); // Use the logout function from your context!

  const handleLogout = async () => {
    try {
      const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
      await axios.post(`${API}/api/auth/logout`); // Fixed URL!
      
      logout(); // This clears localStorage and user state
      toast.success("Logged out successfully");
      
      setTimeout(() => window.location.href = '/login', 1000);
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <>

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div>
          <div className="sidebar-header">
            Main Menu
            <button className="close-btn" onClick={closeSidebar}>✕</button>
          </div>
          
          <ul className="sidebar-links">
            <li><Link to="/home" onClick={closeSidebar} className={location.pathname === '/home' || location.pathname === '/' ? 'active' : ''}>🏠 Home</Link></li>
            <li><Link to="/dashboard" onClick={closeSidebar} className={location.pathname === '/dashboard' ? 'active' : ''}>📊 Dashboard</Link></li>
            <li><Link to="/transactions" onClick={closeSidebar} className={location.pathname === '/transactions' ? 'active' : ''}>📋 Transaction History</Link></li>
            <li><Link to="/budgets" onClick={closeSidebar} className={location.pathname === '/budgets' ? 'active' : ''}>🎯 Budgets</Link></li>
          </ul>
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="profile-icon">{user?.name?.charAt(0)}</div>
            <div>
              <div className="user-details-name">{user?.name}</div>
              <div className="user-details-status">Logged in</div>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;