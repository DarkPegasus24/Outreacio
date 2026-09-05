const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const supabase = require('../../supabaseClient');
const { sendContactNotificationEmail } = require('../services/emailService');

// Ensure local data storage directory exists for guaranteed fallback
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const localMessagesFile = path.join(dataDir, 'contact_messages.json');

// Helper to read local messages
function readLocalMessages() {
  try {
    if (fs.existsSync(localMessagesFile)) {
      const content = fs.readFileSync(localMessagesFile, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('[Contact Store] Error reading local messages:', err.message);
  }
  return [];
}

// Helper to write local messages
function saveLocalMessages(messages) {
  try {
    fs.writeFileSync(localMessagesFile, JSON.stringify(messages, null, 2), 'utf8');
  } catch (err) {
    console.error('[Contact Store] Error writing local messages:', err.message);
  }
}

/**
 * Handle new contact message submission
 */
async function submitContact(req, res) {
  try {
    const { name, email, message } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required.' });
    }
    if (!email || !email.trim() || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }
    if (!message || !message.trim() || message.trim().length < 5) {
      return res.status(400).json({ error: 'Message must be at least 5 characters long.' });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedMessage = message.trim();
    const createdAt = new Date().toISOString();
    const fallbackId = crypto.randomUUID();

    const newRecord = {
      id: fallbackId,
      name: trimmedName,
      email: trimmedEmail,
      message: trimmedMessage,
      status: 'unread',
      created_at: createdAt
    };

    // 1. Always append to local JSON store as fail-safe guarantee
    const localMsgs = readLocalMessages();
    localMsgs.unshift(newRecord);
    saveLocalMessages(localMsgs);

    // 2. Attempt insert into Supabase contact_messages table
    let dbInserted = null;
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .insert([{
          name: trimmedName,
          email: trimmedEmail,
          message: trimmedMessage,
          status: 'unread',
          created_at: createdAt
        }])
        .select()
        .single();

      if (!error && data) {
        dbInserted = data;
      } else if (error) {
        console.warn('[Contact Controller] Supabase insert notice (local backup preserved):', error.message);
      }
    } catch (dbErr) {
      console.warn('[Contact Controller] Supabase DB exception:', dbErr.message);
    }

    // 3. Send email notification to admin (non-blocking)
    sendContactNotificationEmail({
      name: trimmedName,
      email: trimmedEmail,
      message: trimmedMessage,
      submittedAt: createdAt
    }).catch(e => console.error('[Contact Controller] Admin notification failed:', e.message));

    console.log(`[Contact Controller] ✅ New message received from ${trimmedName} (${trimmedEmail})`);

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received. Our team will get back to you shortly.',
      id: dbInserted?.id || fallbackId
    });
  } catch (err) {
    console.error('[Contact Controller] Unexpected error in submitContact:', err);
    return res.status(500).json({ error: 'Failed to submit contact message. Please try again.' });
  }
}

/**
 * Admin: Get all contact messages
 */
async function getAdminContacts(req, res) {
  try {
    let contacts = [];

    // Try fetching from Supabase first
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        contacts = data;
      }
    } catch (e) {
      // Supabase table may not exist yet
    }

    // If Supabase was empty or failed, fallback to local messages
    if (contacts.length === 0) {
      contacts = readLocalMessages();
    } else {
      // Merge any local messages not in Supabase by email + timestamp
      const local = readLocalMessages();
      const existingIds = new Set(contacts.map(c => c.id));
      for (const loc of local) {
        if (!existingIds.has(loc.id)) {
          contacts.push(loc);
        }
      }
      contacts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    const stats = {
      total: contacts.length,
      unread: contacts.filter(c => c.status === 'unread').length,
      read: contacts.filter(c => c.status === 'read').length,
      replied: contacts.filter(c => c.status === 'replied').length
    };

    return res.json({
      success: true,
      contacts,
      stats
    });
  } catch (err) {
    console.error('[Contact Controller] Error in getAdminContacts:', err);
    return res.status(500).json({ error: 'Failed to retrieve contact messages.' });
  }
}

/**
 * Admin: Update contact message status (read, replied, unread)
 */
async function updateContactStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, adminNotes, admin_notes } = req.body || {};
    const note = adminNotes !== undefined ? adminNotes : admin_notes;

    if (!['unread', 'read', 'replied'].includes(status)) {
      return res.status(400).json({ error: 'Status must be "unread", "read", or "replied".' });
    }

    // 1. Update in local file
    const local = readLocalMessages();
    let foundInLocal = false;
    for (const msg of local) {
      if (msg.id === id) {
        msg.status = status;
        if (note !== undefined) msg.admin_notes = note;
        foundInLocal = true;
        break;
      }
    }
    if (foundInLocal) {
      saveLocalMessages(local);
    }

    // 2. Update in Supabase
    try {
      await supabase
        .from('contact_messages')
        .update({ status, ...(note !== undefined ? { admin_notes: note } : {}) })
        .eq('id', id);
    } catch (e) {
      // Supabase ignore if not available
    }

    return res.json({ success: true, message: `Status updated to ${status}` });
  } catch (err) {
    console.error('[Contact Controller] Error updating contact status:', err);
    return res.status(500).json({ error: 'Failed to update contact status.' });
  }
}

/**
 * Admin: Delete a contact message
 */
async function deleteContact(req, res) {
  try {
    const { id } = req.params;

    // 1. Delete from local file
    const local = readLocalMessages();
    const filtered = local.filter(msg => msg.id !== id);
    saveLocalMessages(filtered);

    // 2. Delete from Supabase
    try {
      await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);
    } catch (e) {
      // ignore
    }

    return res.json({ success: true, message: 'Message deleted successfully.' });
  } catch (err) {
    console.error('[Contact Controller] Error deleting contact:', err);
    return res.status(500).json({ error: 'Failed to delete contact message.' });
  }
}

module.exports = {
  submitContact,
  getAdminContacts,
  updateContactStatus,
  deleteContact
};
