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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '25px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1e293b' }}>📋 Transaction History</h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px' }}>Manage and track all your financial records.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="auth-button" style={{ width: 'auto', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)' }}>
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>+</span> Add Transaction
        </button>
      </div>

      <div style={{ padding: '20px 25px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '15px', flexWrap: 'wrap', backgroundColor: '#ffffff', alignItems: 'center' }}>
        
        <input 
          type="text" placeholder="🔍 Search descriptions..." 
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
          style={{ flex: 2, minWidth: '200px', padding: '12px 15px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', fontSize: '14px' }}
        />

        <select 
          value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} 
          style={{ flex: 1, minWidth: '150px', padding: '12px 15px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', fontSize: '14px', backgroundColor: 'white', fontWeight: '600', color: '#475569' }}
        >
          <option value="">🗓️ All Months</option>
          {availableMonths.map(m => (
            <option key={m} value={m}>{formatMonthDisplay(m)}</option>
          ))}
        </select>

        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ flex: 1, minWidth: '130px', padding: '12px 15px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', fontSize: '14px', backgroundColor: 'white', fontWeight: '600', color: '#475569' }}>
          <option value="all">All Types</option>
          <option value="expense">📉 Expenses</option>
          <option value="income">📈 Incomes</option>
        </select>

        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ flex: 1, minWidth: '150px', padding: '12px 15px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', fontSize: '14px', backgroundColor: 'white', fontWeight: '600', color: '#475569', textTransform: 'capitalize' }}>
          <option value="all">All Categories</option>
          {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
        </select>

        <button onClick={resetFilters} style={{ padding: '12px 20px', background: '#f1f5f9', border: 'none', borderRadius: '8px', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>
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
              <tr key={txn._id}>
                <td>{new Date(txn.date).toLocaleDateString('en-GB')}</td>
                <td>{txn.description || '-'}</td>
                <td>{txn.category?.name}</td>
                <td>{txn.transactionType}</td>
                <td>{txn.amount}</td>
                <td style={{ textAlign: 'right' }}>
                  <button onClick={() => handleEditClick(txn)}>Edit</button>
                  <button onClick={() => handleDelete(txn._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(showAddModal || isEditing) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <form onSubmit={isEditing ? handleUpdateSubmit : handleAddSubmit}>
              <input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
              <select value={formData.categoryName} onChange={(e) => setFormData({...formData, categoryName: e.target.value})}>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              <input type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
              <select value={formData.transactionType} onChange={(e) => setFormData({...formData, transactionType: e.target.value})}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              <button type="submit">{isEditing ? 'Update' : 'Add'}</button>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default TransactionHistory;