# Outreacio

A bulk email automation application for sending personalized emails through a Gmail or Google Workspace account.

---

## What It Does

- **Flexible List Upload:** Upload a recipient list as an Excel file (.xlsx or .xls). Any column layout works — Outreacio automatically detects which column contains email addresses and which contains company names. Rows without a valid email are skipped automatically.
- **Gmail Integration:** Connect your Gmail account using a Google App Password with connection verification before sending.
- **Dynamic Personalization:** Use `{{Company Name}}` and `{{Email}}` placeholder tags to personalize each outgoing email.
- **Configurable Rate Limiting:** Adjustable throttle delay between consecutive emails to maintain deliverability standards.
- **Real-Time Monitoring:** Live progress tracking with sent and failure counters, server-sent events stream, and exportable reports.
- **In-Memory Credential Handling:** Credentials are held in memory during the active session and are never written to disk or persistent storage.

---

## Gmail Setup

1. **Enable 2-Step Verification:**
   - Open your Google Account settings at [myaccount.google.com](https://myaccount.google.com).
   - Navigate to **Security** and enable **2-Step Verification**.

2. **Generate an App Password:**
   - Visit [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
   - Create a 16-character App Password (for example, `abcd efgh ijkl mnop`).
   - Copy the generated 16-character password.

3. **Connect in Outreacio:**
   - Enter your Gmail address and paste the 16-character App Password.
   - Click **Test Gmail Connection** to verify credentials before proceeding.

---

## Quick Start

### 1. Install All Dependencies

```bash
npm run install-all
```

### 2. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Project Structure

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

MIT - Outreacio 1.0.0
