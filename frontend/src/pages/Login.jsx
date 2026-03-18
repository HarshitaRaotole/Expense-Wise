import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

axios.defaults.withCredentials = true;

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const { login } = useAuth(); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const API = process.env.REACT_APP_API_URL;

      const response = await axios.post(
        `${API}/api/auth/login`,
        formData,
        { withCredentials: true }
      );
      
      login(response.data.user); 
      navigate('/dashboard'); 
      
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Try again.');
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '40px', borderRadius: '24px', boxShadow: '0 15px 35px rgba(0,0,0,0.04)', border: '1px solid var(--border-color)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ background: '#eff6ff', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', fontSize: '30px' }}>
            👋
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '10px' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Enter your credentials to access your account.</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', border: '1px solid #fecdd3', textAlign: 'center', fontWeight: '600' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</label>
            <input type="email" name="email" onChange={handleChange} className="auth-input" style={{ padding: '15px', fontSize: '15px', margin: 0 }} required />
          </div>

          <div style={{ marginBottom: '30px', textAlign: 'left' }}>
            <label style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
            <input type="password" name="password" onChange={handleChange} className="auth-input" style={{ padding: '15px', fontSize: '15px', margin: 0 }} required />
          </div>

          <button type="submit" className="auth-button" style={{ padding: '16px', fontSize: '16px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)' }}>
            Sign In to Dashboard
          </button>
        </form>

        <div style={{ marginTop: '25px', fontSize: '15px', color: 'var(--text-muted)', textAlign: 'center' }}>
          Don't have an account? <Link to="/register" style={{ color: '#2c6fdc', fontWeight: '700', textDecoration: 'none' }}>Sign up here</Link>
        </div>

      </div>
    </div>
  );
};

export default Login;