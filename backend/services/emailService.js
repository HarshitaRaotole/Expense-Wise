const axios = require("axios");

// 🔥 1. HISTORICAL OVERSPENDING EMAIL
exports.sendOverspendingEmail = async (userEmail, categoryName, spent, calculatedLimit) => {
  try {
    const amountOver = spent - calculatedLimit; // ✅ fixed

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "ExpenseWise",
          email: process.env.SENDER_EMAIL,
        },
        to: [{ email: userEmail }],
        subject: `⚠️ Unusual Spending Alert: ${categoryName}`,
        htmlContent: `
          <h2>📈 Unusual Spending Detected</h2>
          <p>You are overspending in <b>${categoryName}</b></p>
          <p>Spent: ₹${spent}</p>
          <p>Safe Limit: ₹${calculatedLimit}</p>
          <p>Over by: ₹${amountOver}</p>
          <a href="https://expense-wise-theta.vercel.app/dashboard">Go to Dashboard</a>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          "accept": "application/json",
        },
      }
    );

    console.log("EMAIL SENT:", response.data);
  } catch (error) {
    console.error("EMAIL ERROR:", error.response?.data || error.message);
  }
};


// 🔥 2. BUDGET EXCEEDED EMAIL
exports.sendBudgetExceededEmail = async (userEmail, categoryName, spent, budgetLimit) => {
  try {
    const overspent = spent - budgetLimit;

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "ExpenseWise",
          email: process.env.SENDER_EMAIL,
        },
        to: [{ email: userEmail }],
        subject: `🚨 Budget Exceeded: ${categoryName}`,
        htmlContent: `
          <h2>🚨 Budget Exceeded</h2>
          <p>Category: <b>${categoryName}</b></p>
          <p>Budget: ₹${budgetLimit}</p>
          <p>Spent: ₹${spent}</p>
          <p style="color:red;">Overspent: ₹${overspent}</p>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          "accept": "application/json",
        },
      }
    );

    console.log("EMAIL SENT:", response.data);
  } catch (error) {
    console.error("EMAIL ERROR:", error.response?.data || error.message);
  }
};