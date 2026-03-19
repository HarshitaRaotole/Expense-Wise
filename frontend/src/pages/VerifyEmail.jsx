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
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-main)',
    padding: '15px'
  }}>

    <div style={{
      maxWidth: '420px',
      width: '100%',
      padding: 'clamp(25px, 5vw, 40px)',
      textAlign: 'center',
      background: 'var(--bg-card)',
      borderRadius: '20px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
      border: '1px solid var(--border-color)'
    }}>

      {/* VERIFYING */}
      {status === 'verifying' && (
        <div>
          <div style={{
            margin: '0 auto 15px',
            border: '4px solid var(--border-color)',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            width: '35px',
            height: '35px',
            animation: 'spin 1s linear infinite'
          }}></div>

          <h2 style={{
            fontWeight: '800',
            fontSize: 'clamp(18px, 4vw, 22px)',
            marginBottom: '8px'
          }}>
            Verifying Account...
          </h2>

          <p style={{
            color: 'var(--text-muted)',
            fontSize: '14px'
          }}>
            Please wait while we verify your email.
          </p>
        </div>
      )}

      {/* SUCCESS */}
      {status === 'success' && (
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
          <div style={{
            fontSize: 'clamp(50px, 10vw, 70px)',
            marginBottom: '15px'
          }}>
            🎉
          </div>

          <h2 style={{
            fontWeight: '800',
            marginBottom: '8px',
            fontSize: 'clamp(18px, 4vw, 24px)'
          }}>
            Success!
          </h2>

          <p style={{
            color: 'var(--text-muted)',
            fontSize: '14px'
          }}>
            Your account is verified. Redirecting...
          </p>
        </div>
      )}

      {/* ERROR */}
      {status === 'error' && (
        <div>
          <div style={{
            fontSize: 'clamp(50px, 10vw, 70px)',
            marginBottom: '15px'
          }}>
            ❌
          </div>

          <h2 style={{
            color: '#ef4444',
            fontWeight: '800',
            marginBottom: '8px',
            fontSize: 'clamp(18px, 4vw, 22px)'
          }}>
            Verification Failed
          </h2>

          <p style={{
            color: 'var(--text-muted)',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            This link is invalid or expired.
          </p>

          <button
            onClick={() => navigate('/login')}
            className="auth-button"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px'
            }}
          >
            Back to Login
          </button>
        </div>
      )}

    </div>

    {/* ANIMATIONS */}
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>

  </div>
);
};

export default VerifyEmail;