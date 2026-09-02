require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const helmet = require('helmet');
const crypto = require('crypto');
const path = require('path');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const supabase = require('./supabaseClient');

const app = express();
const PORT = process.env.PORT || 5000;

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'outreacio-jwt-session-secret-default-2026';

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
app.use(cookieParser());
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

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

// Middleware to verify the logged-in Supabase user from the Authorization header.
// Ensures every user only ever sees/modifies their OWN data, never another user's.
async function requireSupabaseUser(req, res, next) {
    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

        if (!token) {
            return res.status(401).json({ error: 'Not authenticated. Please sign in again.' });
        }

        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data?.user) {
            return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
        }

        req.userId = data.user.id;
        req.userEmail = data.user.email;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Authentication check failed.' });
    }
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
app.post('/api/send-batch', verifyCsrf, requireSupabaseUser, async (req, res) => {
    const {
        smtpConfig,
        senderName,
        senderEmail,
        replyTo,
        subject,
        bodyHtml,
        recipients,
        throttleDelayMs,
        attachments
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

    // Validate attachments if provided (must not exceed 20MB total decoded size)
    let validatedAttachments = [];
    if (attachments !== undefined && attachments !== null) {
        if (!Array.isArray(attachments)) {
            return res.status(400).json({ error: 'Attachments must be an array.' });
        }
        let totalAttachmentBytes = 0;
        for (const att of attachments) {
            if (!att.filename || typeof att.filename !== 'string' || !att.content || typeof att.content !== 'string') {
                return res.status(400).json({ error: 'Each attachment must have a valid filename and base64 content.' });
            }
            const approxBytes = Math.ceil((att.content.length * 3) / 4);
            totalAttachmentBytes += approxBytes;
        }
        if (totalAttachmentBytes > 20 * 1024 * 1024) {
            return res.status(400).json({ error: 'Total attachment size exceeds maximum allowable limit of 20MB.' });
        }
        validatedAttachments = attachments.map(att => ({
            filename: String(att.filename),
            contentType: att.contentType ? String(att.contentType) : 'application/octet-stream',
            content: String(att.content)
        }));
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
        completedAt: null,
        userId: req.userId,
        userEmail: req.userEmail
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
        delay,
        attachments: validatedAttachments
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

    const { smtpConfig, senderName, senderEmail, replyTo, subject, bodyHtml, recipients, delay, attachments } = config;
    let transporter;

    try {
        const user = smtpConfig?.user || smtpConfig?.email || senderEmail;
        const pass = smtpConfig?.pass || smtpConfig?.appPassword;
        transporter = createGmailTransporter(user, pass);
    } catch (err) {
        job.status = 'error';
        job.completedAt = new Date().toISOString();
        broadcastJobUpdate(job, 'job_error', { error: `Failed to initialize Gmail transporter: ${err.message}` });
        recordCampaignHistory(job, config);
        return;
    }

    const fromAddress = senderName ? `"${senderName}" <${senderEmail}>` : senderEmail;

    // Prepare Nodemailer attachment array if present
    const mailAttachments = (Array.isArray(attachments) && attachments.length > 0)
        ? attachments.map(a => ({
            filename: a.filename,
            content: Buffer.from(a.content, 'base64'),
            encoding: 'base64',
            contentType: a.contentType
        }))
        : null;

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

        if (mailAttachments && mailAttachments.length > 0) {
            mailOptions.attachments = mailAttachments;
        }

        try {
            await transporter.sendMail(mailOptions);
            logEntry.status = 'success';
            logEntry.details = 'Email delivered successfully';
            job.sent++;
        } catch (sendErr) {
            logEntry.status = 'failed';
            let errMsg = (sendErr.message || 'SMTP delivery rejected').trim();
            if (/recipient.+not found|user unknown|mailbox unavailable|550/i.test(errMsg)) {
                errMsg = "Recipient's mailbox not found or invalid";
            } else if (/authentication|invalid credentials|username and password not accepted|535/i.test(errMsg)) {
                errMsg = 'Gmail authentication rejected';
            } else if (/rate limit|exceeded|quota|daily sending quota/i.test(errMsg)) {
                errMsg = 'Gmail daily sending limit reached';
            } else if (errMsg.length > 100) {
                errMsg = errMsg.substring(0, 97) + '...';
            }
            logEntry.details = errMsg;
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
        recordCampaignHistory(job, config);
    } else {
        recordCampaignHistory(job, config);
    }

    // Keep job in memory for 15 minutes to allow clients to view final stats, then purge from RAM
    setTimeout(() => {
        activeJobs.delete(jobId);
    }, 15 * 60 * 1000);
}

// Helper: Save campaign summary to Supabase campaign_history
async function recordCampaignHistory(job, config) {
    try {
        const startTime = job.startedAt ? new Date(job.startedAt).getTime() : Date.now();
        const endTime = job.completedAt ? new Date(job.completedAt).getTime() : Date.now();
        const durationMs = Math.max(0, endTime - startTime);

        const { error } = await supabase
            .from('campaign_history')
            .insert([
                {
                    sender_email: config.senderEmail || config.smtpConfig?.user || 'Unknown',
                    subject: config.subject || '(No subject)',
                    total_recipients: job.total || 0,
                    sent_count: job.sent || 0,
                    failed_count: job.failed || 0,
                    delay_ms: config.delay || 2000,
                    status: job.status || 'completed',
                    duration_ms: durationMs,
                    user_id: job.userId || null,
                    user_email: job.userEmail || null
                }
            ]);

        if (error) {
            console.error('Supabase campaign_history insert error:', error.message);
        }
    } catch (err) {
        console.error('Error recording campaign history to Supabase:', err.message);
    }
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

// 5. Get Campaign History (from Supabase) - only the logged-in user's own campaigns
app.get('/api/campaign-history', requireSupabaseUser, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('campaign_history')
            .select('*')
            .eq('user_id', req.userId)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json({ success: true, data: data || [] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Delete Campaign History Row (from Supabase) - only if it belongs to the logged-in user
app.delete('/api/campaign-history/:id', verifyCsrf, requireSupabaseUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('campaign_history')
            .delete()
            .eq('id', id)
            .eq('user_id', req.userId)
            .select();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Record not found or you do not have permission to delete it.' });
        }

        res.json({ success: true, message: 'Campaign history entry deleted.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. Google OAuth Sign-In Endpoint
app.post('/api/auth/google', async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ error: 'Missing Google credential token.' });
        }

        let payload;
        const clientId = process.env.GOOGLE_CLIENT_ID;

        if (clientId && !clientId.includes('sample') && !clientId.includes('placeholder')) {
            const ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: clientId
            });
            payload = ticket.getPayload();
        } else {
            // Fallback decode for local development
            const decoded = jwt.decode(credential);
            payload = decoded || {};
        }

        const user = {
            id: payload.sub || crypto.randomUUID(),
            email: payload.email || 'user@example.com',
            name: payload.name || payload.email?.split('@')[0] || 'User',
            picture: payload.picture || ''
        };

        const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

        res.cookie('outreacio_auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ success: true, user, token });
    } catch (err) {
        console.error('Google Sign-In error:', err);
        res.status(401).json({ error: 'Google authentication failed. ' + err.message });
    }
});

// 8. Get Current Authenticated Session
app.get('/api/auth/me', (req, res) => {
    try {
        const cookieToken = req.cookies?.outreacio_auth_token;
        const authHeader = req.headers.authorization;
        const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
        const token = cookieToken || bearerToken;

        if (!token) {
            return res.json({ authenticated: false, user: null });
        }

        const user = jwt.verify(token, JWT_SECRET);
        res.json({ authenticated: true, user });
    } catch (err) {
        res.json({ authenticated: false, user: null });
    }
});

// 9. Sign-Out / Clear Session
app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('outreacio_auth_token', {
        httpOnly: true,
        sameSite: 'lax'
    });
    res.json({ success: true, message: 'Logged out successfully.' });
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
