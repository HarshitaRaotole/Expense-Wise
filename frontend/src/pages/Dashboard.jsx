import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from 'recharts';
import toast from 'react-hot-toast';

axios.defaults.withCredentials = true;

const Dashboard = () => {
  const currentMonthStr = new Date().toISOString().slice(0, 7); 
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  
  const [chartData, setChartData] = useState(null); 
  const [insights, setInsights] = useState(null); 
  const [budgets, setBudgets] = useState([]); 
  const [availableMonths, setAvailableMonths] = useState([currentMonthStr]); 
  const [dismissedAlerts, setDismissedAlerts] = useState(() => JSON.parse(localStorage.getItem('dismissedAlerts')) || {});
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchAvailableMonths = async () => {
      try {
        const API = process.env.REACT_APP_API_URL;
        const res = await axios.get(`${API}/api/transactions`, { withCredentials: true });
        let months = [...new Set(res.data.map(t => t.date ? t.date.substring(0, 7) : null))].filter(Boolean).sort().reverse();
        if (!months.includes(currentMonthStr)) months.unshift(currentMonthStr);
        setAvailableMonths(months);
      } catch (error) { console.error("Failed to fetch available months"); }
    };
    fetchAvailableMonths();
  }, [currentMonthStr]);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth]); 

  const fetchDashboardData = async () => {
    try {
      const API = process.env.REACT_APP_API_URL;
      const [chartRes, insightRes, budgetRes] = await Promise.all([
        axios.get(`${API}/api/insights/charts?month=${selectedMonth}`, { withCredentials: true }),
        axios.get(`${API}/api/insights?month=${selectedMonth}`, { withCredentials: true }),
        axios.get(`${API}/api/budgets?month=${selectedMonth}`, { withCredentials: true })
      ]);
      setChartData(chartRes.data);
      setInsights(insightRes.data);
      setBudgets(budgetRes.data);
    } catch (error) {
      if (error.response?.status === 401) return;
      toast.error("Failed to load dashboard data");
    }
  };

  const handleDismissAlert = (alertType) => {
    const alertKey = `${selectedMonth}-${alertType}`; 
    const newDismissed = { ...dismissedAlerts, [alertKey]: true };
    setDismissedAlerts(newDismissed);
    localStorage.setItem('dismissedAlerts', JSON.stringify(newDismissed));
    toast.success("Alert dismissed for this month! 👍");
  };

  const formatMonthDisplay = (yyyyMm) => {
    const [year, month] = yyyyMm.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const displayMonthName = formatMonthDisplay(selectedMonth);
  const COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e'];

  let forecastData = [];
  if (chartData && chartData.trendChartData) {
    const last3Months = chartData.trendChartData.slice(-3);
    const sumLast3 = last3Months.reduce((acc, curr) => acc + curr.expense, 0);
    const predictedNextMonth = sumLast3 > 0 ? Math.round(sumLast3 / 3) : 0;
    
    const [yearStr, monthStr] = selectedMonth.split('-');
    const nextMonthDate = new Date(parseInt(yearStr), parseInt(monthStr), 1);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    forecastData = [
      ...last3Months.map(item => ({ name: item.month, Actual: item.expense, Forecast: null })),
      { name: `${monthNames[nextMonthDate.getMonth()]} (Pred)`, Actual: null, Forecast: predictedNextMonth }
    ];
  }

  return (
  <div>

    <style>{`
      .dashboard-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 20px;
      }

      .summary-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 15px;
        margin-bottom: 20px;
      }

      .chart-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 15px;
        margin-bottom: 20px;
      }

      @media (max-width: 768px) {
        .dashboard-top h2 {
          font-size: 20px !important;
        }

        .custom-dropdown-menu {
          width: 100% !important;
          right: auto !important;
          left: 0;
        }

        .card {
          padding: 15px !important;
        }
      }
    `}</style>

    {/* TOP */}
    <div className="dashboard-top">
      <div>
        <h2 style={{ fontWeight: '800' }}>
          Hi, {user?.name.split(' ')[0]} 👋
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Overview for {displayMonthName}
        </p>
      </div>

      {/* DROPDOWN */}
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          style={{
            padding: '8px 14px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            cursor: 'pointer'
          }}
        >
          📅 {displayMonthName}
        </button>

        <div className={`custom-dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
          {availableMonths.map(m => (
            <div
              key={m}
              className={`dropdown-item ${selectedMonth === m ? 'active' : ''}`}
              onClick={() => {
                setSelectedMonth(m);
                setIsDropdownOpen(false);
              }}
            >
              {formatMonthDisplay(m)}
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* ALERTS */}
    {insights?.alerts?.map((alert, index) => {
      const alertKey = `${selectedMonth}-${alert.type}`;
      if (dismissedAlerts[alertKey]) return null;

      return (
        <div key={index} className="card" style={{
          marginBottom: '10px',
          borderLeft: '4px solid #f59e0b'
        }}>
          <strong>{alert.title}</strong>
          <p style={{ fontSize: '13px' }}>{alert.message}</p>
          <button onClick={() => handleDismissAlert(alert.type)}>
            OK
          </button>
        </div>
      );
    })}

    {/* SUMMARY */}
    <div className="summary-container">
      <div className="card">
        <h4>Total Balance</h4>
        <h2>₹{chartData?.summary.balance || 0}</h2>
      </div>

      <div className="card">
        <h4>Income</h4>
        <h2>₹{chartData?.summary.totalIncome || 0}</h2>
      </div>

      <div className="card">
        <h4>Expense</h4>
        <h2>₹{chartData?.summary.totalExpense || 0}</h2>
      </div>

      <div className="card">
        <h4>Predicted</h4>
        <h2>₹{insights?.predictedExpense || 0}</h2>
      </div>
    </div>

    {/* PIE + BUDGET */}
    <div className="chart-row">
      <div className="card">
        <h3>Category Spending</h3>
        <div style={{ height: '250px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData?.pieChartData || []} dataKey="value">
                {(chartData?.pieChartData || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3>Top Budgets</h3>
        {budgets.map((b, i) => (
          <div key={i} style={{ marginBottom: '10px' }}>
            <strong>{b.category?.name}</strong>
            <div style={{
              height: '6px',
              background: '#eee',
              marginTop: '5px'
            }}>
              <div style={{
                width: `${(b.spentAmount / b.budgetAmount) * 100}%`,
                height: '100%',
                background: '#3b82f6'
              }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* BAR */}
    <div className="card">
      <h3>Income vs Expense</h3>
      <div style={{ height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData?.barChartData || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <RechartsTooltip />
            <Bar dataKey="income" fill="#10b981" />
            <Bar dataKey="expense" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* LINE + FORECAST */}
    <div className="chart-row">
      <div className="card">
        <h3>Trend</h3>
        <div style={{ height: '250px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData?.trendChartData || []}>
              <XAxis dataKey="month" />
              <YAxis />
              <RechartsTooltip />
              <Line dataKey="expense" stroke="#8b5cf6" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3>Forecast</h3>
        <div style={{ height: '250px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecastData}>
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Line dataKey="Actual" stroke="#3b82f6" />
              <Line dataKey="Forecast" stroke="#f59e0b" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>

  </div>
);
};

export default Dashboard;