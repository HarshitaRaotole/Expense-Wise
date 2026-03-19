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

      @media (max-width: 768px) {
        .filters-container {
          flex-direction: column !important;
          align-items: stretch !important;
        }

        .filters-container input,
        .filters-container select,
        .filters-container button {
          width: 100% !important;
        }

        .header-container {
          flex-direction: column;
          align-items: flex-start !important;
          gap: 10px;
        }

        .modal-content {
          width: 95% !important;
          padding: 20px !important;
        }

        .modal-row {
          flex-direction: column !important;
        }
      }
    `}</style>

    {/* HEADER */}
    <div className="header-container" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px',
      borderBottom: '1px solid var(--border-color)',
      flexWrap: 'wrap',
      gap: '10px'
    }}>
      <div>
        <h2 style={{ margin: 0 }}>📋 Transaction History</h2>
        <p style={{ margin: '5px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
          Manage and track all your records
        </p>
      </div>

      <button 
        onClick={() => setShowAddModal(true)} 
        className="auth-button"
        style={{ padding: '10px 16px', borderRadius: '8px' }}
      >
        + Add
      </button>
    </div>

    {/* FILTERS */}
    <div className="filters-container" style={{
      padding: '15px',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap'
    }}>
      
      <input 
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="auth-input"
        style={{ flex: 2, minWidth: '150px' }}
      />

      <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="auth-select">
        <option value="">All Months</option>
        {availableMonths.map(m => (
          <option key={m} value={m}>{formatMonthDisplay(m)}</option>
        ))}
      </select>

      <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="auth-select">
        <option value="all">All Types</option>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>

      <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="auth-select">
        <option value="all">All Categories</option>
        {categories.map(cat => (
          <option key={cat._id} value={cat.name}>{cat.name}</option>
        ))}
      </select>

      <button onClick={resetFilters} style={{
        padding: '10px',
        background: '#fee2e2',
        border: 'none',
        borderRadius: '6px',
        color: '#ef4444',
        fontWeight: '600'
      }}>
        Reset
      </button>
    </div>

    {/* TABLE */}
    <div style={{ overflowX: 'auto' }}>
      <table className="transaction-table" style={{ minWidth: '600px' }}>
        <thead>
          <tr>
            <th onClick={() => requestSort('date')} className="sortable-header">Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Type</th>
            <th onClick={() => requestSort('amount')} className="sortable-header">Amount</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredTransactions.map(txn => (
            <tr key={txn._id}>
              <td>{new Date(txn.date).toLocaleDateString('en-GB')}</td>
              <td>{txn.description || '-'}</td>
              <td>{txn.category?.name}</td>
              <td style={{ color: txn.transactionType === 'income' ? 'green' : 'red' }}>
                {txn.transactionType}
              </td>
              <td>
                ₹{txn.amount}
              </td>
              <td>
                <button onClick={() => handleEditClick(txn)} className="btn-edit">Edit</button>
                <button onClick={() => handleDelete(txn._id)} className="btn-delete">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* MODAL */}
    {(showAddModal || isEditing) && (
      <div className="modal-overlay">
        <div className="modal-content" style={{ maxWidth: '500px', width: '90%' }}>
          
          <h3>{isEditing ? "Edit Transaction" : "Add Transaction"}</h3>

          <form onSubmit={isEditing ? handleUpdateSubmit : handleAddSubmit}>
            
            <input
              type="number"
              placeholder="Amount"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="auth-input"
            />

            <select
              value={formData.categoryName}
              onChange={(e) => setFormData({...formData, categoryName: e.target.value})}
              className="auth-select"
            >
              {categories.map(cat => (
                <option key={cat._id}>{cat.name}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="auth-input"
            />

            <div className="modal-row" style={{ display: 'flex', gap: '10px' }}>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="auth-input"
              />

              <select
                value={formData.transactionType}
                onChange={(e) => setFormData({...formData, transactionType: e.target.value})}
                className="auth-select"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <button type="submit" className="auth-button">
              Save
            </button>
          </form>

        </div>
      </div>
    )}
  </div>
);
};

export default TransactionHistory;