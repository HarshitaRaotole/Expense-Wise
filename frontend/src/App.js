import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Register from './pages/Register';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail'; 
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import TransactionHistory from './pages/TransactionHistory'; 
import Budgets from './pages/Budgets';
import Layout from './components/Layout'; 
import './App.css'; 

axios.defaults.withCredentials = true;

// --- 15-MINUTE AUTO-LOGOUT LOGIC ---
// This listens to every request. If the backend says the cookie expired (401), it logs the user out.
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if error is 401 (Unauthorized) and user is NOT already on login page
    if (error.response && error.response.status === 401 && window.location.pathname !== '/login') {
      toast.error("Session expired. Please log in again.");
      localStorage.removeItem('user'); // Clear user from memory
      
      // Send them to the login page after a short delay so they can read the toast
      setTimeout(() => {
        window.location.href = '/login'; 
      }, 1500);
    }
    return Promise.reject(error);
  }
);

function App() {
  // --- GLOBAL DARK MODE STATE ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    // This tells the whole website to switch colors!
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <AuthProvider>
    <Router>
      {/* Pass the theme props down to the Layout */}
      <Layout theme={theme} toggleTheme={toggleTheme}>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/register" element={<div className="auth-page"><Register /></div>} />
          <Route path="/login" element={<div className="auth-page"><Login /></div>} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<TransactionHistory />} />
          <Route path="/budgets" element={<Budgets />} />
        </Routes>
      </Layout>
    </Router>
    </AuthProvider>
  );
}

export default App;