const axios = require("axios");

// 🔥 COMMON EMAIL TEMPLATE
const generateTemplate = (title, content, color = "#3b82f6") => `
  <div style="font-family: Arial, sans-serif; background:#f5f7fb; padding:20px;">
    <div style="max-width:500px; margin:auto; background:white; padding:25px; border-radius:12px; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
      
      <h2 style="color:${color}; text-align:center; margin-bottom:20px;">
        ${title}
      </h2>

      ${content}

      <div style="text-align:center; margin-top:25px;">
        <a href="https://expense-wise-theta.vercel.app/dashboard"
          style="background:${color}; color:white; padding:12px 20px; border-radius:8px; text-decoration:none; font-weight:bold;">
          View Dashboard
        </a>
      </div>

      <p style="margin-top:20px; font-size:12px; color:#94a3b8; text-align:center;">
        ExpenseWise • Smart Financial Tracking
      </p>
    </div>
  </div>
`;


// 🔥 1. HISTORICAL OVERSPENDING EMAIL
exports.sendOverspendingEmail = async (userEmail, categoryName, spent, calculatedLimit) => {
  try {
    const amountOver = spent - calculatedLimit;

    const htmlContent = generateTemplate(
      "⚠️ Unusual Spending Detected",
      `
        <p style="font-size:15px; color:#334155;">
          You are spending more than usual in <b>${categoryName}</b>.
        </p>

        <div style="margin-top:15px; font-size:14px;">
          <p>💸 <b>Spent:</b> ₹${spent}</p>
          <p>📊 <b>Safe Limit:</b> ₹${calculatedLimit}</p>
          <p style="color:#ef4444;">🚨 <b>Over by:</b> ₹${amountOver}</p>
        </div>
      `,
      "#f59e0b"
    );

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "ExpenseWise",
          email: process.env.SENDER_EMAIL,
        },
        to: [{ email: userEmail }],
        subject: `⚠️ Unusual Spending Alert: ${categoryName}`,
        htmlContent,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          accept: "application/json",
        },
      }
    );

    console.log("EMAIL SENT");
  } catch (error) {
    console.error("EMAIL ERROR:", error.response?.data || error.message);
  }
};


// 🔥 2. BUDGET EXCEEDED EMAIL
exports.sendBudgetExceededEmail = async (userEmail, categoryName, spent, budgetLimit) => {
  try {
    const overspent = spent - budgetLimit;

    const htmlContent = generateTemplate(
      "🚨 Budget Limit Exceeded",
      `
        <p style="font-size:15px; color:#334155;">
          You have exceeded your budget for <b>${categoryName}</b>.
        </p>

        <div style="margin-top:15px; font-size:14px;">
          <p>📊 <b>Budget:</b> ₹${budgetLimit}</p>
          <p>💸 <b>Spent:</b> ₹${spent}</p>
          <p style="color:#ef4444;">🚨 <b>Overspent:</b> ₹${overspent}</p>
        </div>
      `,
      "#ef4444"
    );

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "ExpenseWise",
          email: process.env.SENDER_EMAIL,
        },
        to: [{ email: userEmail }],
        subject: `🚨 Budget Exceeded: ${categoryName}`,
        htmlContent,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          accept: "application/json",
        },
      }
    );

    console.log("EMAIL SENT");
  } catch (error) {
    console.error("EMAIL ERROR:", error.response?.data || error.message);
  }
};