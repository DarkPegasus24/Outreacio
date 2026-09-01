const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const helmet = require('helmet');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Maximum recipients allowed per batch job to avoid runaway memory/abuse
const MAX_RECIPIENTS_LIMIT = 10000;

// Security & Middlewares
app.use(helmet({
    contentSecurityPolicy: false // Allow modern UI scripts/styles in dev & production
}));
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// In-Memory Active Jobs Store (zero disk persistence, ephemeral only)
const activeJobs = new Map();

// Session CSRF Token Store
const validCsrfTokens = new Set();

// Generate / retrieve CSRF token
app.get('/api/csrf-token', (req, res) => {
    const token = crypto.randomBytes(32).toString('hex');
    validCsrfTokens.add(token);
    // Auto-expire token after 2 hours
    setTimeout(() => validCsrfTokens.delete(token), 2 * 60 * 60 * 1000);
    res.json({ csrfToken: token });
});

// Middleware to validate CSRF token on modifying endpoints
function verifyCsrf(req, res, next) {
    const clientToken = req.headers['x-csrf-token'];
    if (!clientToken || !validCsrfTokens.has(clientToken)) {
        return res.status(403).json({ error: 'Invalid or expired CSRF token. Please refresh the page.' });
    }
    next();
}

// Basic email syntax validator
function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    return re.test(email.trim());
}

// Helper to create Gmail Nodemailer transporter (Gmail-Only)
function createGmailTransporter(user, pass) {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: user ? user.trim() : '',
            pass: pass ? pass.trim().replace(/\s+/g, '') : '' // Handles 16-char app passwords with or without spaces
        },
        tls: {
            rejectUnauthorized: false
        }
    });
}

// Helper to replace personalization placeholders
function personalizeContent(template, recipient) {
    if (!template) return '';
    let content = template;
    const company = recipient.companyName || recipient.company || recipient.name || '';
    const email = recipient.email || '';

    content = content.replace(/\{\{\s*company\s*name\s*\}\}/gi, company);
    content = content.replace(/\{\{\s*company\s*\}\}/gi, company);
    content = content.replace(/\{\{\s*name\s*\}\}/gi, company);
    content = content.replace(/\{\{\s*email\s*\}\}/gi, email);

    // Support any custom dynamic attributes passed in recipient object
    Object.keys(recipient).forEach(key => {
        const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'gi');
        content = content.replace(regex, recipient[key] || '');
    });

    return content;
}

// 1. Verify Gmail Credentials (supports both /api/verify-smtp and /api/test-smtp)
const handleVerifyGmail = async (req, res) => {
    const smtpConfig = req.body.smtpConfig || req.body;
    const user = smtpConfig.user || smtpConfig.email;
    const pass = smtpConfig.pass || smtpConfig.appPassword;

    if (!user || !pass) {
        return res.status(400).json({
            success: false,
            message: 'Gmail address and 16-character App Password are required.'
        });
    }

    try {
        const transporter = createGmailTransporter(user, pass);
        await transporter.verify();
        res.json({
            success: true,
            message: 'Gmail connection verified successfully!'
        });
    } catch (error) {
        let errorHint = error.message;
        if (error.code === 'EAUTH' || error.responseCode === 535) {
            errorHint = 'Authentication failed. Please ensure 2-Step Verification is enabled in your Google Account and you are using a generated 16-character App Password (myaccount.google.com/apppasswords), NOT your normal Gmail password.';
        } else if (error.code === 'ESOCKET' || error.code === 'ETIMEDOUT') {
            errorHint = 'Connection timed out while reaching Gmail SMTP servers. Please check your internet connection and firewall settings.';
        }

        res.status(400).json({
            success: false,
            message: errorHint,
            rawError: error.message
        });
    }
};

app.post('/api/verify-smtp', verifyCsrf, handleVerifyGmail);
app.post('/api/test-smtp', verifyCsrf, handleVerifyGmail);

// 2. Start Bulk Send Batch Job
app.post('/api/send-batch', verifyCsrf, async (req, res) => {
    const {
        smtpConfig,
        senderName,
        senderEmail,
        replyTo,
        subject,
        bodyHtml,
        recipients,
        throttleDelayMs = 2000
    } = req.body;

    const user = smtpConfig?.user || smtpConfig?.email || senderEmail;
    const pass = smtpConfig?.pass || smtpConfig?.appPassword;

    if (!user || !pass) {
        return res.status(400).json({ error: 'Missing Gmail credentials (email and App Password required).' });
    }

    if (!subject || !bodyHtml) {
        return res.status(400).json({ error: 'Email Subject and Body are required.' });
    }

    if (!Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({ error: 'Recipients list is empty.' });
    }

    if (recipients.length > MAX_RECIPIENTS_LIMIT) {
        return res.status(400).json({
            error: `Recipients list exceeds maximum allowable limit of ${MAX_RECIPIENTS_LIMIT.toLocaleString()} per batch.`
        });
    }

    // Clamp throttle delay: between 200ms and 15000ms (default 2000ms)
    const delay = Math.max(200, Math.min(15000, parseInt(throttleDelayMs, 10) || 2000));
    const jobId = crypto.randomUUID();

    const job = {
        id: jobId,
        status: 'running',
        total: recipients.length,
        sent: 0,
        failed: 0,
        currentIndex: 0,
        logs: [],
        clients: new Set(),
        aborted: false,
        startedAt: new Date().toISOString(),
        completedAt: null
    };

    activeJobs.set(jobId, job);

    // Start background processing
    processJob(jobId, {
        smtpConfig,
        senderName,
        senderEmail: senderEmail || smtpConfig.user,
        replyTo: replyTo || senderEmail || smtpConfig.user,
        subject,
        bodyHtml,
        recipients,
        delay
    });

    res.json({
        success: true,
        jobId,
        total: recipients.length,
        message: 'Campaign batch job started.'
    });
});

// Function to stream event updates to SSE subscribers
function broadcastJobUpdate(job, eventType, data) {
    const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of job.clients) {
        try {
            client.write(payload);
        } catch (e) {
            job.clients.delete(client);
        }
    }
}

// Background Batch Job Worker
async function processJob(jobId, config) {
    const job = activeJobs.get(jobId);
    if (!job) return;

    const { smtpConfig, senderName, senderEmail, replyTo, subject, bodyHtml, recipients, delay } = config;
    let transporter;

    try {
        const user = smtpConfig?.user || smtpConfig?.email || senderEmail;
        const pass = smtpConfig?.pass || smtpConfig?.appPassword;
        transporter = createGmailTransporter(user, pass);
    } catch (err) {
        job.status = 'error';
        job.completedAt = new Date().toISOString();
        broadcastJobUpdate(job, 'job_error', { error: `Failed to initialize Gmail transporter: ${err.message}` });
        return;
    }

    const fromAddress = senderName ? `"${senderName}" <${senderEmail}>` : senderEmail;

    for (let i = 0; i < recipients.length; i++) {
        if (job.aborted) {
            job.status = 'cancelled';
            job.completedAt = new Date().toISOString();
            broadcastJobUpdate(job, 'job_cancelled', {
                sent: job.sent,
                failed: job.failed,
                total: job.total,
                message: 'Campaign sending was stopped by user.'
            });
            break;
        }

        const item = recipients[i];
        job.currentIndex = i + 1;
        const targetEmail = (item.email || '').trim();
        const companyName = (item.companyName || item.company || '').trim();

        const logEntry = {
            index: i + 1,
            companyName: companyName || '—',
            email: targetEmail,
            timestamp: new Date().toLocaleTimeString(),
            status: 'pending',
            details: ''
        };

        if (!isValidEmail(targetEmail)) {
            logEntry.status = 'failed';
            logEntry.details = 'Invalid email address syntax';
            job.failed++;
            job.logs.push(logEntry);
            broadcastJobUpdate(job, 'progress', {
                currentIndex: i + 1,
                sent: job.sent,
                failed: job.failed,
                total: job.total,
                latestLog: logEntry
            });
            continue;
        }

        const personalizedSubject = personalizeContent(subject, item);
        const personalizedHtml = personalizeContent(bodyHtml, item);

        const mailOptions = {
            from: fromAddress,
            to: targetEmail,
            replyTo: replyTo,
            subject: personalizedSubject,
            html: personalizedHtml,
            text: personalizedHtml.replace(/<[^>]*>?/gm, '') // Plain text fallback
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            logEntry.status = 'success';
            logEntry.details = `Delivered (ID: ${info.messageId || 'OK'})`;
            job.sent++;
        } catch (sendErr) {
            logEntry.status = 'failed';
            logEntry.details = sendErr.message || 'SMTP delivery rejected';
            job.failed++;
        }

        job.logs.push(logEntry);
        broadcastJobUpdate(job, 'progress', {
            currentIndex: i + 1,
            sent: job.sent,
            failed: job.failed,
            total: job.total,
            latestLog: logEntry
        });

        // Throttle delay between consecutive emails
        if (i < recipients.length - 1 && !job.aborted && delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    if (!job.aborted) {
        job.status = 'completed';
        job.completedAt = new Date().toISOString();
        broadcastJobUpdate(job, 'job_completed', {
            sent: job.sent,
            failed: job.failed,
            total: job.total,
            completedAt: job.completedAt
        });
    }

    // Keep job in memory for 15 minutes to allow clients to view final stats, then purge from RAM
    setTimeout(() => {
        activeJobs.delete(jobId);
    }, 15 * 60 * 1000);
}

// 3. SSE Stream Endpoint for Live Job Progress
app.get('/api/job-stream/:jobId', (req, res) => {
    const { jobId } = req.params;
    const job = activeJobs.get(jobId);

    if (!job) {
        return res.status(404).json({ error: 'Job not found or already expired.' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    job.clients.add(res);

    // Send initial snapshot
    const initialData = {
        jobId: job.id,
        status: job.status,
        total: job.total,
        sent: job.sent,
        failed: job.failed,
        currentIndex: job.currentIndex,
        logs: job.logs
    };
    res.write(`event: snapshot\ndata: ${JSON.stringify(initialData)}\n\n`);

    req.on('close', () => {
        job.clients.delete(res);
    });
});

// 4. Cancel active send job
app.post('/api/job-cancel/:jobId', verifyCsrf, (req, res) => {
    const { jobId } = req.params;
    const job = activeJobs.get(jobId);

    if (!job) {
        return res.status(404).json({ error: 'Job not found or already finished.' });
    }

    job.aborted = true;
    res.json({ success: true, message: 'Job cancellation requested.' });
});

// Serve frontend in production build if outreacio-frontend/dist exists
const clientDist = path.join(__dirname, '..', 'outreacio-frontend', 'dist');
app.use(express.static(clientDist));
app.use((req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    const indexHtml = path.join(clientDist, 'index.html');
    res.sendFile(indexHtml, err => {
        if (err) {
            res.status(200).send('Outreacio Backend API is running. Build outreacio-frontend to view the web dashboard.');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Outreacio Backend API listening on http://localhost:${PORT}`);
});
