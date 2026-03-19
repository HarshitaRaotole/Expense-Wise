import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

axios.defaults.withCredentials = true;

const Budgets = () => {
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]); 
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonthFilter, setSelectedMonthFilter] = useState(currentMonth); 
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ month: currentMonth, categoryId: '', amount: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonthFilter]); 

  const fetchCategories = async () => {
    try {
      const API = process.env.REACT_APP_API_URL;
      const res = await axios.get(`${API}/api/categories`, { withCredentials: true });
      setCategories(res.data);
      if (res.data.length > 0) setFormData(prev => ({ ...prev, categoryId: res.data[0]._id }));
    } catch (error) {
      toast.error("Failed to fetch categories");
    }
  };

  const fetchBudgets = async () => {
    try {
      const API = process.env.REACT_APP_API_URL;
      const res = await axios.get(`${API}/api/budgets?month=${selectedMonthFilter}`, { withCredentials: true });
      setBudgets(res.data);
    } catch (error) {
      toast.error("Failed to fetch budgets");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const API = process.env.REACT_APP_API_URL;
      await axios.post(`${API}/api/budgets`, formData, { withCredentials: true });
      toast.success('Budget Limit Saved!');
      setShowAddModal(false);
      setFormData({ month: selectedMonthFilter, categoryId: categories[0]?._id, amount: '' }); 
      fetchBudgets(); 
    } catch (error) {
      toast.error("Failed to save budget");
    }
  };

  const handleEditBudget = (budget) => {
    setFormData({
      month: selectedMonthFilter,
      categoryId: budget.category._id,
      amount: budget.budgetAmount
    });
    setShowAddModal(true);
  };

  const handleDeleteBudget = async (id) => {
    if (window.confirm("Are you sure you want to remove this budget?")) {
      try {
        const API = process.env.REACT_APP_API_URL;
        await axios.delete(`${API}/api/budgets/${id}`, { withCredentials: true });
        toast.success("Budget removed");
        fetchBudgets(); 
      } catch (error) {
        toast.error("Failed to delete budget");
      }
    }
  };

  return (
  <div style={{ paddingBottom: '30px' }}>

    <style>{`
      @media (max-width: 768px) {
        .budget-header {
          flex-direction: column !important;
          align-items: flex-start !important;
          gap: 15px;
        }

        .budget-controls {
          width: 100%;
          flex-direction: column !important;
          align-items: stretch !important;
        }

        .budget-controls button {
          width: 100%;
        }

        .budget-grid {
          grid-template-columns: 1fr !important;
        }

        .modal-content {
          width: 95% !important;
          padding: 20px !important;
        }
      }
    `}</style>

    {/* HEADER */}
    <div className="card budget-header" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px',
      marginBottom: '20px',
      flexWrap: 'wrap',
      gap: '10px'
    }}>
      <div>
        <h2 style={{
          margin: 0,
          fontSize: 'clamp(18px, 4vw, 22px)'
        }}>
          Budget Manager
        </h2>

        <p style={{
          margin: '5px 0',
          fontSize: '13px',
          color: 'var(--text-muted)'
        }}>
          Track your spending limits
        </p>
      </div>

      <div className="budget-controls" style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        
        <input 
          type="month"
          value={selectedMonthFilter}
          onChange={(e) => setSelectedMonthFilter(e.target.value)}
          style={{
            padding: '8px 10px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)'
          }}
        />

        <button
          onClick={() => {
            setFormData({ month: selectedMonthFilter, categoryId: categories[0]?._id, amount: '' });
            setShowAddModal(true);
          }}
          className="auth-button"
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        >
          + New Budget
        </button>
      </div>
    </div>

    {/* GRID */}
    <div className="budget-grid" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '15px'
    }}>

      {budgets.length === 0 && (
        <div className="card" style={{
          gridColumn: '1 / -1',
          textAlign: 'center',
          padding: '40px',
          border: '1px dashed var(--border-color)'
        }}>
          <h3>No budgets for this month</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Click "New Budget" to start
          </p>
        </div>
      )}

      {budgets.map((b) => {
        const percent = Math.min((b.spentAmount / b.budgetAmount) * 100, 100);

        let barColor = '#3b82f6';
        let statusText = 'On Track';

        if (percent >= 80) { barColor = '#f59e0b'; statusText = 'Warning'; }
        if (percent >= 100) { barColor = '#ef4444'; statusText = 'Over Budget'; }

        return (
          <div key={b._id} className="card" style={{
            padding: '20px',
            position: 'relative'
          }}>

            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: barColor
            }}></div>

            {/* TOP */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '15px'
            }}>
              <h3 style={{ margin: 0 }}>{b.category?.name}</h3>
              <span style={{
                fontSize: '12px',
                color: barColor,
                fontWeight: '600'
              }}>
                {statusText}
              </span>
            </div>

            {/* PROGRESS */}
            <div style={{ fontSize: '13px', marginBottom: '8px' }}>
              {Math.round(percent)}% used
            </div>

            <div style={{
              height: '6px',
              background: '#eee',
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '15px'
            }}>
              <div style={{
                width: `${percent}%`,
                background: barColor,
                height: '100%'
              }}></div>
            </div>

            {/* VALUES */}
            <div style={{
              fontSize: '14px',
              marginBottom: '15px'
            }}>
              ₹{b.spentAmount} / ₹{b.budgetAmount}
            </div>

            {/* ACTIONS */}
            <div style={{
              display: 'flex',
              gap: '10px'
            }}>
              <button onClick={() => handleEditBudget(b)} className="btn-edit">
                Edit
              </button>
              <button onClick={() => handleDeleteBudget(b._id)} className="btn-delete">
                Delete
              </button>
            </div>

          </div>
        );
      })}
    </div>
{/*modal*/}
    {showAddModal && (
        <div className="modal-overlay">
          
          
          <style>{`
            @media (max-width: 600px) {
              .budget-modal-content {
                width: 90% !important; /* Keeps it away from the phone edges */
                padding: 25px 20px !important;
                border-radius: 20px !important;
                max-height: 85vh; /* Prevents it from going off-screen when keyboard opens */
                overflow-y: auto;
              }
            }
          `}</style>

          <div className="modal-content budget-modal-content" style={{ maxWidth: '420px', padding: '35px', borderRadius: '24px' }}>
            
            {/* HEADER WITH CLOSE BUTTON */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: 'var(--text-main)' }}>Budget Settings</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'var(--hover-bg)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', fontSize: '18px', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}>✕</button>
            </div>

            {/* FORM WITH BEAUTIFUL LABELS */}
            <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{fontWeight: '700', fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Target Month</label>
                <input type="month" value={formData.month} onChange={(e) => setFormData({ ...formData, month: e.target.value })} className="auth-input" style={{ padding: '15px', fontSize: '15px', margin: 0 }} required />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{fontWeight: '700', fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Category</label>
                <select value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} className="auth-input" style={{ padding: '15px', fontSize: '15px', margin: 0, textTransform: 'capitalize' }} required>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={{fontWeight: '700', fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Monthly Limit (₹)</label>
                <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="auth-input" placeholder="e.g. 5000" style={{ padding: '15px', fontSize: '15px', margin: 0 }} required />
              </div>

              <button type="submit" className="auth-button" style={{ padding: '16px', fontSize: '16px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)' }}>
                Save Budget
              </button>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;