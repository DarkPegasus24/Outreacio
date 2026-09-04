const nodemailer = require('nodemailer');

/**
 * Configure system email transporter.
 * Can use SYSTEM_EMAIL_USER / SYSTEM_EMAIL_PASS (e.g. Gmail App Password),
 * or generic SMTP via SYSTEM_SMTP_HOST, SYSTEM_SMTP_PORT, etc.
 */
function getTransporter() {
  const user = process.env.SYSTEM_EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.SYSTEM_EMAIL_PASS || process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  // If host provided, use custom SMTP, else default to Gmail service
  if (process.env.SYSTEM_SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SYSTEM_SMTP_HOST,
      port: Number(process.env.SYSTEM_SMTP_PORT) || 587,
      secure: process.env.SYSTEM_SMTP_SECURE === 'true',
      auth: { user, pass }
    });
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });
}

/**
 * Send plan activation confirmation and payment receipt
 */
async function sendPaymentApprovedEmail({ to, name, planName, amount, utr, date }) {
  const formattedDate = date ? new Date(date).toLocaleDateString('en-US', { dateStyle: 'medium' }) : new Date().toLocaleDateString();
  const subject = `🎉 Your Outreacio ${planName} Plan is Now Active!`;
  const from = process.env.SYSTEM_EMAIL_FROM || process.env.SYSTEM_EMAIL_USER || 'Outreacio Billing <billing@outreacio.com>';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 20px; color: #251f19; background-color: #f7f7f4; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #f48d16; margin: 0; font-size: 28px; font-weight: 800;">Outreacio</h1>
        <p style="color: #5c554e; font-size: 14px; margin-top: 4px;">Cold Outreach &amp; Campaign Automation</p>
      </div>

      <div style="background: #ffffff; padding: 28px; border-radius: 12px; border: 1px solid rgba(37,31,25,0.08); box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
        <h2 style="margin-top: 0; color: #128a4d; font-size: 20px;">Payment Verified &amp; Plan Activated</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #5c554e;">
          Hi ${name || 'there'},<br /><br />
          Great news! Your manual payment for the <strong>${planName} Plan</strong> has been manually verified by our team. Your account has been upgraded immediately.
        </p>

        <div style="background: #f8f7f4; border-radius: 10px; padding: 18px; margin: 20px 0; font-size: 14px; border: 1px dashed rgba(37,31,25,0.15);">
          <div style="font-weight: 700; color: #251f19; margin-bottom: 10px; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em;">Payment Receipt Summary</div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #8d857d;">Plan:</span>
            <strong style="color: #251f19;">${planName}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #8d857d;">Amount Paid:</span>
            <strong style="color: #251f19;">$${amount} / mo</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #8d857d;">Transaction UTR:</span>
            <span style="font-family: monospace; font-weight: 600;">${utr}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #8d857d;">Activated On:</span>
            <span>${formattedDate}</span>
          </div>
        </div>

        <div style="text-align: center; margin-top: 24px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="display: inline-block; background: #f48d16; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 12px 28px; borderRadius: 10px;">
            Open Campaign Dashboard &rarr;
          </a>
        </div>
      </div>

      <p style="text-align: center; font-size: 12px; color: #8d857d; margin-top: 24px;">
        Questions or need support? Reply directly to this email.
      </p>
    </div>
  `;

  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[Email Service] (Mock / No SMTP configured) Approval email for ${to}:\n`, {
      to,
      subject,
      planName,
      amount,
      utr
    });
    return { success: true, mocked: true };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[Email Service] Failed to send payment approval email:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Send payment verification rejection notification with guidance
 */
async function sendPaymentRejectedEmail({ to, name, planName, utr, reason }) {
  const subject = `Notice regarding your Outreacio ${planName || ''} payment verification`;
  const from = process.env.SYSTEM_EMAIL_FROM || process.env.SYSTEM_EMAIL_USER || 'Outreacio Billing <billing@outreacio.com>';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 20px; color: #251f19; background-color: #f7f7f4; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #f48d16; margin: 0; font-size: 28px; font-weight: 800;">Outreacio</h1>
      </div>

      <div style="background: #ffffff; padding: 28px; border-radius: 12px; border: 1px solid rgba(37,31,25,0.08); box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
        <h2 style="margin-top: 0; color: #e24b4a; font-size: 20px;">Payment Verification Issue</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #5c554e;">
          Hi ${name || 'there'},<br /><br />
          We were unable to verify your manual UPI payment submission for the <strong>${planName} Plan</strong>.
        </p>

        <div style="background: #fff5f5; border-radius: 10px; padding: 16px; margin: 18px 0; font-size: 14px; border: 1px solid #fed7d7; color: #9b2c2c;">
          <strong>Reason provided by team:</strong><br />
          ${reason || 'The transaction UTR reference could not be matched with incoming deposits on our bank account.'}
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #5c554e;">
          <strong>Reference entered:</strong> <span style="font-family: monospace;">${utr || 'N/A'}</span><br /><br />
          <strong>What should you do?</strong><br />
          1. Double-check your bank or UPI transaction history to confirm the 12-digit UTR reference.<br />
          2. Visit the pricing page to re-submit with the correct transaction reference &amp; screenshot.<br />
          3. If money was debited, simply reply to this email with your bank statement reference and our support team will resolve it.
        </p>

        <div style="text-align: center; margin-top: 24px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/pricing" style="display: inline-block; background: #251f19; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 12px 28px; borderRadius: 10px;">
            Return to Pricing Page &rarr;
          </a>
        </div>
      </div>
    </div>
  `;

  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[Email Service] (Mock / No SMTP configured) Rejection email for ${to}:\n`, {
      to,
      subject,
      planName,
      utr,
      reason
    });
    return { success: true, mocked: true };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[Email Service] Failed to send payment rejection email:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Send notification to admins when a user submits the Contact Page form
 */
async function sendContactNotificationEmail({ name, email, message, submittedAt }) {
  const dateStr = submittedAt ? new Date(submittedAt).toLocaleString() : new Date().toLocaleString();
  const subject = `📬 [Outreacio Contact] New Inquiry from ${name || 'User'} (${email})`;
  const from = process.env.SYSTEM_EMAIL_FROM || process.env.SYSTEM_EMAIL_USER || 'Outreacio Contact <contact@outreacio.com>';
  const to = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAILS || process.env.SYSTEM_EMAIL_USER || 'solvers.real@gmail.com';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 20px; color: #251f19; background-color: #f7f7f4; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #f48d16; margin: 0; font-size: 26px; font-weight: 800;">Outreacio</h1>
        <p style="color: #5c554e; font-size: 14px; margin-top: 4px;">New Contact Form Message</p>
      </div>

      <div style="background: #ffffff; padding: 28px; border-radius: 12px; border: 1px solid rgba(37,31,25,0.08); box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
        <h2 style="margin-top: 0; color: #251f19; font-size: 19px;">Inquiry Details</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #8d857d; width: 100px;"><strong>From:</strong></td>
            <td style="padding: 8px 0; color: #251f19; font-weight: 600;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #8d857d;"><strong>Email:</strong></td>
            <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #f48d16; text-decoration: none; font-weight: 600;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #8d857d;"><strong>Date:</strong></td>
            <td style="padding: 8px 0; color: #5c554e;">${dateStr}</td>
          </tr>
        </table>

        <div style="background: #f8f7f4; border-left: 4px solid #f48d16; border-radius: 6px; padding: 16px; margin: 18px 0;">
          <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; color: #8d857d; margin-bottom: 8px;">User Message:</div>
          <div style="font-size: 15px; line-height: 1.6; color: #251f19; white-space: pre-wrap;">${message}</div>
        </div>

        <div style="text-align: center; margin-top: 24px;">
          <a href="mailto:${email}?subject=Re: Outreacio Inquiry - ${encodeURIComponent(name)}" style="display: inline-block; background: #f48d16; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 8px;">
            Reply to ${email} &rarr;
          </a>
        </div>
      </div>
    </div>
  `;

  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[Email Service] (Mock / No SMTP configured) New Contact Message from ${email}:\n`, {
      name,
      email,
      message,
      submittedAt: dateStr
    });
    return { success: true, mocked: true };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      replyTo: email,
      subject,
      html
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[Email Service] Failed to send contact notification email:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  sendPaymentApprovedEmail,
  sendPaymentRejectedEmail,
  sendContactNotificationEmail
};

