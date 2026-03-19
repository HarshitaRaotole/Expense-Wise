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
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '15px'
    }}>
      
      <div className="card" style={{
        width: '100%',
        maxWidth: '420px',
        padding: 'clamp(20px, 5vw, 40px)',
        borderRadius: '20px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        border: '1px solid var(--border-color)'
      }}>
        
        {/* HEADER */}
        <div style={{
          textAlign: 'center',
          marginBottom: '25px'
        }}>
          <div style={{
            background: '#eff6ff',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 15px auto',
            fontSize: '24px'
          }}>
            👋
          </div>

          <h2 style={{
            fontSize: 'clamp(22px, 4vw, 28px)',
            fontWeight: '800',
            color: 'var(--text-main)',
            marginBottom: '8px'
          }}>
            Welcome Back
          </h2>

          <p style={{
            color: 'var(--text-muted)',
            fontSize: '14px'
          }}>
            Enter your credentials to access your account.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div style={{
            background: '#fef2f2',
            color: '#ef4444',
            padding: '10px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '15px',
            border: '1px solid #fecdd3',
            textAlign: 'center',
            fontWeight: '600'
          }}>
            {error}
          </div>
        )}
        
        {/* FORM */}
        <form onSubmit={handleSubmit}>
          
          <div style={{ marginBottom: '15px', textAlign: 'left' }}>
            <label style={labelStyle}>Email Address</label>
            <input 
              type="email" 
              name="email" 
              onChange={handleChange} 
              className="auth-input"
              style={inputStyle}
              required 
            />
          </div>

          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={labelStyle}>Password</label>
            <input 
              type="password" 
              name="password" 
              onChange={handleChange} 
              className="auth-input"
              style={inputStyle}
              required 
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '15px',
              borderRadius: '10px'
            }}
          >
            Sign In
          </button>
        </form>

        {/* FOOTER */}
        <div style={{
          marginTop: '20px',
          fontSize: '14px',
          color: 'var(--text-muted)',
          textAlign: 'center'
        }}>
          Don't have an account?{" "}
          <Link 
            to="/register" 
            style={{
              color: '#2c6fdc',
              fontWeight: '700',
              textDecoration: 'none'
            }}
          >
            Sign up
          </Link>
        </div>

      </div>
    </div>
  );
};

/* REUSABLE STYLES */
const labelStyle = {
  fontWeight: '700',
  fontSize: '12px',
  color: 'var(--text-muted)',
  display: 'block',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  fontSize: '14px',
  borderRadius: '8px',
  margin: 0
};

export default Login;