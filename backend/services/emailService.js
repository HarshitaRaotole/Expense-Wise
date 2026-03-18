const nodemailer = require('nodemailer');
require('dotenv').config(); 

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS
  }
});

// 1. HISTORICAL OVERSPENDING EMAIL (Explaining the 40% Threshold)
exports.sendOverspendingEmail = async (userEmail, categoryName, spent, calculatedLimit) => {
  const amountOver = spent - calculatedLimit;
  
  try {
    const mailOptions = {
      from: `"ExpenseWise Alerts" <${process.env.SENDER_EMAIL}>`,
      to: userEmail,
      subject: `⚠️ Unusual Spending Alert: ${categoryName}`,
      html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 25px; text-align: center;">
          <h2 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">📈 Unusual Spending Detected</h2>
        </div>
        
        <!-- Body -->
        <div style="padding: 30px; color: #374151; background: #ffffff;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi there,</p>
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Our engine has detected that you are spending significantly more on <strong style="text-transform: capitalize; color: #1e293b;">${categoryName}</strong> this month compared to your normal habits.
          </p>
          
          <!-- Data Box -->
          <div style="background: #fffbeb; border: 1px solid #fde68a; border-left: 5px solid #f59e0b; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            
            <p style="margin: 0 0 10px 0; font-size: 15px;">
              <span style="color: #64748b;">Your Calculated Safe Limit:</span><br/>
              <strong style="font-size: 18px; color: #1e293b;">₹${calculatedLimit}</strong>
            </p>
            
            <p style="margin: 0 0 10px 0; font-size: 15px;">
              <span style="color: #64748b;">What you spent this month:</span><br/>
              <strong style="font-size: 18px; color: #ef4444;">₹${spent}</strong>
            </p>
            
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #fde68a;">
              <p style="margin: 0; font-size: 14px; color: #b45309; font-weight: 600;">
                You are currently ₹${amountOver} over your usual pattern!
              </p>
            </div>
            
          </div>
          
          <!-- Explanation Box -->
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px dashed #cbd5e1; margin-bottom: 30px;">
            <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
              <strong>💡 How did we calculate this?</strong><br/>
              We looked at your average spending for this category over the last 3 months and added a <strong>40% safe buffer</strong>. Your current spending has broken through that safe buffer!
            </p>
          </div>
          
          <!-- Call to Action -->
          <div style="text-align: center;">
            <a href="https://expense-wise-theta.vercel.app/dashboard" style="background: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.25); transition: background 0.3s;">
              Review Your Dashboard
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
          <strong>ExpenseWise</strong><br/>
          Your Smart Financial Assistant
        </div>

      </div>
      `
    };
   await transporter.verify();
console.log("SMTP connection successful");

const info = await transporter.sendMail(mailOptions);
console.log("EMAIL RESPONSE:", info);
  } catch (error) { 
    console.error('FULL EMAIL ERROR:', error);
  }
};

// 2. STRICT BUDGET EXCEEDED EMAIL
exports.sendBudgetExceededEmail = async (userEmail, categoryName, spent, budgetLimit) => {
  const overspent = spent - budgetLimit;
  try {
    const mailOptions = {
      from: `"ExpenseWise Alerts" <${process.env.SENDER_EMAIL}>`,
      to: userEmail,
      subject: `🚨 Budget Exceeded: ${categoryName}`,
      html: `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; border:1px solid #e5e7eb; border-radius:10px; overflow:hidden">
        <div style="background:#ef4444; color:white; padding:20px; text-align:center">
          <h2>🚨 Budget Limit Exceeded</h2>
        </div>
        <div style="padding:25px">
          <p>You have surpassed the monthly budget you set for <b>${categoryName}</b>.</p>
          <div style="background:#f9fafb; padding:15px; border-radius:8px; margin:15px 0">
            <p><b>Your Set Budget:</b> ₹${budgetLimit}</p>
            <p><b>Current Spent:</b> ₹${spent}</p>
            <p style="color:#ef4444"><b>Overspent By:</b> ₹${overspent}</p>
          </div>
        </div>
      </div>
      `
    };
    await transporter.verify();
console.log("SMTP connection successful");

const info = await transporter.sendMail(mailOptions);
console.log("EMAIL RESPONSE:", info);
  } catch (error) { console.error('FULL EMAIL ERROR:', error); }
};