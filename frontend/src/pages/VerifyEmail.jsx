import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; 
import toast from 'react-hot-toast';

axios.defaults.withCredentials = true;

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth(); 
  const [status, setStatus] = useState('verifying');
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verifyToken = async () => {
      try {
        // Fallback to empty string if Vercel variable is missing
        const API = process.env.REACT_APP_API_URL || ""; 
        const res = await axios.get(`${API}/api/auth/verify-email/${token}`, { withCredentials: true });
        
        login(res.data.user); 
        
        setStatus('success');
        toast.success("Account Activated! Welcome to ExpenseWise.");
        
        setTimeout(() => navigate('/dashboard'), 2000);
      } catch (err) {
        
        // --- NEW LOGIC: Handle the "Gmail Pre-fetch" Bug ---
        if (err.response?.data?.alreadyVerified) {
          setStatus('success');
          toast.success("Account is already verified! Redirecting to login...");
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setStatus('error');
          toast.error(err.response?.data?.message || "Verification failed");
        }
      }
    };

    verifyToken();
  }, [token, navigate, login]);

  return (
    <div style={{ height: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
      <div style={{ maxWidth: '450px', width: '100%', padding: '40px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)' }}>
        
        {status === 'verifying' && (
          <div>
            <div className="loader" style={{ margin: '0 auto 20px', border: '4px solid var(--border-color)', borderTop: '4px solid #3b82f6', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
            <h2 style={{ color: 'var(--text-main)', fontWeight: '800' }}>Verifying Account...</h2>
            <p style={{ color: 'var(--text-muted)' }}>Please wait while we secure your access.</p>
          </div>
        )}

        {status === 'success' && (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ fontSize: '70px', marginBottom: '20px' }}>🎉</div>
            <h2 style={{ color: 'var(--text-main)', fontWeight: '800', marginBottom: '10px' }}>Success!</h2>
            <p style={{ color: 'var(--text-muted)' }}>Your account is verified. Redirecting you now...</p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div style={{ fontSize: '70px', marginBottom: '20px' }}>❌</div>
            <h2 style={{ color: '#ef4444', fontWeight: '800', marginBottom: '10px' }}>Verification Failed</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '25px' }}>This verification link is invalid or has expired.</p>
            <button onClick={() => navigate('/login')} className="auth-button">Back to Login</button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default VerifyEmail;