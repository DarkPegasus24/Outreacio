import React, { useState, useEffect, useMemo } from 'react';
import {
  fetchAdminPayments,
  reviewPaymentSubmission,
  fetchAdminContacts,
  updateAdminContactStatus,
  deleteAdminContactMessage
} from '../api/planService';
import {
  Check, X, Eye, EyeOff, Copy, RefreshCw, Lock, ShieldCheck,
  AlertCircle, ExternalLink, Mail, MessageSquare, Trash2, CheckCircle2,
  User, Clock, Search, ArrowLeft, Filter, Sparkles, CheckCircle,
  XCircle, FileText, Download, ArrowUpRight
} from 'lucide-react';

export default function AdminPaymentsPage({ onNavigateHome }) {
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem('outreacio_admin_key') || '');
  const [keyInput, setKeyInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Section Navigation
  const [mainSection, setMainSection] = useState('payments'); // 'payments' | 'contacts'

  // Payment Submissions State
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [paymentTab, setPaymentTab] = useState('pending'); // 'pending' | 'all' | 'history'

  // Contact Inquiries State
  const [contacts, setContacts] = useState([]);
  const [contactStats, setContactStats] = useState({ total: 0, unread: 0, read: 0, replied: 0 });
  const [contactTab, setContactTab] = useState('unread'); // 'unread' | 'all' | 'replied'

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modal for screenshot preview
  const [previewImage, setPreviewImage] = useState(null);

  // Modal for rejection reason
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);
  const [copiedUtr, setCopiedUtr] = useState('');

  const quickRejectionTemplates = [
    "Transaction UTR reference not found in bank statement.",
    "Screenshot is illegible or incomplete. Please resubmit clear proof.",
    "Payment amount does not match the chosen plan tier.",
    "Duplicate transaction UTR reference already processed."
  ];

  const loadData = async (keyToUse) => {
    const key = keyToUse ?? adminKey;
    setLoading(true);
    setError('');
    try {
      const [paymentData, contactData] = await Promise.all([
        fetchAdminPayments(key).catch(e => { throw e; }),
        fetchAdminContacts(key).catch(() => ({ success: true, contacts: [], stats: { total: 0, unread: 0, read: 0, replied: 0 } }))
      ]);

      if (paymentData.success) {
        setIsAuthenticated(true);
        setSubmissions(paymentData.submissions || []);
        setStats(paymentData.stats || { pending: 0, approved: 0, rejected: 0 });
      }
      if (contactData.success) {
        setContacts(contactData.contacts || []);
        setContactStats(contactData.stats || { total: 0, unread: 0, read: 0, replied: 0 });
      }
    } catch (err) {
      setIsAuthenticated(false);
      setError(err.message || 'Authentication failed. Please check your admin key.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminKey) {
      loadData(adminKey);
    }
  }, [adminKey]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    const cleanKey = keyInput.trim();
    sessionStorage.setItem('outreacio_admin_key', cleanKey);
    setAdminKey(cleanKey);
    loadData(cleanKey);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('outreacio_admin_key');
    setAdminKey('');
    setIsAuthenticated(false);
    setSubmissions([]);
    setContacts([]);
  };

  const handleApprove = async (submission) => {
    if (!window.confirm(`Confirm approval of ${submission.plan_id.toUpperCase()} plan for ${submission.user_email}? This will activate their subscription immediately and send an activation receipt.`)) {
      return;
    }

    setActionInProgress(true);
    try {
      await reviewPaymentSubmission(submission.id, 'approve', '', adminKey);
      await loadData();
    } catch (err) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectingItem) return;
    setActionInProgress(true);
    try {
      await reviewPaymentSubmission(rejectingItem.id, 'reject', rejectionReason, adminKey);
      setRejectingItem(null);
      setRejectionReason('');
      await loadData();
    } catch (err) {
      alert(`Rejection error: ${err.message}`);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleContactStatus = async (contactId, newStatus) => {
    try {
      await updateAdminContactStatus(contactId, newStatus, '', adminKey);
      await loadData();
    } catch (err) {
      alert(`Error updating message: ${err.message}`);
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await deleteAdminContactMessage(contactId, adminKey);
      await loadData();
    } catch (err) {
      alert(`Error deleting message: ${err.message}`);
    }
  };

  const copyUtr = (utr) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(utr);
    setTimeout(() => setCopiedUtr(''), 2000);
  };

  // Filtered Payments with Search
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(sub => {
      // Tab filter
      if (paymentTab === 'pending' && sub.status !== 'pending') return false;
      if (paymentTab === 'history' && sub.status === 'pending') return false;

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (sub.user_email || '').toLowerCase().includes(q) ||
        (sub.payer_name || '').toLowerCase().includes(q) ||
        (sub.utr_reference || '').toLowerCase().includes(q) ||
        (sub.plan_id || '').toLowerCase().includes(q)
      );
    });
  }, [submissions, paymentTab, searchQuery]);

  // Filtered Contacts with Search
  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      // Tab filter
      if (contactTab === 'unread' && c.status !== 'unread') return false;
      if (contactTab === 'replied' && c.status !== 'replied') return false;

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (c.name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.message || '').toLowerCase().includes(q)
      );
    });
  }, [contacts, contactTab, searchQuery]);

  // =========================================================================
  // Unauthenticated Admin Passcode Screen (Parley Premium Gate)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        position: 'relative'
      }}>
        {/* Background glow orb */}
        <div style={{
          position: 'absolute',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244, 141, 22, 0.12) 0%, rgba(244, 141, 22, 0) 70%)',
          pointerEvents: 'none',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 0
        }} />

        <div style={{
          position: 'relative',
          zIndex: 1,
          background: 'var(--bg-white, #ffffff)',
          borderRadius: '24px',
          padding: '42px 36px',
          width: '100%',
          maxWidth: '460px',
          boxShadow: 'var(--shadow-hover, 0 20px 60px rgba(0,0,0,0.12))',
          border: '1px solid var(--border)',
          textAlign: 'center',
          backdropFilter: 'blur(12px)'
        }}>
          {/* Top Brand / Lock Icon */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(244, 141, 22, 0.16), rgba(244, 141, 22, 0.32))',
            color: 'var(--accent, #f48d16)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            border: '1.5px solid rgba(244, 141, 22, 0.35)',
            boxShadow: '0 8px 24px rgba(244, 141, 22, 0.2)'
          }}>
            <ShieldCheck size={32} />
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--accent-light, rgba(244, 141, 22, 0.1))',
            color: 'var(--accent, #f48d16)',
            border: '1px solid var(--accent-border, rgba(244, 141, 22, 0.25))',
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: '800',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: '12px'
          }}>
            <Lock size={12} />
            Restricted Admin Area
          </div>

          <h2 style={{
            fontSize: '24px',
            fontWeight: '800',
            margin: '0 0 8px',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em'
          }}>
            Admin Portal
          </h2>

          <p style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            marginBottom: '28px',
            lineHeight: 1.55
          }}>
            UPI manual payment verifications and contact inquiry responses. Please enter your secret key to proceed.
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter Admin Password"
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  padding: '13px 44px 13px 16px',
                  borderRadius: '12px',
                  border: '1.5px solid var(--border-strong)',
                  background: 'var(--bg-input, #ffffff)',
                  color: 'var(--text-primary)',
                  fontSize: '14.5px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <div style={{
                background: 'var(--error-bg, rgba(239, 68, 68, 0.1))',
                border: '1px solid var(--error-border, rgba(239, 68, 68, 0.3))',
                borderRadius: '10px',
                padding: '10px 14px',
                color: 'var(--error, #dc2626)',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textAlign: 'left'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="parley-chat-btn"
              style={{
                width: '100%',
                padding: '13px 20px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #f48d16 0%, #e07d0a 100%)',
                color: '#ffffff',
                fontSize: '14.5px',
                fontWeight: '700',
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 8px 24px rgba(244, 141, 22, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Verifying Credentials…</span>
                </>
              ) : (
                <>
                  <span>Access Admin Hub</span>
                  <ArrowUpRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // Authenticated Admin Hub
  // =========================================================================
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px 20px 80px',
      fontFamily: 'inherit'
    }}>
      {/* Top Banner & Control Bar */}
      <div style={{
        background: 'var(--bg-white, #ffffff)',
        borderRadius: '20px',
        padding: '22px 28px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-subtle)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '18px',
        marginBottom: '26px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '800',
              margin: 0,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <ShieldCheck size={26} color="var(--accent)" />
              Outreacio Admin Hub
            </h1>

            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: 'var(--success-bg, rgba(31, 190, 109, 0.12))',
              color: 'var(--success, #1fbe6d)',
              border: '1px solid var(--success-border, rgba(31, 190, 109, 0.3))',
              fontSize: '11px',
              fontWeight: '700',
              padding: '3px 10px',
              borderRadius: '9999px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
              Live Authenticated
            </span>
          </div>

          <p style={{ margin: '6px 0 0', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            Real-time control center for manual UPI payment verification &amp; customer contact inquiries.
          </p>
        </div>

        {/* Top Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              title="Return to Public Website"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 15px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <ArrowLeft size={14} />
              Home
            </button>
          )}

          <button
            onClick={() => loadData()}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Sync Data
          </button>

          <button
            onClick={handleLogout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '10px',
              border: '1px solid var(--error-border, rgba(226, 75, 74, 0.3))',
              background: 'var(--error-bg, rgba(226, 75, 74, 0.1))',
              color: 'var(--error, #e24b4a)',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Lock size={14} />
            Lock Portal
          </button>
        </div>
      </div>

      {/* KPI Metric Overview Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '26px'
      }}>
        {/* Pending Payments Card */}
        <div style={{
          background: 'var(--bg-white, #ffffff)',
          border: stats.pending > 0 ? '1.5px solid #f59e0b' : '1px solid var(--border)',
          borderRadius: '18px',
          padding: '20px 22px',
          boxShadow: stats.pending > 0 ? '0 6px 20px rgba(245, 158, 11, 0.12)' : 'var(--shadow-subtle)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Pending Verifications
              </div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: stats.pending > 0 ? '#d97706' : 'var(--text-primary)' }}>
                {stats.pending}
              </div>
            </div>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(245, 158, 11, 0.12)',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock size={20} />
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Requires manual UTR bank statement cross-check
          </div>
        </div>

        {/* Approved Payments Card */}
        <div style={{
          background: 'var(--bg-white, #ffffff)',
          border: '1px solid var(--border)',
          borderRadius: '18px',
          padding: '20px 22px',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Approved Subscribers
              </div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--success, #1fbe6d)' }}>
                {stats.approved}
              </div>
            </div>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'var(--success-bg, rgba(31, 190, 109, 0.12))',
              color: 'var(--success, #1fbe6d)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Active pro subscriptions granted
          </div>
        </div>

        {/* Unread Inquiries Card */}
        <div style={{
          background: 'var(--bg-white, #ffffff)',
          border: contactStats.unread > 0 ? '1.5px solid var(--accent)' : '1px solid var(--border)',
          borderRadius: '18px',
          padding: '20px 22px',
          boxShadow: contactStats.unread > 0 ? '0 6px 20px rgba(244, 141, 22, 0.12)' : 'var(--shadow-subtle)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Unread Inquiries
              </div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: contactStats.unread > 0 ? 'var(--accent)' : 'var(--text-primary)' }}>
                {contactStats.unread}
              </div>
            </div>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'var(--accent-light, rgba(244, 141, 22, 0.12))',
              color: 'var(--accent, #f48d16)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Mail size={20} />
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            From website contact page form submissions
          </div>
        </div>

        {/* Total Inquiries Card */}
        <div style={{
          background: 'var(--bg-white, #ffffff)',
          border: '1px solid var(--border)',
          borderRadius: '18px',
          padding: '20px 22px',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Total Messages
              </div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)' }}>
                {contactStats.total}
              </div>
            </div>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MessageSquare size={20} />
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            {contactStats.replied} messages answered
          </div>
        </div>
      </div>

      {/* Main Section Navigation Tabs + Search Box */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px',
        marginBottom: '20px'
      }}>
        {/* Section Switcher Pill */}
        <div style={{
          display: 'flex',
          gap: '6px',
          background: 'var(--bg-surface)',
          padding: '6px',
          borderRadius: '14px',
          border: '1px solid var(--border)'
        }}>
          <button
            type="button"
            onClick={() => {
              setMainSection('payments');
              setSearchQuery('');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              border: 'none',
              background: mainSection === 'payments' ? 'var(--bg-white, #ffffff)' : 'transparent',
              color: mainSection === 'payments' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: '700',
              fontSize: '14px',
              padding: '9px 20px',
              borderRadius: '10px',
              cursor: 'pointer',
              boxShadow: mainSection === 'payments' ? 'var(--shadow-card)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <span>💳 UPI Payment Proofs</span>
            {stats.pending > 0 && (
              <span style={{
                background: '#d97706',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: '800',
                padding: '2px 8px',
                borderRadius: '9999px'
              }}>
                {stats.pending}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setMainSection('contacts');
              setSearchQuery('');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              border: 'none',
              background: mainSection === 'contacts' ? 'var(--bg-white, #ffffff)' : 'transparent',
              color: mainSection === 'contacts' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: '700',
              fontSize: '14px',
              padding: '9px 20px',
              borderRadius: '10px',
              cursor: 'pointer',
              boxShadow: mainSection === 'contacts' ? 'var(--shadow-card)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <span>📬 Contact Inquiries</span>
            {contactStats.unread > 0 && (
              <span style={{
                background: 'var(--accent, #f48d16)',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: '800',
                padding: '2px 8px',
                borderRadius: '9999px'
              }}>
                {contactStats.unread} new
              </span>
            )}
          </button>
        </div>

        {/* Instant Search Filter Input */}
        <div style={{ position: 'relative', minWidth: '260px', flex: '1', maxWidth: '380px' }}>
          <Search size={16} style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }} />
          <input
            type="text"
            placeholder={mainSection === 'payments' ? "Search email, name, UTR..." : "Search sender name, email, query..."}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              background: 'var(--bg-white, #ffffff)',
              color: 'var(--text-primary)',
              fontSize: '13.5px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          SECTION 1: UPI PAYMENT PROOFS
         ========================================================================= */}
      {mainSection === 'payments' && (
        <div>
          {/* Sub-Tabs: Pending / Resolved / All */}
          <div style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '1.5px solid var(--border)',
            marginBottom: '20px',
            paddingBottom: '2px'
          }}>
            <button
              onClick={() => setPaymentTab('pending')}
              style={{
                padding: '10px 18px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: paymentTab === 'pending' ? '800' : '600',
                color: paymentTab === 'pending' ? 'var(--accent, #f48d16)' : 'var(--text-secondary)',
                borderBottom: paymentTab === 'pending' ? '3px solid var(--accent, #f48d16)' : '3px solid transparent',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>Pending Review</span>
              <span style={{
                background: paymentTab === 'pending' ? 'var(--accent-light)' : 'var(--bg-surface)',
                color: paymentTab === 'pending' ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: '11px',
                fontWeight: '800',
                padding: '2px 8px',
                borderRadius: '9999px'
              }}>
                {submissions.filter(s => s.status === 'pending').length}
              </span>
            </button>

            <button
              onClick={() => setPaymentTab('history')}
              style={{
                padding: '10px 18px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: paymentTab === 'history' ? '800' : '600',
                color: paymentTab === 'history' ? 'var(--accent, #f48d16)' : 'var(--text-secondary)',
                borderBottom: paymentTab === 'history' ? '3px solid var(--accent, #f48d16)' : '3px solid transparent',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>History &amp; Resolved</span>
              <span style={{
                background: paymentTab === 'history' ? 'var(--accent-light)' : 'var(--bg-surface)',
                color: paymentTab === 'history' ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: '11px',
                fontWeight: '800',
                padding: '2px 8px',
                borderRadius: '9999px'
              }}>
                {submissions.filter(s => s.status !== 'pending').length}
              </span>
            </button>

            <button
              onClick={() => setPaymentTab('all')}
              style={{
                padding: '10px 18px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: paymentTab === 'all' ? '800' : '600',
                color: paymentTab === 'all' ? 'var(--accent, #f48d16)' : 'var(--text-secondary)',
                borderBottom: paymentTab === 'all' ? '3px solid var(--accent, #f48d16)' : '3px solid transparent'
              }}
            >
              All Records ({submissions.length})
            </button>
          </div>

          {/* Submissions List */}
          {filteredSubmissions.length === 0 ? (
            <div style={{
              background: 'var(--bg-white, #ffffff)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '64px 20px',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'var(--bg-surface)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <CheckCircle size={28} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 6px', color: 'var(--text-primary)' }}>
                {searchQuery ? 'No matching submissions found' : (paymentTab === 'pending' ? 'All caught up! No pending proofs.' : 'No submission records yet.')}
              </h3>
              <p style={{ fontSize: '14px', margin: 0, color: 'var(--text-muted)' }}>
                {searchQuery ? `Try clearing your search term "${searchQuery}"` : 'New user manual UPI payment uploads will automatically appear here.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredSubmissions.map((sub) => {
                const isPending = sub.status === 'pending';
                const isApproved = sub.status === 'approved';
                const isRejected = sub.status === 'rejected';

                return (
                  <div
                    key={sub.id}
                    style={{
                      background: 'var(--bg-white, #ffffff)',
                      border: isPending ? '1.5px solid rgba(245, 158, 11, 0.45)' : '1px solid var(--border)',
                      borderRadius: '18px',
                      padding: '22px 26px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '20px',
                      boxShadow: isPending ? '0 8px 26px rgba(245, 158, 11, 0.09)' : 'var(--shadow-subtle)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                  >
                    {/* Subscriber & Plan Info */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', minWidth: '240px' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: sub.plan_id === 'pro'
                          ? 'linear-gradient(135deg, #f48d16, #e07d0a)'
                          : 'var(--bg-surface)',
                        color: sub.plan_id === 'pro' ? '#ffffff' : 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        fontSize: '16px',
                        flexShrink: 0
                      }}>
                        {(sub.payer_name || sub.user_email || 'U').charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            background: sub.plan_id === 'pro'
                              ? 'linear-gradient(90deg, #f48d16, #e07d0a)'
                              : 'var(--bg-surface)',
                            color: sub.plan_id === 'pro' ? '#ffffff' : 'var(--text-primary)',
                            letterSpacing: '0.04em'
                          }}>
                            {sub.plan_id} Plan
                          </span>

                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} /> {new Date(sub.created_at).toLocaleString()}
                          </span>
                        </div>

                        <div style={{ fontWeight: '800', fontSize: '15.5px', color: 'var(--text-primary)' }}>
                          {sub.payer_name || 'Subscriber'}
                        </div>

                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                          {sub.user_email}
                        </div>
                      </div>
                    </div>

                    {/* UTR Reference & Screenshot Preview Trigger */}
                    <div style={{ minWidth: '220px' }}>
                      <div style={{
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        fontWeight: '800',
                        letterSpacing: '0.04em',
                        marginBottom: '4px'
                      }}>
                        Transaction UTR Reference
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontFamily: 'monospace',
                          fontWeight: '800',
                          fontSize: '14.5px',
                          background: 'var(--bg-surface)',
                          color: 'var(--text-primary)',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)'
                        }}>
                          {sub.utr_reference}
                        </span>

                        <button
                          onClick={() => copyUtr(sub.utr_reference)}
                          title="Copy UTR Reference"
                          style={{
                            background: copiedUtr === sub.utr_reference ? 'var(--success-bg)' : 'var(--bg-surface)',
                            border: `1px solid ${copiedUtr === sub.utr_reference ? 'var(--success)' : 'var(--border)'}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            color: copiedUtr === sub.utr_reference ? 'var(--success)' : 'var(--text-secondary)',
                            padding: '6px 8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          {copiedUtr === sub.utr_reference ? (
                            <>
                              <Check size={13} /> Copied
                            </>
                          ) : (
                            <>
                              <Copy size={13} /> Copy
                            </>
                          )}
                        </button>
                      </div>

                      {sub.screenshot_url && (
                        <button
                          onClick={() => setPreviewImage(sub.screenshot_url)}
                          style={{
                            marginTop: '8px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--accent, #f48d16)',
                            fontSize: '13px',
                            fontWeight: '700',
                            padding: 0,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <Eye size={14} /> View Uploaded Screenshot Proof
                        </button>
                      )}
                    </div>

                    {/* Review Actions / Status Outcome */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {isPending ? (
                        <>
                          <button
                            onClick={() => handleApprove(sub)}
                            disabled={actionInProgress}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: '#16a34a',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '10px',
                              padding: '10px 18px',
                              fontSize: '13.5px',
                              fontWeight: '700',
                              cursor: actionInProgress ? 'wait' : 'pointer',
                              boxShadow: '0 4px 14px rgba(22, 163, 74, 0.25)',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Check size={15} /> Approve &amp; Activate
                          </button>

                          <button
                            onClick={() => setRejectingItem(sub)}
                            disabled={actionInProgress}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: 'var(--error-bg, rgba(239, 68, 68, 0.1))',
                              color: 'var(--error, #dc2626)',
                              border: '1px solid var(--error-border, rgba(239, 68, 68, 0.25))',
                              borderRadius: '10px',
                              padding: '10px 16px',
                              fontSize: '13.5px',
                              fontWeight: '700',
                              cursor: actionInProgress ? 'wait' : 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <X size={15} /> Reject
                          </button>
                        </>
                      ) : (
                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '5px 14px',
                            borderRadius: '9999px',
                            fontSize: '12px',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            background: isApproved
                              ? 'var(--success-bg, rgba(22, 163, 74, 0.12))'
                              : 'var(--error-bg, rgba(239, 68, 68, 0.12))',
                            color: isApproved ? 'var(--success, #16a34a)' : 'var(--error, #dc2626)',
                            border: `1px solid ${isApproved ? 'var(--success-border)' : 'var(--error-border)'}`
                          }}>
                            {isApproved ? (
                              <>
                                <CheckCircle size={14} /> Approved
                              </>
                            ) : (
                              <>
                                <XCircle size={14} /> Rejected
                              </>
                            )}
                          </span>

                          {sub.rejection_reason && (
                            <div style={{
                              fontSize: '12px',
                              color: 'var(--text-muted)',
                              marginTop: '6px',
                              maxWidth: '240px',
                              lineHeight: 1.4
                            }}>
                              Reason: {sub.rejection_reason}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SECTION 2: CONTACT INQUIRIES
         ========================================================================= */}
      {mainSection === 'contacts' && (
        <div>
          {/* Sub-Tabs: Unread / All / Replied */}
          <div style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '1.5px solid var(--border)',
            marginBottom: '20px',
            paddingBottom: '2px'
          }}>
            <button
              onClick={() => setContactTab('unread')}
              style={{
                padding: '10px 18px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: contactTab === 'unread' ? '800' : '600',
                color: contactTab === 'unread' ? 'var(--accent, #f48d16)' : 'var(--text-secondary)',
                borderBottom: contactTab === 'unread' ? '3px solid var(--accent, #f48d16)' : '3px solid transparent',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>Unread Messages</span>
              <span style={{
                background: contactTab === 'unread' ? 'var(--accent-light)' : 'var(--bg-surface)',
                color: contactTab === 'unread' ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: '11px',
                fontWeight: '800',
                padding: '2px 8px',
                borderRadius: '9999px'
              }}>
                {contactStats.unread}
              </span>
            </button>

            <button
              onClick={() => setContactTab('all')}
              style={{
                padding: '10px 18px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: contactTab === 'all' ? '800' : '600',
                color: contactTab === 'all' ? 'var(--accent, #f48d16)' : 'var(--text-secondary)',
                borderBottom: contactTab === 'all' ? '3px solid var(--accent, #f48d16)' : '3px solid transparent'
              }}
            >
              All Inquiries ({contactStats.total})
            </button>

            <button
              onClick={() => setContactTab('replied')}
              style={{
                padding: '10px 18px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: contactTab === 'replied' ? '800' : '600',
                color: contactTab === 'replied' ? 'var(--accent, #f48d16)' : 'var(--text-secondary)',
                borderBottom: contactTab === 'replied' ? '3px solid var(--accent, #f48d16)' : '3px solid transparent',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>Replied</span>
              <span style={{
                background: contactTab === 'replied' ? 'var(--accent-light)' : 'var(--bg-surface)',
                color: contactTab === 'replied' ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: '11px',
                fontWeight: '800',
                padding: '2px 8px',
                borderRadius: '9999px'
              }}>
                {contactStats.replied}
              </span>
            </button>
          </div>

          {/* Contact Inquiries Cards */}
          {filteredContacts.length === 0 ? (
            <div style={{
              background: 'var(--bg-white, #ffffff)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '64px 20px',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'var(--bg-surface)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Mail size={28} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 6px', color: 'var(--text-primary)' }}>
                {searchQuery ? 'No matching inquiries found' : (contactTab === 'unread' ? 'Zero unread inquiries!' : 'No inquiries recorded.')}
              </h3>
              <p style={{ fontSize: '14px', margin: 0, color: 'var(--text-muted)' }}>
                {searchQuery ? `Try adjusting your search query "${searchQuery}"` : 'All customer inquiries have been addressed.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredContacts.map((item) => {
                const isUnread = item.status === 'unread';
                const isReplied = item.status === 'replied';

                return (
                  <div
                    key={item.id}
                    style={{
                      background: 'var(--bg-white, #ffffff)',
                      border: isUnread ? '1.5px solid rgba(244, 141, 22, 0.45)' : '1px solid var(--border)',
                      borderRadius: '18px',
                      padding: '24px',
                      boxShadow: isUnread ? '0 6px 24px rgba(244, 141, 22, 0.08)' : 'var(--shadow-subtle)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Top Row: Sender Information & Quick Actions */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: '14px',
                      marginBottom: '16px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          background: 'var(--accent-light, rgba(244, 141, 22, 0.12))',
                          color: 'var(--accent, #f48d16)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          fontSize: '16px'
                        }}>
                          {(item.name || 'U').charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px' }}>
                            <span style={{ fontSize: '16.5px', fontWeight: '800', color: 'var(--text-primary)' }}>
                              {item.name}
                            </span>

                            <span style={{
                              padding: '2px 9px',
                              borderRadius: '9999px',
                              fontSize: '11px',
                              fontWeight: '800',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              background: isUnread ? '#ffedd5' : (isReplied ? '#dcfce7' : '#e0f2fe'),
                              color: isUnread ? '#c2410c' : (isReplied ? '#15803d' : '#0369a1')
                            }}>
                              {item.status}
                            </span>
                          </div>

                          <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                            <span>
                              Email: <a href={`mailto:${item.email}?subject=Re: Outreacio Inquiry`} style={{ color: 'var(--accent, #f48d16)', fontWeight: '700', textDecoration: 'none' }}>{item.email}</a>
                            </span>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={12} /> {new Date(item.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <a
                          href={`mailto:${item.email}?subject=Re: Outreacio Inquiry - ${encodeURIComponent(item.name)}`}
                          onClick={() => {
                            if (isUnread) {
                              handleContactStatus(item.id, 'replied');
                            }
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'var(--accent, #f48d16)',
                            color: '#ffffff',
                            textDecoration: 'none',
                            padding: '8px 16px',
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: '700',
                            boxShadow: '0 4px 12px rgba(244, 141, 22, 0.25)'
                          }}
                        >
                          <Mail size={14} /> Reply via Email
                        </a>

                        {isUnread ? (
                          <button
                            type="button"
                            onClick={() => handleContactStatus(item.id, 'read')}
                            style={{
                              background: 'var(--bg-surface)',
                              border: '1px solid var(--border)',
                              padding: '8px 14px',
                              borderRadius: '10px',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              color: 'var(--text-primary)'
                            }}
                          >
                            Mark Read
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleContactStatus(item.id, 'unread')}
                            style={{
                              background: 'var(--bg-surface)',
                              border: '1px solid var(--border)',
                              padding: '8px 14px',
                              borderRadius: '10px',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              color: 'var(--text-secondary)'
                            }}
                          >
                            Mark Unread
                          </button>
                        )}

                        {!isReplied && (
                          <button
                            type="button"
                            onClick={() => handleContactStatus(item.id, 'replied')}
                            style={{
                              background: 'var(--success-bg, rgba(34, 197, 94, 0.1))',
                              border: '1px solid var(--success-border, rgba(34, 197, 94, 0.3))',
                              padding: '8px 14px',
                              borderRadius: '10px',
                              fontSize: '13px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              color: 'var(--success, #15803d)'
                            }}
                          >
                            Mark Replied
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteContact(item.id)}
                          title="Delete message permanently"
                          style={{
                            background: 'var(--error-bg, rgba(239, 68, 68, 0.08))',
                            border: '1px solid var(--error-border, rgba(239, 68, 68, 0.2))',
                            padding: '8px 12px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            color: 'var(--error, #dc2626)'
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Inquiry Message Box */}
                    <div style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '14px',
                      padding: '16px 20px',
                      fontSize: '14px',
                      lineHeight: 1.65,
                      color: 'var(--text-primary)',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {item.message}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL: Screenshot Proof Viewer
         ========================================================================= */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            cursor: 'zoom-out'
          }}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '92vw',
              maxHeight: '90vh',
              background: '#1a1a1a',
              borderRadius: '16px',
              padding: '12px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <img
              src={previewImage}
              alt="Payment Screenshot Proof"
              style={{
                maxWidth: '100%',
                maxHeight: '82vh',
                borderRadius: '10px',
                objectFit: 'contain',
                display: 'block'
              }}
            />

            <button
              onClick={() => setPreviewImage(null)}
              title="Close Preview"
              style={{
                position: 'absolute',
                top: '-16px',
                right: '-16px',
                background: '#000000',
                color: '#ffffff',
                border: '2px solid #ffffff',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: Rejection Reason & Guidance
         ========================================================================= */}
      {rejectingItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-white, #ffffff)',
            borderRadius: '22px',
            padding: '32px',
            maxWidth: '520px',
            width: '100%',
            boxShadow: 'var(--shadow-hover)',
            border: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--error-bg)',
                color: 'var(--error, #dc2626)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <XCircle size={22} />
              </div>

              <h3 style={{ fontSize: '19px', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                Reject Payment Submission
              </h3>
            </div>

            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '18px', lineHeight: 1.55 }}>
              Specify why the submission for <strong>{rejectingItem.user_email}</strong> is being rejected. This explanation will be emailed to the user so they can take corrective action.
            </p>

            {/* Quick Reason Template Chips */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Quick Templates:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {quickRejectionTemplates.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRejectionReason(tpl)}
                    style={{
                      background: rejectionReason === tpl ? 'var(--accent-light)' : 'var(--bg-surface)',
                      border: `1px solid ${rejectionReason === tpl ? 'var(--accent)' : 'var(--border)'}`,
                      color: rejectionReason === tpl ? 'var(--accent)' : 'var(--text-secondary)',
                      borderRadius: '8px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    {tpl}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={3}
              placeholder="Type custom rejection note or explanation..."
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1.5px solid var(--border-strong)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: '13.5px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                outline: 'none',
                marginBottom: '20px'
              }}
            />

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setRejectingItem(null);
                  setRejectionReason('');
                }}
                disabled={actionInProgress}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-secondary)',
                  fontWeight: '600',
                  fontSize: '13.5px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleRejectSubmit}
                disabled={actionInProgress}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#dc2626',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '13.5px',
                  cursor: actionInProgress ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)'
                }}
              >
                {actionInProgress ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Processing…</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Rejection &amp; Notify</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
