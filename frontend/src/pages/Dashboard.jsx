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
      {/* --- RESPONSIVE CSS INJECTED HERE --- */}
      <style>{`
        .custom-dropdown-menu { position: absolute; top: 110%; right: 0; width: 220px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); z-index: 100; overflow: hidden; opacity: 0; visibility: hidden; transform: translateY(-10px); transition: 0.2s ease-in-out; }
        .custom-dropdown-menu.show { opacity: 1; visibility: visible; transform: translateY(0); }
        .dropdown-item { padding: 12px 20px; cursor: pointer; color: var(--text-main); font-weight: 500; transition: 0.2s; border-bottom: 1px solid var(--border-color); }
        .dropdown-item:last-child { border-bottom: none; }
        .dropdown-item:hover { background: var(--hover-bg); color: #3b82f6; }
        .dropdown-item.active { background: #eff6ff; color: #3b82f6; font-weight: 700; border-left: 4px solid #3b82f6; }
        [data-theme="dark"] .dropdown-item.active { background: #1e3a8a; }

        /* MOBILE RESPONSIVE RULES */
        @media (max-width: 768px) {
          .dash-header { flex-direction: column; align-items: flex-start !important; gap: 15px; }
          .summary-container { flex-direction: column; gap: 15px !important; }
          .summary-card { width: 100% !important; min-width: 100% !important; }
          .chart-row { flex-direction: column !important; }
          .chart-card { width: 100% !important; min-width: 100% !important; }
          .recharts-legend-wrapper { font-size: 12px !important; }
        }
      `}</style>

      {/* HEADER */}
      <div className="dash-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ color: 'var(--text-main)', fontSize: '28px', fontWeight: '800' }}>Hi, {user?.name.split(' ')[0]}! 👋</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Here is your financial overview for {displayMonthName}.</p>
        </div>

        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-card)', padding: '10px 20px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', cursor: 'pointer', color: 'var(--text-main)', fontSize: '15px', fontWeight: '700', transition: '0.2s' }}>
            <span style={{ fontSize: '18px' }}>📅</span>{displayMonthName}
            <span style={{ fontSize: '12px', marginLeft: '5px', color: 'var(--text-muted)', transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }}>▼</span>
          </button>
          <div className={`custom-dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
            {availableMonths.map(m => (
              <div key={m} className={`dropdown-item ${selectedMonth === m ? 'active' : ''}`} onClick={() => { setSelectedMonth(m); setIsDropdownOpen(false); }}>
                {formatMonthDisplay(m)}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* ALERTS */}
      {insights?.alerts && insights.alerts.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          {insights.alerts.map((alert, index) => {
            const alertKey = `${selectedMonth}-${alert.type}`;
            if (dismissedAlerts[alertKey]) return null;

            const isBudgetAlert = alert.type === 'BUDGET';
            const bgColor = isBudgetAlert ? '#fef2f2' : '#fffbeb';
            const borderColor = isBudgetAlert ? '#ef4444' : '#f59e0b';
            const textColor = isBudgetAlert ? '#991b1b' : '#b45309';

            return (
              <div key={index} style={{ background: bgColor, border: `1px solid ${borderColor}40`, borderLeft: `4px solid ${borderColor}`, padding: '15px 20px', borderRadius: '8px', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontSize: '24px' }}>{isBudgetAlert ? '🚨' : '📈'}</span>
                  <div>
                    <strong style={{ color: textColor, fontSize: '15px', display: 'block', marginBottom: '4px' }}>{alert.title}</strong>
                    <div style={{ color: textColor, fontSize: '14px', opacity: 0.9 }}>{alert.message}</div>
                  </div>
                </div>
                <button onClick={() => handleDismissAlert(alert.type)} style={{ background: borderColor, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>Okay, I understand</button>
              </div>
            )
          })}
        </div>
      )}

      {/* SUMMARY CARDS */}
      {/* INJECTED RESPONSIVE CSS FOR CARDS */}
      <style>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }
        .stat-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          padding: 24px;
          border-radius: 20px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.02);
          display: flex;
          flex-direction: column;
          justify-content: center;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.05);
        }
        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        .stat-icon {
          width: 45px;
          height: 45px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        }
        .stat-title {
          color: var(--text-muted);
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0;
        }
        .stat-value {
          font-size: 32px;
          font-weight: 800;
          color: var(--text-main);
          margin: 0;
          letter-spacing: -0.5px;
        }
        
        /* --- MOBILE RESPONSIVENESS --- */
        @media (max-width: 1024px) {
          /* Tablets: 2x2 Grid */
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          /* Phones: 2x2 Grid with compact padding */
          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .stat-card { padding: 15px; border-radius: 16px; }
          .stat-icon { width: 36px; height: 36px; font-size: 18px; border-radius: 10px; }
          .stat-title { font-size: 11px; }
          .stat-value { font-size: 20px; }
        }
      `}</style>

      {/* --- PREMIUM SUMMARY CARDS --- */}
      <div className="stats-grid">
        
        {/* Balance Card */}
        <div className="stat-card">
          <div className="stat-header">
            <h3 className="stat-title">Total Balance</h3>
            <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>👛</div>
          </div>
          <h2 className={`stat-value ${(chartData?.summary.balance || 0) >= 0 ? 'text-green' : 'text-red'}`}>
            ₹{(chartData?.summary.balance || 0).toLocaleString('en-IN')}
          </h2>
        </div>

        {/* Income Card */}
        <div className="stat-card">
          <div className="stat-header">
            <h3 className="stat-title">Total Income</h3>
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>📈</div>
          </div>
          <h2 className="stat-value text-green">
            ₹{(chartData?.summary.totalIncome || 0).toLocaleString('en-IN')}
          </h2>
        </div>

        {/* Expense Card */}
        <div className="stat-card">
          <div className="stat-header">
            <h3 className="stat-title">Total Expense</h3>
            <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>📉</div>
          </div>
          <h2 className="stat-value text-red">
            ₹{(chartData?.summary.totalExpense || 0).toLocaleString('en-IN')}
          </h2>
        </div>

        {/* Predicted Expense Card */}
        <div className="stat-card" style={{ background: 'var(--hover-bg)', borderStyle: 'dashed' }}>
          <div className="stat-header">
            <h3 className="stat-title">Predicted Exp.</h3>
            <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>🔮</div>
          </div>
          <h2 className="stat-value" style={{ color: 'var(--text-muted)' }}>
            ₹{insights ? insights.predictedExpense.toLocaleString('en-IN') : '0'}
          </h2>
        </div>

      </div>

      {/* CHARTS ROW 1 */}
      <div className="chart-row" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div className="card chart-card" style={{ flex: 1, minWidth: '350px' }}>
          <h3>🍩 Category Spending</h3>
          {chartData?.pieChartData && chartData.pieChartData.length > 0 ? (
            <div style={{ height: '300px', marginTop: '20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData.pieChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {chartData.pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip formatter={(value) => `₹${value}`} contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}/>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (<p style={{ marginTop: '20px', color: 'var(--text-muted)' }}>No expenses logged this month.</p>)}
        </div>

        <div className="card chart-card" style={{ flex: 1, minWidth: '350px' }}>
          <h3>🏆 Top Budgets</h3>
          <div style={{ marginTop: '20px', maxHeight: '300px', overflowY: 'auto', paddingRight: '10px' }}>
            {budgets.length === 0 ? <p style={{color: 'var(--text-muted)'}}>No budgets set for this month.</p> : null}
            {budgets.map((b, index) => {
              const percent = Math.min((b.spentAmount / b.budgetAmount) * 100, 100);
              const barColor = percent >= 100 ? '#ef4444' : percent >= 80 ? '#f59e0b' : '#3b82f6';
              const remaining = b.budgetAmount - b.spentAmount;

              return (
                <div key={index} style={{ marginBottom: '25px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '16px', color: 'var(--text-main)', textTransform: 'capitalize' }}>{b.category?.name}</strong>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '12px', background: percent >= 100 ? '#fef2f2' : '#eff6ff', color: percent >= 100 ? '#ef4444' : '#3b82f6' }}>{Math.round(percent)}% Used</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, backgroundColor: barColor, height: '100%', borderRadius: '4px' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '13px' }}>
                    <div><span style={{color: 'var(--text-muted)'}}>Spent:</span> <b style={{color: 'var(--text-main)'}}>₹{b.spentAmount}</b></div>
                    <div><span style={{color: 'var(--text-muted)'}}>Remaining:</span> <b style={{color: remaining >= 0 ? '#10b981' : '#ef4444'}}>₹{Math.abs(remaining)}</b></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BAR CHART */}
      <div className="card chart-card" style={{ marginBottom: '20px' }}>
        <h3>📊 Income vs Expense ({selectedMonth.split('-')[0]})</h3>
        <div style={{ height: '350px', marginTop: '20px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData?.barChartData || []} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <RechartsTooltip formatter={(value) => `₹${value}`} cursor={{fill: 'transparent'}} contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}/>
              <Legend />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LINE CHARTS */}
      <div className="chart-row" style={{ display: 'flex', gap: '20px' }}>
        
        <div className="card chart-card" style={{ flex: 1, minWidth: '350px' }}>
          <h3>📈 Spending Trend (Last 12 Months)</h3>
          <div style={{ height: '300px', marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData?.trendChartData || []} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <RechartsTooltip formatter={(value) => `₹${value}`} contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}/>
                <Line type="monotone" dataKey="expense" name="Expense" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card chart-card" style={{ flex: 1, minWidth: '350px' }}>
          <h3>🔮 Expense Forecast</h3>
          <p style={{fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px'}}>Based on your average spending over the last 3 months.</p>
          <div style={{ height: '260px', marginTop: '10px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <RechartsTooltip formatter={(value) => `₹${value}`} contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}/>
                <Legend />
                <Line type="monotone" dataKey="Actual" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Forecast" stroke="#f59e0b" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;