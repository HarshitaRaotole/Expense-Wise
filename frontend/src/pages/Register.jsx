import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

axios.defaults.withCredentials = true;

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const [checks, setChecks] = useState({ len: false, cap: false, num: false, sym: false });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'password') {
      setChecks({
        len: value.length >= 8,
        cap: /[A-Z]/.test(value),
        num: /[0-9]/.test(value),
        sym: /[!@#$%^&*]/.test(value)
      });
    }
  };

  const isValid = Object.values(checks).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return toast.error("Password too weak!");
    setLoading(true);
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/register`,
        formData,
        { withCredentials: true }
      );
      setIsSent(true);
      toast.success("Verification email sent!");
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating account');
    } finally { setLoading(false); }
  };

  if (isSent) return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: '60px' }}>📩</div>
      <h2 style={{ fontWeight: '800' }}>Verify your email</h2>
      <p style={{ color: '#64748b', maxWidth: '400px', margin: '20px auto' }}>We sent a link to <b>{formData.email}</b>. Click it to activate your account.</p>
      <Link to="/login" style={{ color: '#3b82f6', fontWeight: 'bold' }}>Back to Sign In</Link>
    </div>
  );

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 20px' }}>
      <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '40px', borderRadius: '24px' }}>
        <h2 style={{ textAlign: 'center', fontWeight: '800' }}>Join ExpenseWise</h2>
        <form onSubmit={handleSubmit} style={{ marginTop: '30px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Full Name</label>
            <input type="text" name="name" onChange={handleChange} className="auth-input" required />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Email</label>
            <input type="email" name="email" onChange={handleChange} className="auth-input" required />
          </div>
          <div style={{ marginBottom: '25px' }}>
            <label style={labelStyle}>Password</label>
            <input type="password" name="password" onChange={handleChange} className="auth-input" required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
              <Check label="8+ Chars" ok={checks.len} />
              <Check label="1 Capital" ok={checks.cap} />
              <Check label="1 Number" ok={checks.num} />
              <Check label="1 Symbol" ok={checks.sym} />
            </div>
          </div>
          <button type="submit" disabled={!isValid || loading} className="auth-button">
            {loading ? "Creating..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

const Check = ({ label, ok }) => (
  <div style={{ fontSize: '11px', color: ok ? '#10b981' : '#94a3b8', fontWeight: ok ? '700' : '500' }}>
    {ok ? '✅' : '○'} {label}
  </div>
);
const labelStyle = { fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '8px', display: 'block' };

export default Register;