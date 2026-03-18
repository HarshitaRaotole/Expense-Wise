import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: "'Inter', sans-serif" }}>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', padding: '40px 0 80px 0', gap: '50px' }}>
        
        <div style={{ flex: '1 1 500px' }}>
          <div style={{ display: 'inline-block', background: '#eff6ff', color: '#3b82f6', padding: '8px 16px', borderRadius: '20px', fontWeight: '700', fontSize: '14px', marginBottom: '25px', border: '1px solid #bfdbfe' }}>
            🚀 The Ultimate Financial Assistant
          </div>
          
          <h1 style={{ fontSize: '56px', fontWeight: '800', color: '#0f172a', lineHeight: '1.1', marginBottom: '25px', letterSpacing: '-1px' }}>
            Manage Your Money With <span style={{ color: '#0a48ab' }}>Confidence.</span>
          </h1>
          
          <p style={{ fontSize: '18px', color: '#64748b', lineHeight: '1.6', marginBottom: '40px', maxWidth: '500px' }}>
            ExpenseWise helps you track spending, set smart budgets.
          </p>
          
          {user ? (
            <Link to="/dashboard" style={{ background: '#3b82f6', color: 'white', padding: '16px 35px', borderRadius: '12px', textDecoration: 'none', fontWeight: '700', fontSize: '18px', boxShadow: '0 10px 25px rgba(59, 130, 246, 0.35)', display: 'inline-block', transition: 'transform 0.2s' }}>
              Go to Dashboard ➔
            </Link>
          ) : (
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <Link to="/register" style={{ background: '#0d4eb5', color: 'white', padding: '16px 35px', borderRadius: '12px', textDecoration: 'none', fontWeight: '700', fontSize: '16px', boxShadow: '0 10px 25px rgba(59, 130, 246, 0.35)' }}>
                Get Started for Free
              </Link>
              <Link to="/login" style={{ background: 'white', color: '#0f172a', border: '2px solid #e2e8f0', padding: '16px 35px', borderRadius: '12px', textDecoration: 'none', fontWeight: '700', fontSize: '16px' }}>
                Sign In
              </Link>
            </div>
          )}
        </div>

        <div style={{ flex: '1 1 500px', display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100%', height: '100%', background: '#eff6ff', borderRadius: '24px', zIndex: 0 }}></div>
          
          <img 
            src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Financial Charts" 
            style={{ width: '100%', maxWidth: '550px', borderRadius: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.15)', objectFit: 'cover', zIndex: 1, border: '8px solid white' }}
          />
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', paddingBottom: '50px' }}>
        
        <div style={{ background: 'white', padding: '40px 30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', transition: 'transform 0.3s' }}>
          <div style={{ fontSize: '45px', marginBottom: '20px', background: '#eff6ff', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }}>📊</div>
          <h3 style={{ color: '#0f172a', marginBottom: '15px', fontSize: '22px', fontWeight: '800' }}>Visual Analytics</h3>
          <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6' }}>Understand your spending habits with beautiful, interactive charts and 12-month trend tracking.</p>
        </div>

        <div style={{ background: 'white', padding: '40px 30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', transition: 'transform 0.3s' }}>
          <div style={{ fontSize: '45px', marginBottom: '20px', background: '#fef2f2', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }}>🎯</div>
          <h3 style={{ color: '#0f172a', marginBottom: '15px', fontSize: '22px', fontWeight: '800' }}>Smart Budgets</h3>
          <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6' }}>Set strict limits for your categories. We track your progress automatically so you never overspend.</p>
        </div>

        <div style={{ background: 'white', padding: '40px 30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', transition: 'transform 0.3s' }}>
          <div style={{ fontSize: '45px', marginBottom: '20px', background: '#f5f3ff', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }}>🔮</div>
          <h3 style={{ color: '#0f172a', marginBottom: '15px', fontSize: '22px', fontWeight: '800' }}> Predictions</h3>
          <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6' }}>Our engine forecasts your end-of-month expenses and emails you if unusual spending is detected.</p>
        </div>

      </div>

    </div>
  );
};

export default Home;