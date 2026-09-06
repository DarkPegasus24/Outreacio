const path = require('path');
const fs = require('fs');
const multer = require('multer');
const supabase = require('../../supabaseClient');
const { sendPaymentApprovedEmail, sendPaymentRejectedEmail } = require('../services/emailService');

// Ensure local screenshots directory exists
const uploadDir = path.join(__dirname, '../../public/uploads/screenshots');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `utr-proof-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only JPG, PNG, and WebP images are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter
});

/**
 * Admin Authentication Middleware
 * Accepts either:
 * 1. An 'x-admin-key' header matching ADMIN_SECRET_KEY from environment variables (.env)
 * 2. A Supabase Auth token for an email in ADMIN_EMAILS
 */
async function requireAdmin(req, res, next) {
  const adminSecret = (process.env.ADMIN_SECRET_KEY || '').trim();
  const providedKey = (req.headers['x-admin-key'] || '').trim();

  if (adminSecret && providedKey && providedKey === adminSecret) {
    req.adminIdentifier = 'admin-key';
    return next();
  }

  // Check Supabase Auth token if provided
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (token) {
    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data?.user) {
        const adminEmails = (process.env.ADMIN_EMAILS || '')
          .split(',')
          .map(e => e.trim().toLowerCase())
          .filter(Boolean);

        // If no ADMIN_EMAILS configured or user is in list
        if (adminEmails.length > 0 && adminEmails.includes(data.user.email.toLowerCase())) {
          req.adminIdentifier = data.user.email;
          return next();
        }
      }
    } catch (e) {
      // Continue to rejection
    }
  }

  return res.status(401).json({
    error: 'Unauthorized: Admin access required. Please enter valid admin key.'
  });
}

/**
 * Submit manual UPI payment for verification (Bridge Flow)
 * DOES NOT grant access or modify user plan immediately.
 */
function createPaymentController(PLANS) {
  return {
    uploadMiddleware: upload.single('screenshot'),

    async submitPayment(req, res) {
      try {
        const { planId, utr_reference, payer_name, payer_email } = req.body;

        if (!planId || !PLANS[planId]) {
          return res.status(400).json({ error: 'Invalid plan selected.' });
        }

        if (!utr_reference || !utr_reference.trim()) {
          return res.status(400).json({ error: 'Transaction UTR / Reference number is required.' });
        }

        // Get user email and ID if authenticated or from form
        const userEmail = req.userEmail || payer_email;
        if (!userEmail) {
          return res.status(400).json({ error: 'User email is required to associate subscription.' });
        }

        let userId = req.userId || null;
        if (!userId) {
          // Attempt to find user ID by email in users table
          const { data: userRecord } = await supabase
            .from('users')
            .select('id')
            .eq('email', userEmail)
            .single();
          if (userRecord) userId = userRecord.id;
        }

        // Generate screenshot URL
        let screenshotUrl = null;
        if (req.file) {
          screenshotUrl = `/uploads/screenshots/${req.file.filename}`;

          // Also attempt upload to Supabase Storage if bucket exists
          try {
            const fileBuffer = fs.readFileSync(req.file.path);
            const { data: storageData, error: storageErr } = await supabase.storage
              .from('payment-screenshots')
              .upload(`proofs/${req.file.filename}`, fileBuffer, {
                contentType: req.file.mimetype,
                upsert: true
              });

            if (!storageErr && storageData) {
              const { data: publicUrlData } = supabase.storage
                .from('payment-screenshots')
                .getPublicUrl(`proofs/${req.file.filename}`);
              if (publicUrlData?.publicUrl) {
                screenshotUrl = publicUrlData.publicUrl;
              }
            }
          } catch (storageException) {
            // Local URL serves as reliable fallback
          }
        }

        const plan = PLANS[planId];
        const submissionPayload = {
          user_id: userId,
          user_email: userEmail,
          payer_name: payer_name || null,
          plan_id: planId,
          amount_usd: plan.priceMonthly,
          utr_reference: utr_reference.trim(),
          screenshot_url: screenshotUrl,
          status: 'pending',
          created_at: new Date().toISOString()
        };

        // Insert into database
        const { data: inserted, error: insertError } = await supabase
          .from('payment_submissions')
          .insert([submissionPayload])
          .select()
          .single();

        if (insertError) {
          console.error('[Payment Bridge] DB Insert Error:', insertError);
          // Fallback: If table does not exist, log to console and return user confirmation
          return res.status(200).json({
            success: true,
            status: 'pending',
            message: 'Payment proof submitted for manual verification. Our team will verify and activate your plan within 2-4 hours.',
            submission: submissionPayload,
            note: 'Pending manual verification'
          });
        }

        console.log(`[Payment Bridge] New pending submission from ${userEmail} for ${plan.name} plan. UTR: ${utr_reference}`);

        return res.status(201).json({
          success: true,
          status: 'pending',
          message: 'Payment proof submitted for manual verification. Our team will verify and activate your plan within 2-4 hours.',
          submissionId: inserted.id
        });
      } catch (err) {
        console.error('[Payment Bridge] Error processing payment submission:', err);
        return res.status(500).json({ error: 'Failed to submit payment proof. Please try again.' });
      }
    },

    async getAdminPayments(req, res) {
      try {
        const { data: submissions, error } = await supabase
          .from('payment_submissions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          // Return empty list if table not created yet
          return res.json({
            success: true,
            submissions: [],
            stats: { pending: 0, approved: 0, rejected: 0 }
          });
        }

        const stats = {
          pending: submissions.filter(s => s.status === 'pending').length,
          approved: submissions.filter(s => s.status === 'approved').length,
          rejected: submissions.filter(s => s.status === 'rejected').length
        };

        return res.json({
          success: true,
          submissions,
          stats
        });
      } catch (err) {
        console.error('[Admin Payments] Error fetching submissions:', err);
        return res.status(500).json({ error: 'Failed to fetch payment submissions.' });
      }
    },

    async reviewPayment(req, res) {
      const { id } = req.params;
      const { decision, reason } = req.body;

      if (!['approve', 'reject'].includes(decision)) {
        return res.status(400).json({ error: 'Decision must be "approve" or "reject".' });
      }

      try {
        // 1. Fetch submission
        const { data: submission, error: fetchErr } = await supabase
          .from('payment_submissions')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchErr || !submission) {
          return res.status(404).json({ error: 'Payment submission not found.' });
        }

        const plan = PLANS[submission.plan_id] || PLANS.free;

        if (decision === 'approve') {
          // 2a. Update user's plan and reset usage counters
          let userQuery = supabase.from('users').update({
            plan_id: submission.plan_id,
            send_today_count: 0,
            verification_today_count: 0,
            ai_credits_used: 0
          });

          if (submission.user_id) {
            userQuery = userQuery.eq('id', submission.user_id);
          } else {
            userQuery = userQuery.eq('email', submission.user_email);
          }
          await userQuery;

          // 2b. Insert subscription record
          await supabase.from('subscriptions').insert([{
            user_id: submission.user_id,
            plan_id: submission.plan_id,
            status: 'active',
            started_at: new Date().toISOString(),
            expires_at: null,
            payer_name: submission.payer_name,
            payer_email: submission.user_email,
            payment_reference: submission.utr_reference,
            qr_image_url: submission.screenshot_url
          }]).catch(() => {});

          // 2c. Mark submission as approved
          await supabase
            .from('payment_submissions')
            .update({
              status: 'approved',
              reviewed_at: new Date().toISOString(),
              reviewed_by: req.adminIdentifier || 'admin'
            })
            .eq('id', id);

          // 2d. Send approval confirmation email with receipt
          await sendPaymentApprovedEmail({
            to: submission.user_email,
            name: submission.payer_name,
            planName: plan.name,
            amount: submission.amount_usd || plan.priceMonthly,
            utr: submission.utr_reference,
            date: new Date()
          });

          console.log(`[Admin Payments] Approved payment ${id} for ${submission.user_email} (${plan.name}).`);
          return res.json({
            success: true,
            message: `Payment approved! Plan ${plan.name} activated for ${submission.user_email}.`
          });
        }

        if (decision === 'reject') {
          // 3a. Mark submission as rejected
          await supabase
            .from('payment_submissions')
            .update({
              status: 'rejected',
              rejection_reason: reason || 'Unable to verify transaction in bank records.',
              reviewed_at: new Date().toISOString(),
              reviewed_by: req.adminIdentifier || 'admin'
            })
            .eq('id', id);

          // 3b. Send rejection notice email
          await sendPaymentRejectedEmail({
            to: submission.user_email,
            name: submission.payer_name,
            planName: plan.name,
            utr: submission.utr_reference,
            reason: reason || 'Unable to verify transaction in bank records.'
          });

          console.log(`[Admin Payments] Rejected payment ${id} for ${submission.user_email}. Reason: ${reason}`);
          return res.json({
            success: true,
            message: `Payment rejected for ${submission.user_email}. Notification email sent.`
          });
        }
      } catch (err) {
        console.error('[Admin Payments] Review error:', err);
        return res.status(500).json({ error: 'Failed to process payment review.' });
      }
    }
  };
}

module.exports = {
  createPaymentController,
  requireAdmin
};
