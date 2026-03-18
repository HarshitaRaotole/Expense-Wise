import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

axios.defaults.withCredentials = true;

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterMonth, setFilterMonth] = useState(''); 
  
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [formData, setFormData] = useState({ amount: '', categoryName: '', description: '', transactionType: 'expense', date: '' });

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  const fetchTransactions = async () => {
    try {
      const API = process.env.REACT_APP_API_URL;
      const res = await axios.get(`${API}/api/transactions`, { withCredentials: true });
      setTransactions(res.data);
    } catch (error) { toast.error("Failed to fetch transactions"); }
  };

  const fetchCategories = async () => {
    try {
      const API = process.env.REACT_APP_API_URL;
      const res = await axios.get(`${API}/api/categories`, { withCredentials: true });
      setCategories(res.data);
      if (res.data.length > 0) setFormData(prev => ({ ...prev, categoryName: res.data[0].name }));
    } catch (error) { toast.error("Failed to fetch categories"); }
  };

  const availableMonths = [...new Set(transactions.map(t => t.date ? t.date.substring(0, 7) : null))].filter(Boolean).sort().reverse(); 
  const formatMonthDisplay = (yyyyMm) => {
    const [year, month] = yyyyMm.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' }); 
  };

  const filteredTransactions = transactions
    .filter((txn) => {
      const matchesSearch = (txn.description || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (txn.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || txn.transactionType === filterType;
      const matchesCategory = filterCategory === 'all' || txn.category?.name === filterCategory;
      const matchesMonth = filterMonth === '' || (txn.date && txn.date.substring(0, 7) === filterMonth);
      return matchesSearch && matchesType && matchesCategory && matchesMonth;
    })
    .sort((a, b) => {
      if (sortConfig.key === 'date') {
        return sortConfig.direction === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date);
      } else if (sortConfig.key === 'amount') {
        return sortConfig.direction === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
      return 0;
    });

  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') direction = 'asc';
    setSortConfig({ key, direction });
  };

  const resetFilters = () => {
    setSearchTerm(''); 
    setFilterType('all'); 
    setFilterCategory('all'); 
    setFilterMonth(''); 
    setSortConfig({ key: 'date', direction: 'desc' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        const API = process.env.REACT_APP_API_URL;
        await axios.delete(`${API}/api/transactions/${id}`, { withCredentials: true });
        toast.success("Transaction deleted!");
        fetchTransactions();
      } catch (error) { toast.error('Failed to delete transaction'); }
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { ...formData };
      if (!dataToSend.date) delete dataToSend.date;

      const API = process.env.REACT_APP_API_URL;
      await axios.post(`${API}/api/transactions`, dataToSend, { withCredentials: true });

      toast.success("Transaction Added Successfully! 🎉");
      closeModals(); fetchTransactions(); 
    } catch (error) { toast.error(error.response?.data?.message || "Error adding transaction"); }
  };

  const handleEditClick = (txn) => {
    setEditId(txn._id);
    setFormData({
      amount: txn.amount, description: txn.description || '', categoryName: txn.category?.name || categories[0]?.name || 'Food',
      transactionType: txn.transactionType, date: txn.date ? txn.date.split('T')[0] : '' 
    });
    setIsEditing(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const API = process.env.REACT_APP_API_URL;
      await axios.put(`${API}/api/transactions/${editId}`, formData, { withCredentials: true });
      toast.success("Transaction Updated! ✏️");
      closeModals(); fetchTransactions(); 
    } catch (error) { toast.error('Failed to update transaction'); }
  };

  const handleSaveCustomCategory = async (e) => {
    e.preventDefault();
    
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) return toast.error("Category name required");

    const isDuplicate = categories.some(
      (cat) => cat.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      return toast.error(`"${trimmedName}" already exists!`);
    }

    try {
      const API = process.env.REACT_APP_API_URL;
      const res = await axios.post(`${API}/api/categories`, { name: trimmedName }, { withCredentials: true });

      setCategories([...categories, res.data]);
      setFormData({ ...formData, categoryName: res.data.name }); 
      setNewCategoryName('');
      setIsAddingCategory(false);
      toast.success("Category Added!");

    } catch (error) {
      const serverMessage = error.response?.data?.message || "Failed to add category";
      toast.error(serverMessage); 
    }
  };

  const closeModals = () => {
    setShowAddModal(false); setIsEditing(false); setIsAddingCategory(false);
    setFormData({ amount: '', categoryName: categories[0]?.name || 'Food', description: '', transactionType: 'expense', date: '' });
  };

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
      
      <style>{`
        .sortable-header { cursor: pointer; transition: color 0.2s; user-select: none; }
        .sortable-header:hover { color: #3b82f6; }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '25px', borderBottom: '1px solid var(--border-color)' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-main)' }}>📋 Transaction History</h2>
          <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>Manage and track all your financial records.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="auth-button" style={{ width: 'auto', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)' }}>
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>+</span> Add Transaction
        </button>
      </div>

      <div style={{ padding: '20px 25px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
        
        <input 
          type="text" placeholder="🔍 Search descriptions..." 
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
          className="auth-input" style={{ flex: 2, minWidth: '200px', margin: 0 }}
        />

        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="auth-select" style={{ flex: 1, minWidth: '150px', margin: 0 }}>
          <option value="">🗓️ All Months</option>
          {availableMonths.map(m => (
            <option key={m} value={m}>{formatMonthDisplay(m)}</option>
          ))}
        </select>

        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="auth-select" style={{ flex: 1, minWidth: '130px', margin: 0 }}>
          <option value="all">All Types</option>
          <option value="expense">📉 Expenses</option>
          <option value="income">📈 Incomes</option>
        </select>

        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="auth-select" style={{ flex: 1, minWidth: '150px', margin: 0, textTransform: 'capitalize' }}>
          <option value="all">All Categories</option>
          {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
        </select>

        <button onClick={resetFilters} style={{ padding: '12px 20px', background: 'var(--hover-bg)', border: 'none', borderRadius: '8px', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>
          Reset
        </button>

      </div>

      <div style={{ overflowX: 'auto', padding: '10px 25px 25px 25px' }}>
        <table className="transaction-table">
          <thead>
            <tr>
              <th className="sortable-header" onClick={() => requestSort('date')}>
                Date {sortConfig.key === 'date' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
              </th>
              <th>Description</th>
              <th>Category</th>
              <th>Type</th>
              <th className="sortable-header" onClick={() => requestSort('amount')}>
                Amount {sortConfig.key === 'amount' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
              </th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((txn) => (
              <tr key={txn._id} style={{ transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td>{new Date(txn.date).toLocaleDateString('en-GB')}</td>
                <td>{txn.description || <span style={{color: 'var(--text-muted)'}}>-</span>}</td>
                <td><span style={{ background: 'var(--hover-bg)', color: '#3b82f6', padding: '6px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', textTransform: 'capitalize' }}>{txn.category?.name}</span></td>
                <td style={{ fontWeight: '700', fontSize: '13px', color: txn.transactionType === 'income' ? '#10b981' : '#ef4444' }}>{txn.transactionType.toUpperCase()}</td>
                <td style={{ fontWeight: '700', color: txn.transactionType === 'income' ? '#10b981' : '#ef4444' }}>
                  {txn.transactionType === 'income' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                </td>
                <td style={{ textAlign: 'right', minWidth: '150px' }}>
                  <button onClick={() => handleEditClick(txn)} className="btn-edit">Edit</button>
                  <button onClick={() => handleDelete(txn._id)} className="btn-delete">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- RESTORED BEAUTIFUL MODAL --- */}
      {(showAddModal || isEditing) && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px', padding: '35px', borderRadius: '24px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>
                  {isEditing ? '✏️ Edit Transaction' : '➕ Record New Transaction'}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>Fill in the details below to track your spending.</p>
              </div>
              <button onClick={closeModals} style={{ background: 'var(--hover-bg)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', fontSize: '18px', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            
            <form onSubmit={isEditing ? handleUpdateSubmit : handleAddSubmit}>
              
              <label style={{fontWeight: 'bold', fontSize: '12px', color: 'var(--text-muted)'}}>Amount (₹)</label>
              <input type="number" name="amount" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="auth-input" style={{ padding: '16px', fontSize: '16px' }} required />
              
              <label style={{fontWeight: 'bold', fontSize: '12px', color: 'var(--text-muted)'}}>Category</label>
              <div style={{ marginBottom: '15px' }}>
                {isAddingCategory ? (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="text" placeholder="Enter new category name..." value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="auth-input" style={{ margin: 0, flex: 1, padding: '16px', fontSize: '16px' }} autoFocus />
                    <button type="button" onClick={handleSaveCustomCategory} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '0 20px', fontWeight: 'bold', cursor: 'pointer' }}>Save</button>
                    <button type="button" onClick={() => setIsAddingCategory(false)} style={{ background: 'var(--hover-bg)', color: 'var(--text-muted)', border: 'none', borderRadius: '8px', padding: '0 20px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <select name="categoryName" value={formData.categoryName} onChange={(e) => setFormData({...formData, categoryName: e.target.value})} className="auth-select" style={{ padding: '16px', fontSize: '16px', textTransform: 'capitalize', marginBottom: '10px' }} required>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                    <button type="button" className="add-category-btn" onClick={() => setIsAddingCategory(true)}>+ Add Custom Category</button>
                  </>
                )}
              </div>

              <label style={{fontWeight: 'bold', fontSize: '12px', color: 'var(--text-muted)'}}>Description (Optional)</label>
              <input type="text" name="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="auth-input" style={{ padding: '16px', fontSize: '16px' }} />
              
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{fontWeight: 'bold', fontSize: '12px', color: 'var(--text-muted)'}}>Date</label>
                  <input type="date" name="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="auth-input" style={{ padding: '16px', fontSize: '16px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{fontWeight: 'bold', fontSize: '12px', color: 'var(--text-muted)'}}>Type</label>
                  <select name="transactionType" value={formData.transactionType} onChange={(e) => setFormData({...formData, transactionType: e.target.value})} className="auth-select" style={{ padding: '16px', fontSize: '16px', fontWeight: '600' }}>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="auth-button" style={{ padding: '16px', fontSize: '16px', borderRadius: '12px', marginTop: '10px', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)' }}>
                {isEditing ? 'Save Changes' : 'Save Transaction'}
              </button>
            </form>

          </div>
        </div>
      )}
      
    </div>
  );
};

export default TransactionHistory;