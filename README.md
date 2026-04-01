# 💸 Smart Expense Tracker (ExpenseWise)

<!-- ![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge&logo=mongodb)
![React](https://img.shields.io/badge/Frontend-React.js-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) -->

## 📖 Project Overview
The Smart Expense Tracker is a full-stack, intelligent web application designed to help users take total control of their finances. Moving beyond a basic income/expense ledger, this system acts as a proactive financial assistant. 

It provides users with deep visual analytics, strict category-based budgeting, and an AI-driven background engine that analyzes 90-day historical spending patterns to automatically alert users via email when unusual financial behavior is detected.

### ✨ Core Functionalities & Advanced Features
- **Intelligent Financial Insights:** The backend calculates predicted end-of-month expenses and detects unusual spending patterns using dynamic 40% historical thresholds.
- **Proactive Email Alert System:** Utilizes an Event-Driven architecture via Nodemailer/Brevo. When a user logs a transaction that breaks a budget or historical limit, the system instantly dispatches a beautifully formatted warning email in the background.
- **Advanced Data Visualization:** Uses **MongoDB Aggregation Pipelines** (`$match`, `$group`, `$lookup`) to securely and efficiently crunch massive datasets on the database layer before rendering them via interactive **Recharts** (Pie, Bar, and 12-Month Trend Line charts).
- **Enterprise-Grade Security:** Implemented a stateless JWT authentication flow utilizing `HTTPOnly` cookies to eliminate XSS vulnerabilities, coupled with a secure Email Verification onboarding process and a 15-minute auto-logout session handler.
- **Premium UI/UX:** A fully responsive, mobile-first design featuring an interactive Data Grid (with instant frontend filtering/sorting), a custom off-canvas Sidebar, and a seamless global Light/Dark Mode toggle driven by CSS variables.

---

## 🛠️ Technology Stack
* **Frontend:** React.js, React Router, Recharts (Data Visualization), React-Hot-Toast
* **Backend:** Node.js, Express.js, JSON Web Tokens (JWT), Nodemailer (Brevo SMTP)
* **Database:** MongoDB Atlas, Mongoose (ODM)
* **Security:** bcrypt (Password Hashing), HTTPOnly Cookies

---

## 🚀 Setup Instructions (Local Development)

Follow these steps to run the application locally on your machine.

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/smart-expense-tracker.git
cd smart-expense-tracker