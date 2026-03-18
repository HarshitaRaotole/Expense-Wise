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
          <Route path="/verify/:token" element={<VerifyEmail />} />
          
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