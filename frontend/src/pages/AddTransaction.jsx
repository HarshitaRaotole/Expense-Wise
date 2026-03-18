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

  // Fetch categories when page loads
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/categories');
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

  // Allow date up to 5 days in future
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

  // Add custom category
  const handleAddCustomCategory = async () => {

    if (newCategory.trim() === '') {
      alert("Category name required");
      return;
    }

    try {

      const res = await axios.post(
        'http://localhost:5000/api/categories',
        { name: newCategory }
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

  // Submit transaction
  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const dataToSend = { ...formData };

      if (!dataToSend.date) {
        delete dataToSend.date;
      }

      await axios.post(
        'http://localhost:5000/api/transactions',
        dataToSend
      );

      alert('Transaction Added Successfully!');

      navigate('/transactions');

    } catch (error) {
      alert(error.response?.data?.message || "Error adding transaction");
    }
  };

  return (

    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>

      <h2> Record New Transaction</h2>

      <form onSubmit={handleSubmit}>

        {/* Amount */}
        <input
          type="number"
          name="amount"
          placeholder="Amount (₹)"
          value={formData.amount}
          onChange={handleChange}
          className="auth-input"
          required
        />

        {/* Category Dropdown */}
        <select
          name="categoryName"
          value={formData.categoryName}
          onChange={handleChange}
          className="auth-input"
          required
        >

          <option value="">Select Category</option>

          {categories.map((cat) => (
            <option key={cat._id} value={cat.name}>
              {cat.name}
            </option>
          ))}

        </select>

        {/* Add Category Button */}
        <button
          type="button"
          className="add-category-btn"
          onClick={() => setShowCategoryModal(true)}
        >
          + Add Custom Category
        </button>

        {/* Description */}
        <input
          type="text"
          name="description"
          placeholder="Description (Optional)"
          value={formData.description}
          onChange={handleChange}
          className="auth-input"
        />

        {/* Date */}
        <input
          type="date"
          name="date"
          value={formData.date}
          max={getMaxDate()}
          onChange={handleChange}
          className="auth-input"
        />

        {/* Transaction Type */}
        <select
          name="transactionType"
          value={formData.transactionType}
          onChange={handleChange}
          className="auth-input"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        {/* Submit */}
        <button
          type="submit"
          className="auth-button"
        >
          Save Transaction
        </button>

      </form>

      {/* Custom Category Modal */}
      {showCategoryModal && (

        <div className="modal-overlay">

          <div className="modal-content">

            <h3>Create New Category</h3>

            <input
              type="text"
              placeholder="e.g., Gym, Netflix..."
              className="auth-input"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              style={{ marginTop: '15px' }}
              autoFocus
            />

            <div className="modal-actions">

              <button
                className="btn-cancel"
                onClick={() => setShowCategoryModal(false)}
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
                  flex: 1
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