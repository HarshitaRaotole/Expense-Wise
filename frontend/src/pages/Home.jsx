import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: "'Inter', sans-serif"
    }}>

      {/* HERO SECTION */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '30px 0 60px 0',
        gap: '30px'
      }}>

        {/* LEFT */}
        <div style={{
          flex: '1 1 400px',
          minWidth: '280px'
        }}>
          <div style={{
            display: 'inline-block',
            background: '#eff6ff',
            color: '#3b82f6',
            padding: '6px 14px',
            borderRadius: '20px',
            fontWeight: '700',
            fontSize: '12px',
            marginBottom: '20px',
            border: '1px solid #bfdbfe'
          }}>
            🚀 The Ultimate Financial Assistant
          </div>

          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: '800',
            color: '#0f172a',
            lineHeight: '1.2',
            marginBottom: '20px'
          }}>
            Manage Your Money With <span style={{ color: '#0a48ab' }}>Confidence.</span>
          </h1>

          <p style={{
            fontSize: '16px',
            color: '#64748b',
            lineHeight: '1.6',
            marginBottom: '30px',
            maxWidth: '500px'
          }}>
            ExpenseWise helps you track spending, set smart budgets.
          </p>

          {user ? (
            <Link to="/dashboard" style={{
              background: '#3b82f6',
              color: 'white',
              padding: '14px 28px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '16px',
              display: 'inline-block'
            }}>
              Go to Dashboard ➔
            </Link>
          ) : (
            <div style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <Link to="/register" style={{
                background: '#0d4eb5',
                color: 'white',
                padding: '14px 24px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '14px',
                textAlign: 'center',
                flex: '1'
              }}>
                Get Started
              </Link>

              <Link to="/login" style={{
                background: 'white',
                color: '#0f172a',
                border: '2px solid #e2e8f0',
                padding: '14px 24px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '14px',
                textAlign: 'center',
                flex: '1'
              }}>
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* RIGHT IMAGE */}
        <div style={{
          flex: '1 1 400px',
          display: 'flex',
          justifyContent: 'center',
          position: 'relative',
          minWidth: '280px'
        }}>
          <div style={{
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            width: '100%',
            height: '100%',
            background: '#eff6ff',
            borderRadius: '20px',
            zIndex: 0
          }}></div>

          <img
            src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c"
            alt="Financial Charts"
            style={{
              width: '100%',
              maxWidth: '450px',
              borderRadius: '20px',
              objectFit: 'cover',
              zIndex: 1,
              border: '6px solid white'
            }}
          />
        </div>

      </div>

      {/* FEATURES */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        paddingBottom: '40px'
      }}>

        {[{
          icon: '📊',
          title: 'Visual Analytics',
          desc: 'Understand your spending habits with beautiful charts.'
        }, {
          icon: '🎯',
          title: 'Smart Budgets',
          desc: 'Set limits and track spending automatically.'
        }, {
          icon: '🔮',
          title: 'Predictions',
          desc: 'Forecast expenses and detect unusual spending.'
        }].map((item, index) => (
          <div key={index} style={{
            background: 'white',
            padding: '25px',
            borderRadius: '16px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
            border: '1px solid #f1f5f9'
          }}>
            <div style={{
              fontSize: '32px',
              marginBottom: '15px',
              background: '#eff6ff',
              width: '60px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px'
            }}>
              {item.icon}
            </div>

            <h3 style={{
              color: '#0f172a',
              marginBottom: '10px',
              fontSize: '18px',
              fontWeight: '700'
            }}>
              {item.title}
            </h3>

            <p style={{
              color: '#64748b',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              {item.desc}
            </p>
          </div>
        ))}

      </div>

    </div>
  );
};

export default Home;