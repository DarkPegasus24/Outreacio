# Outreacio

> **Smart Bulk Email Outreach Platform** — Send personalized, high-deliverability email campaigns directly through Gmail and Google Workspace with real-time tracking, live pacing, and zero data retention.

[![Live App](https://img.shields.io/badge/Frontend-Vercel-black?style=for-the-badge&logo=vercel)](https://outreacio.vercel.app)
[![Backend API](https://img.shields.io/badge/Backend-Fly.io-24185b?style=for-the-badge&logo=flydotio)](https://outreacio-backend.fly.dev)
[![Database & Auth](https://img.shields.io/badge/Auth%20%26%20DB-Supabase-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg?style=for-the-badge)](./LICENSE)

---

## 🌟 Key Features

- **🚀 Flexible Recipient Import:**
  - Drag-and-drop Excel (`.xlsx`, `.xls`) or CSV files, or paste raw emails.
  - Automatic column detection for email addresses, contact names, and company names.
  - Built-in syntax validation and duplicate filtering before sending.

- **🔒 Secure Gmail & Google Workspace Connection:**
  - Connect your Gmail using a 16-character Google App Password with TLS 1.3 encryption.
  - **Zero Disk Storage:** Credentials are held securely in volatile memory during the active session only and are never saved to disk or databases.
  - 1-click connection verification before launching any campaign.

- **✨ Dynamic Personalization:**
  - Inject recipient tags automatically: `{{Name}}`, `{{Company Name}}`, and custom columns.
  - Rich HTML email editor with attachment support.

- **⏱️ Smart Deliverability Pacing & Real-Time Tracking:**
  - Configurable throttle delay (e.g. 2.0s–3.0s pacing) to stay safely within Google's sending limits.
  - Live **Server-Sent Events (SSE)** progress stream showing real-time sent/failed counters, delivery latency, and logs.
  - Exportable delivery reports (CSV).

- **💳 Tiered Plans & Manual UPI Payment Verification:**
  - **Free Tier:** 25 emails / day, 1 connected inbox.
  - **Paid Plan ($4.99 / mo ~ ₹425 INR):** 150 emails / day, unlimited inboxes, priority queue, automated live exchange rate sync.
  - Seamless UPI payment proof workflow (UTR reference & payment screenshot upload).

- **🛡️ Secure Admin Portal (`/8bytestudio`):**
  - Protected admin console with `localStorage` credential persistence and cold-start retry handling.
  - Review UPI payments (Approve/Reject with automated customer email receipts).
  - Manage incoming contact messages and inquiries.

- **🎨 Parley Design Aesthetics & Smooth Experience:**
  - Custom capsule navigation bar with concave SVG curves and responsive mobile drawer.
  - High-performance smooth scrolling powered by **Lenis**.
  - Dynamic user-state awareness (seamless transition from *"Get started free"* to *"Go to Dashboard"*).
  - Light/Dark theme switching with persistent preferences.

---

## 🏗️ Architecture & Tech Stack

```
                     ┌──────────────────────────────────────────────┐
                     │          Vercel Production Edge              │
                     │       https://outreacio.vercel.app           │
                     │  (React 18 + Vite + Context + Lenis Scroll)  │
                     └──────────────────────┬───────────────────────┘
                                            │
                                            │ HTTPS / SSE API Calls
                                            │ (VITE_API_BASE_URL)
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │           Fly.io Docker Container            │
                     │     https://outreacio-backend.fly.dev        │
                     │  (Node.js 20 + Express + Nodemailer + SSE)   │
                     └──────────────┬───────────────────────────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
┌───────────────────────────────────┐   ┌───────────────────────────┐
│        Supabase Cloud             │   │       Google SMTP         │
│  - User Authentication (OAuth)    │   │  - Gmail App Password     │
│  - Campaign History Storage       │   │  - TLS 1.3 Safe Delivery  │
│  - Payment Submissions & Inquiries│   │  - Real-Time Dispatch     │
└───────────────────────────────────┘   └───────────────────────────┘
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js** >= 18.x
- **npm** >= 9.x
- A free **Supabase** project
- A **Gmail / Google Workspace** account with 2-Step Verification enabled

### 2. Clone & Install Dependencies

```bash
git clone https://github.com/DarkPegasus24/Outreacio.git
cd Outreacio

# Install root, backend, and frontend dependencies
npm run install-all
```

### 3. Environment Variables Configuration

#### Backend Configuration (`outreacio-backend/.env`):
```env
PORT=5000
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
JWT_SECRET=your-secure-jwt-session-secret-2026
ADMIN_SECRET_KEY=8bytestudio
ADMIN_EMAILS=admin@yourcompany.com
```

#### Frontend Configuration (`outreacio-frontend/.env`):
```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_BASE_URL=https://outreacio-backend.fly.dev
```
*(For purely local development, you can point `VITE_API_BASE_URL` to `http://localhost:5000`)*

### 4. Run Locally

```bash
# Runs both backend (:5000) and frontend (:5173) concurrently
npm run dev
```

- **Frontend App:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **Admin Portal:** [http://localhost:5173/8bytestudio](http://localhost:5173/8bytestudio)

---

## 📧 Gmail App Password Setup

To dispatch emails from your Gmail account without exposing your master account password:

1. Go to **Google Account Settings** → **Security** ([myaccount.google.com/security](https://myaccount.google.com/security)).
2. Turn ON **2-Step Verification**.
3. Visit **App Passwords** ([myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)).
4. Create an app named **Outreacio** and generate a 16-character App Password (e.g., `abcd efgh ijkl mnop`).
5. Enter your Gmail address and paste the 16-character password into Outreacio.
6. Click **Test Gmail Connection** to verify.

---

## 📂 Project Structure

```
Outreacio/
├── outreacio-frontend/               # Client Web Application (Vite + React)
│   ├── src/
│   │   ├── api/
│   │   │   ├── config.js             # Centralized API Base URL & URL resolver
│   │   │   └── planService.js        # Auth, plan, payment & contact API helpers
│   │   ├── components/
│   │   │   ├── Header.jsx            # Dynamic capsule navbar & mobile drawer
│   │   │   ├── LandingPage.jsx       # Parley-inspired hero & feature showcases
│   │   │   ├── PricingPage.jsx       # Interactive plans & currency switcher
│   │   │   ├── UpgradeModal.jsx      # UPI payment submission modal (Portal)
│   │   │   ├── AdminPaymentsPage.jsx # Admin review console (/8bytestudio)
│   │   │   ├── SmtpConfigCard.jsx    # Gmail SMTP test & connect card
│   │   │   ├── RecipientManager.jsx  # CSV/Excel parser & validation table
│   │   │   ├── EmailComposer.jsx     # Template & dynamic tag editor
│   │   │   ├── CampaignMonitor.jsx   # Live SSE monitoring & logs
│   │   │   ├── CampaignHistory.jsx   # Supabase-persisted history records
│   │   │   └── ContactPage.jsx       # Inquiries & message submissions
│   │   ├── context/
│   │   │   └── ThemeContext.jsx      # Dark/Light mode provider
│   │   ├── hooks/
│   │   │   └── useExchangeRate.js    # Live USD/INR daily exchange sync
│   │   ├── App.jsx                   # Main routing & state controller
│   │   └── index.css                 # Global design system & theme tokens
│   ├── vercel.json                   # Vercel proxy & SPA route rewrites
│   └── package.json
│
├── outreacio-backend/                # Server API (Node.js + Express)
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── paymentController.js  # UPI submission & admin approval logic
│   │   │   └── contactController.js  # Contact inquiry management
│   │   └── services/
│   │       └── emailService.js       # Nodemailer worker & receipt dispatcher
│   ├── fly.toml                      # Fly.io cloud deployment configuration
│   ├── Dockerfile                    # Containerization definition
│   ├── server.js                     # Express server & SSE job dispatcher
│   ├── supabaseClient.js             # Supabase Admin SDK initialization
│   └── package.json
│
├── package.json                      # Workspace root scripts
├── CONTRIBUTING.md                   # Contribution guidelines
├── SECURITY.md                       # Security & vulnerability reporting
└── README.md                         # Project documentation
```

---

## 🚢 Deployment

### Frontend (Vercel)
The frontend is configured for automatic deployment via Git:
1. Connect your repository to **Vercel**.
2. Set root directory to `./outreacio-frontend` (or leave default with root package.json).
3. Set environment variable: `VITE_API_BASE_URL=https://outreacio-backend.fly.dev`.
4. Deploy!

### Backend (Fly.io)
Deploy the containerized backend using the Fly CLI:
```bash
cd outreacio-backend
fly launch    # First time setup
fly deploy    # Subsequent updates
```
Set production secrets:
```bash
fly secrets set SUPABASE_URL=... SUPABASE_ANON_KEY=... JWT_SECRET=... ADMIN_SECRET_KEY=8bytestudio
```

---

## 🔒 Security & Privacy

- **No Password Persistence:** Gmail App Passwords are only held in ephemeral server memory during an active send batch.
- **CSRF Protection:** Critical write operations require custom CSRF tokens.
- **Rate Limiting:** Protects your domain and inbox reputation with deliberate batch throttling.
- See [SECURITY.md](./SECURITY.md) for vulnerability reporting.

---

## 🤝 Contributing

Contributions are welcome! Please check out [CONTRIBUTING.md](./CONTRIBUTING.md) for code standards and workflow instructions.

---

## 📄 License

Distributed under the **MIT License**. Copyright &copy; 2026 **8ByteStudio**. See [LICENSE](./LICENSE) for more details.
