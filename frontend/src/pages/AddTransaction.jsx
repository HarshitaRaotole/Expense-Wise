import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

axios.defaults.withCredentials = true;

const AddTransaction = () => {

  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const [formData, setFormData] = useState({
    amount: '',
    categoryName: '',
    description: '',
    transactionType: 'expense',
    date: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const API = process.env.REACT_APP_API_URL;
      const res = await axios.get(`${API}/api/categories`, { withCredentials: true });
      setCategories(res.data);

      if (res.data.length > 0 && !formData.categoryName) {
        setFormData(prev => ({
          ...prev,
          categoryName: res.data[0].name
        }));
      }

    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const getMaxDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 5);
    return date.toISOString().split('T')[0];
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddCustomCategory = async () => {

    if (newCategory.trim() === '') {
      alert("Category name required");
      return;
    }

    try {

      const API = process.env.REACT_APP_API_URL;

      const res = await axios.post(
        `${API}/api/categories`,
        { name: newCategory },
        { withCredentials: true }
      );

      setCategories([...categories, res.data]);

      setFormData({
        ...formData,
        categoryName: res.data.name
      });

      setNewCategory('');
      setShowCategoryModal(false);

    } catch (error) {
      alert(error.response?.data?.message || "Failed to add category");
    }
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const dataToSend = { ...formData };

      if (!dataToSend.date) {
        delete dataToSend.date;
      }

      const API = process.env.REACT_APP_API_URL;

      await axios.post(
        `${API}/api/transactions`,
        dataToSend,
        { withCredentials: true }
      );

      alert('Transaction Added Successfully!');

      navigate('/transactions');

    } catch (error) {
      alert(error.response?.data?.message || "Error adding transaction");
    }
  };

  return (

  <div className="card" style={{
    maxWidth: '600px',
    margin: '0 auto',
    padding: 'clamp(20px, 5vw, 30px)'
  }}>

    <style>{`
      @media (max-width: 768px) {
        .modal-content {
          width: 90% !important;
          padding: 20px !important;
        }

        .modal-actions {
          flex-direction: column !important;
        }

        .modal-actions button {
          width: 100%;
        }
      }
    `}</style>

    <h2 style={{
      marginBottom: '20px',
      fontSize: 'clamp(20px, 4vw, 26px)'
    }}>
      Record New Transaction
    </h2>

    <form onSubmit={handleSubmit} style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>

      <input
        type="number"
        name="amount"
        placeholder="Amount (₹)"
        value={formData.amount}
        onChange={handleChange}
        className="auth-input"
        style={inputStyle}
        required
      />

      <select
        name="categoryName"
        value={formData.categoryName}
        onChange={handleChange}
        className="auth-input"
        style={inputStyle}
        required
      >
        <option value="">Select Category</option>
        {categories.map((cat) => (
          <option key={cat._id} value={cat.name}>
            {cat.name}
          </option>
        ))}
      </select>

      <button
        type="button"
        className="add-category-btn"
        onClick={() => setShowCategoryModal(true)}
        style={{
          padding: '10px',
          fontSize: '14px',
          borderRadius: '8px'
        }}
      >
        + Add Custom Category
      </button>

      <input
        type="text"
        name="description"
        placeholder="Description (Optional)"
        value={formData.description}
        onChange={handleChange}
        className="auth-input"
        style={inputStyle}
      />

      <input
        type="date"
        name="date"
        value={formData.date}
        max={getMaxDate()}
        onChange={handleChange}
        className="auth-input"
        style={inputStyle}
      />

      <select
        name="transactionType"
        value={formData.transactionType}
        onChange={handleChange}
        className="auth-input"
        style={inputStyle}
      >
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>

      <button
        type="submit"
        className="auth-button"
        style={{
          marginTop: '10px',
          padding: '14px',
          fontSize: '15px',
          borderRadius: '10px',
          width: '100%'
        }}
      >
        Save Transaction
      </button>

    </form>

    {/* MODAL */}
    {showCategoryModal && (

      <div className="modal-overlay">

        <div className="modal-content" style={{
          maxWidth: '400px',
          width: '95%',
          padding: '25px',
          borderRadius: '16px'
        }}>

          <h3 style={{ marginBottom: '10px' }}>Create New Category</h3>

          <input
            type="text"
            placeholder="e.g., Gym, Netflix..."
            className="auth-input"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            style={{ marginTop: '10px' }}
            autoFocus
          />

          <div className="modal-actions" style={{
            display: 'flex',
            gap: '10px',
            marginTop: '15px'
          }}>

            <button
              className="btn-cancel"
              onClick={() => setShowCategoryModal(false)}
              style={{ flex: 1 }}
            >
              Cancel
            </button>

            <button
              className="btn-save"
              onClick={handleAddCustomCategory}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                flex: 1,
                padding: '10px'
              }}
            >
              Add
            </button>

          </div>

        </div>

      </div>

    )}

  </div>
);
};

export default AddTransaction;