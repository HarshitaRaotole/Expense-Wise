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
    <div style={{ paddingBottom: '40px' }}>
      
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '25px', marginBottom: '30px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700' }}>Budget Manager</h2>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>Track your spending limits and stay on target.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--input-bg)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginRight: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Month:</span>
            <input 
              type="month" 
              value={selectedMonthFilter} 
              onChange={(e) => setSelectedMonthFilter(e.target.value)} 
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', cursor: 'pointer' }} 
            />
          </div>

          <button onClick={() => {
            setFormData({ month: selectedMonthFilter, categoryId: categories[0]?._id, amount: '' });
            setShowAddModal(true);
          }} className="auth-button" style={{ width: 'auto', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600' }}>
            Set New Budget
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
        
        {budgets.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', border: '1px dashed var(--border-color)', boxShadow: 'none' }}>
            <h3 style={{ marginBottom: '8px', fontSize: '18px' }}>No budgets set for this month</h3>
            <p style={{ color: 'var(--text-muted)' }}>Click "Set New Budget" to start planning your finances.</p>
          </div>
        ) : null}

        {budgets.map((b) => {
          const percent = Math.min((b.spentAmount / b.budgetAmount) * 100, 100);
          
          let barColor = '#3b82f6'; 
          let statusText = 'On Track';
          
          if (percent >= 80) { barColor = '#f59e0b'; statusText = 'Warning'; }
          if (percent >= 100) { barColor = '#ef4444'; statusText = 'Over Budget'; }

          return (
            <div key={b._id} className="card" style={{ padding: '25px', position: 'relative', overflow: 'hidden' }}>
              
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: barColor }}></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--hover-bg)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px' }}>
                    {b.category?.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 style={{ margin: 0, textTransform: 'capitalize', fontSize: '18px' }}>{b.category?.name}</h3>
                </div>
                
                <span style={{ fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '6px', color: barColor, background: `${barColor}15` }}>
                  {statusText}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>
                <span style={{ color: 'var(--text-muted)' }}>Used: {Math.round(percent)}%</span>
                <span style={{ color: 'var(--text-main)' }}>₹{b.spentAmount} <span style={{color: 'var(--text-muted)', fontWeight: '500'}}>/ ₹{b.budgetAmount}</span></span>
              </div>
              
              <div style={{ height: '8px', background: 'var(--hover-bg)', borderRadius: '4px', marginBottom: '25px', overflow: 'hidden' }}>
                <div style={{ width: `${percent}%`, backgroundColor: barColor, height: '100%', borderRadius: '4px', transition: 'width 0.5s ease-in-out' }}></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--hover-bg)', borderRadius: '10px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px', display: 'block', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {b.remainingAmount >= 0 ? 'Remaining' : 'Overspent'}
                  </span>
                  <strong style={{ color: b.remainingAmount >= 0 ? '#10b981' : '#ef4444', fontSize: '18px' }}>
                    ₹{Math.abs(b.remainingAmount)}
                  </strong>
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleEditBudget(b)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: '0.2s' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDeleteBudget(b._id)} style={{ background: '#fef2f2', border: '1px solid #fecdd3', color: '#ef4444', padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: '0.2s' }}>
                    Delete
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px', padding: '35px', borderRadius: '16px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>Budget Settings</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'var(--hover-bg)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontSize: '16px', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{fontWeight: '600', fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase'}}>Target Month</label>
                <input type="month" value={formData.month} onChange={(e) => setFormData({ ...formData, month: e.target.value })} className="auth-input" required />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{fontWeight: '600', fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase'}}>Category</label>
                <select value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} className="auth-input" style={{ textTransform: 'capitalize' }} required>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={{fontWeight: '600', fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase'}}>Monthly Limit (₹)</label>
                <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="auth-input" placeholder="0.00" required />
              </div>

              <button type="submit" className="auth-button" style={{ borderRadius: '8px' }}>Save Budget Configuration</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;