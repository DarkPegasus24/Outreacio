# Outreacio — Simple Bulk Email Sender

**Outreacio** sends personalized bulk emails directly through your **Gmail or Google Workspace** account. No complex setup. No copy-paste. Just fast, smart cold outreach.

---

## ⚡ What It Does
- ✅ **Easy List Upload:** Drag-and-drop your CSV or copy-paste emails. We automatically check them for formatting and validity.
- ✅ **30-Second Gmail Setup:** Connect your Gmail with a Google App Password. One click tests that everything works.
- ✅ **Personal Touch:** Use `{{Company Name}}` and `{{Email}}` tags so every message feels custom-written.
- ✅ **Safe Speed Control:** Built-in speed slider (2–3 seconds per email) protects your inbox from spam flags.
- ✅ **Live Delivery Tracker:** Watch emails send live with real-time counters and download a CSV report when done.
- ✅ **100% Secure:** Your password is only used while sending and is never saved to disk or database.

---

## 📧 Gmail Setup (Takes 2 Minutes)

1. **Enable 2-Step Verification:**
   - Open your Google Account: [myaccount.google.com](https://myaccount.google.com)
   - Go to **Security** &rarr; turn ON **2-Step Verification**.

2. **Create an App Password:**
   - Visit: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Generate a 16-character password (e.g., `abcd efgh ijkl mnop`).
   - Copy this 16-character password.

3. **Paste in Outreacio:**
   - Enter your Gmail address and paste the 16-char App Password.
   - Click **"Test Gmail"** &bull; ready to send!

---

## 🚀 Quick Start

### 1. Install All Dependencies
```bash
npm run install-all
```

### 2. Run Locally
```bash
npm run dev
```

Open **`http://localhost:5173`** in your browser.

---

## 📁 Clean Structure

```
outreacio/
├── outreacio-frontend/     # React + Vite Dashboard & Landing Page
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── SmtpConfigCard.jsx (Gmail Setup)
│   │   │   ├── RecipientManager.jsx
│   │   │   ├── EmailComposer.jsx
│   │   │   ├── CampaignMonitor.jsx
│   │   │   ├── FaqSection.jsx
│   │   │   ├── CtaBannerSection.jsx
│   │   │   ├── ContactPage.jsx
│   │   │   └── LandingPage.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
│
├── outreacio-backend/      # Node.js + Express API
│   ├── server.js
│   └── package.json
│
├── package.json            # Root Scripts
└── README.md
```

---

## License
MIT &bull; Outreacio 1.0.0
