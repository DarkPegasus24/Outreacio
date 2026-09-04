import React, { useState, useEffect } from 'react';
import {
  fetchAdminPayments,
  reviewPaymentSubmission,
  fetchAdminContacts,
  updateAdminContactStatus,
  deleteAdminContactMessage
} from '../api/planService';
import {
  Check, X, Eye, Copy, RefreshCw, Lock, ShieldCheck,
  AlertCircle, ExternalLink, Mail, MessageSquare, Trash2, CheckCircle2, User, Clock
} from 'lucide-react';

export default function AdminPaymentsPage({ onNavigateHome }) {
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem('outreacio_admin_key') || '');
  const [keyInput, setKeyInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Section Navigation
  const [mainSection, setMainSection] = useState('payments'); // 'payments' | 'contacts'

  // Payment Submissions State
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [paymentTab, setPaymentTab] = useState('pending'); // 'pending' | 'history'

  // Contact Inquiries State
  const [contacts, setContacts] = useState([]);
  const [contactStats, setContactStats] = useState({ total: 0, unread: 0, read: 0, replied: 0 });
  const [contactTab, setContactTab] = useState('unread'); // 'unread' | 'all' | 'replied'

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modal for screenshot preview
  const [previewImage, setPreviewImage] = useState(null);

  // Modal for rejection reason
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);
  const [copiedUtr, setCopiedUtr] = useState('');

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
      setError(err.message || 'Authentication failed. Please verify your admin key.');
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

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const historySubmissions = submissions.filter(s => s.status !== 'pending');
  const displayedSubmissions = paymentTab === 'pending' ? pendingSubmissions : historySubmissions;

  const filteredContacts = contacts.filter(c => {
    if (contactTab === 'unread') return c.status === 'unread';
    if (contactTab === 'replied') return c.status === 'replied';
    return true; // 'all'
  });

  // Unauthenticated Admin Passcode Screen
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{
          background: 'var(--bg-white, #fff)',
          borderRadius: '24px',
          padding: '36px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
          border: '1.5px solid var(--border)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '54px', height: '54px', borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(244,141,22,0.15), rgba(244,141,22,0.3))',
            color: '#f48d16', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Lock size={26} />
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 6px', color: 'var(--text-primary)' }}>
            Admin Portal
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
            Manual UPI Verifications &bull; Contact Inquiries &bull; Enter your admin secret key to access.
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input
              type="password"
              placeholder="Enter Admin Secret Key"
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '12px',
                border: '1.5px solid var(--border)', background: 'var(--bg-surface)',
                fontSize: '14px', outline: 'none', boxSizing: 'border-box'
              }}
            />

            {error && (
              <div style={{ color: '#dc2626', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, #f48d16, #e07d0a)',
                color: '#fff', fontSize: '14.5px', fontWeight: '700', cursor: 'pointer'
              }}
            >
              {loading ? 'Authenticating…' : 'Access Admin Dashboard →'}
            </button>
          </form>

          <div style={{ marginTop: '20px', fontSize: '12.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span>Default key: <code>outreacio-admin-2026</code></span>
            <button
              type="button"
              onClick={() => {
                setKeyInput('outreacio-admin-2026');
                sessionStorage.setItem('outreacio_admin_key', 'outreacio-admin-2026');
                setAdminKey('outreacio-admin-2026');
                loadData('outreacio-admin-2026');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent, #f48d16)',
                cursor: 'pointer',
                fontWeight: '700',
                textDecoration: 'underline',
                padding: 0,
                fontSize: '12px'
              }}
            >
              (Click to Autofill &amp; Login)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '36px 20px 80px', fontFamily: 'inherit' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
              Outreacio Admin Dashboard
            </h1>
            <span style={{
              background: '#fef3c7', color: '#92400e', fontSize: '11px', fontWeight: '700',
              padding: '3px 10px', borderRadius: '99px', textTransform: 'uppercase'
            }}>
              Active Session
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Manage manual payment verifications and respond to customer contact inquiries.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => loadData()}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px',
              borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-white, #fff)',
              color: 'var(--text-primary)', fontWeight: '600', fontSize: '13px', cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '9px 16px', borderRadius: '10px', border: 'none',
              background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', fontWeight: '600', fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Lock Admin
          </button>
        </div>
      </div>

      {/* Main Section Switcher: Payments vs Contacts */}
      <div style={{
        display: 'flex',
        gap: '8px',
        background: 'var(--bg-surface)',
        padding: '6px',
        borderRadius: '14px',
        border: '1px solid var(--border)',
        marginBottom: '28px',
        width: 'fit-content'
      }}>
        <button
          type="button"
          onClick={() => setMainSection('payments')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: 'none',
            background: mainSection === 'payments' ? 'var(--bg-white, #fff)' : 'transparent',
            color: mainSection === 'payments' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: '700',
            fontSize: '14px',
            padding: '8px 18px',
            borderRadius: '10px',
            cursor: 'pointer',
            boxShadow: mainSection === 'payments' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <span>💳 UPI Payment Proofs</span>
          {stats.pending > 0 && (
            <span style={{
              background: '#d97706',
              color: '#fff',
              fontSize: '11px',
              padding: '2px 7px',
              borderRadius: '99px'
            }}>
              {stats.pending}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setMainSection('contacts')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: 'none',
            background: mainSection === 'contacts' ? 'var(--bg-white, #fff)' : 'transparent',
            color: mainSection === 'contacts' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: '700',
            fontSize: '14px',
            padding: '8px 18px',
            borderRadius: '10px',
            cursor: 'pointer',
            boxShadow: mainSection === 'contacts' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          <span>📬 User Inquiries</span>
          {contactStats.unread > 0 && (
            <span style={{
              background: '#f48d16',
              color: '#fff',
              fontSize: '11px',
              padding: '2px 7px',
              borderRadius: '99px'
            }}>
              {contactStats.unread} new
            </span>
          )}
        </button>
      </div>

      {/* ================= SECTION 1: PAYMENTS ================= */}
      {mainSection === 'payments' && (
        <>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            <div style={{ background: 'var(--bg-white, #fff)', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Pending Verification
              </div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: stats.pending > 0 ? '#d97706' : 'var(--text-primary)' }}>
                {stats.pending}
              </div>
            </div>

            <div style={{ background: 'var(--bg-white, #fff)', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Approved (Active)
              </div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#16a34a' }}>
                {stats.approved}
              </div>
            </div>

            <div style={{ background: 'var(--bg-white, #fff)', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Rejected
              </div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#dc2626' }}>
                {stats.rejected}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '10px', borderBottom: '1.5px solid var(--border)', marginBottom: '20px', paddingBottom: '2px' }}>
            <button
              onClick={() => setPaymentTab('pending')}
              style={{
                padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer',
                fontSize: '14.5px', fontWeight: paymentTab === 'pending' ? '800' : '600',
                color: paymentTab === 'pending' ? 'var(--primary, #6366f1)' : 'var(--text-secondary)',
                borderBottom: paymentTab === 'pending' ? '2.5px solid var(--primary, #6366f1)' : '2.5px solid transparent'
              }}
            >
              Pending Review ({pendingSubmissions.length})
            </button>
            <button
              onClick={() => setPaymentTab('history')}
              style={{
                padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer',
                fontSize: '14.5px', fontWeight: paymentTab === 'history' ? '800' : '600',
                color: paymentTab === 'history' ? 'var(--primary, #6366f1)' : 'var(--text-secondary)',
                borderBottom: paymentTab === 'history' ? '2.5px solid var(--primary, #6366f1)' : '2.5px solid transparent'
              }}
            >
              History &amp; Resolved ({historySubmissions.length})
            </button>
          </div>

          {/* Submissions List */}
          {displayedSubmissions.length === 0 ? (
            <div style={{
              background: 'var(--bg-white, #fff)', border: '1.5px solid var(--border)', borderRadius: '20px',
              padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)'
            }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>✓</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 6px', color: 'var(--text-primary)' }}>
                {paymentTab === 'pending' ? 'All caught up!' : 'No previous submissions yet.'}
              </h3>
              <p style={{ fontSize: '14px', margin: 0 }}>
                {paymentTab === 'pending' ? 'There are no pending payment proofs awaiting manual verification.' : ''}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {displayedSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  style={{
                    background: 'var(--bg-white, #fff)',
                    border: sub.status === 'pending' ? '1.5px solid #fde68a' : '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '20px 24px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    boxShadow: sub.status === 'pending' ? '0 4px 20px rgba(217, 119, 6, 0.08)' : 'none'
                  }}
                >
                  {/* User & Plan Info */}
                  <div style={{ minWidth: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800',
                        textTransform: 'uppercase',
                        background: sub.plan_id === 'pro' ? 'linear-gradient(90deg, #f48d16, #e07d0a)' : 'var(--bg-surface)',
                        color: sub.plan_id === 'pro' ? '#fff' : 'var(--text-primary)',
                      }}>
                        {sub.plan_id} Plan
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {new Date(sub.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-primary)' }}>
                      {sub.payer_name || 'Subscriber'}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {sub.user_email}
                    </div>
                  </div>

                  {/* UTR Reference & Screenshot Proof */}
                  <div style={{ minWidth: '200px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '2px' }}>
                      Transaction UTR
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontFamily: 'monospace', fontWeight: '700', fontSize: '14px',
                        background: 'var(--bg-surface)', padding: '3px 8px', borderRadius: '6px',
                        border: '1px solid var(--border)'
                      }}>
                        {sub.utr_reference}
                      </span>
                      <button
                        onClick={() => copyUtr(sub.utr_reference)}
                        title="Copy UTR"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedUtr === sub.utr_reference ? '#16a34a' : 'var(--text-secondary)', padding: '2px' }}
                      >
                        {copiedUtr === sub.utr_reference ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    {sub.screenshot_url && (
                      <button
                        onClick={() => setPreviewImage(sub.screenshot_url)}
                        style={{
                          marginTop: '6px', background: 'none', border: 'none', cursor: 'pointer',
                          color: '#0284c7', fontSize: '12.5px', fontWeight: '600', padding: 0,
                          display: 'flex', alignItems: 'center', gap: '4px'
                        }}
                      >
                        <Eye size={13} /> View Screenshot Proof
                      </button>
                    )}
                  </div>

                  {/* Status & Review Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {sub.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleApprove(sub)}
                          disabled={actionInProgress}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: '#16a34a', color: '#fff', border: 'none', borderRadius: '10px',
                            padding: '9px 16px', fontSize: '13.5px', fontWeight: '700', cursor: 'pointer'
                          }}
                        >
                          <Check size={15} /> Approve &amp; Activate
                        </button>
                        <button
                          onClick={() => setRejectingItem(sub)}
                          disabled={actionInProgress}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '10px', padding: '9px 14px', fontSize: '13.5px', fontWeight: '600', cursor: 'pointer'
                          }}
                        >
                          <X size={15} /> Reject
                        </button>
                      </>
                    ) : (
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: '700',
                          textTransform: 'uppercase',
                          background: sub.status === 'approved' ? 'rgba(22, 163, 74, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: sub.status === 'approved' ? '#16a34a' : '#dc2626'
                        }}>
                          {sub.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                        </span>
                        {sub.rejection_reason && (
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '200px' }}>
                            Reason: {sub.rejection_reason}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ================= SECTION 2: CONTACT INQUIRIES ================= */}
      {mainSection === 'contacts' && (
        <>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            <div style={{ background: 'var(--bg-white, #fff)', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Unread Messages
              </div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: contactStats.unread > 0 ? '#f48d16' : 'var(--text-primary)' }}>
                {contactStats.unread}
              </div>
            </div>

            <div style={{ background: 'var(--bg-white, #fff)', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Replied / Handled
              </div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#16a34a' }}>
                {contactStats.replied}
              </div>
            </div>

            <div style={{ background: 'var(--bg-white, #fff)', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Total Received
              </div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)' }}>
                {contactStats.total}
              </div>
            </div>
          </div>

          {/* Subtabs for Contacts */}
          <div style={{ display: 'flex', gap: '10px', borderBottom: '1.5px solid var(--border)', marginBottom: '20px', paddingBottom: '2px' }}>
            <button
              onClick={() => setContactTab('unread')}
              style={{
                padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer',
                fontSize: '14.5px', fontWeight: contactTab === 'unread' ? '800' : '600',
                color: contactTab === 'unread' ? 'var(--accent, #f48d16)' : 'var(--text-secondary)',
                borderBottom: contactTab === 'unread' ? '2.5px solid var(--accent, #f48d16)' : '2.5px solid transparent'
              }}
            >
              Unread ({contactStats.unread})
            </button>
            <button
              onClick={() => setContactTab('all')}
              style={{
                padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer',
                fontSize: '14.5px', fontWeight: contactTab === 'all' ? '800' : '600',
                color: contactTab === 'all' ? 'var(--accent, #f48d16)' : 'var(--text-secondary)',
                borderBottom: contactTab === 'all' ? '2.5px solid var(--accent, #f48d16)' : '2.5px solid transparent'
              }}
            >
              All Inquiries ({contactStats.total})
            </button>
            <button
              onClick={() => setContactTab('replied')}
              style={{
                padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer',
                fontSize: '14.5px', fontWeight: contactTab === 'replied' ? '800' : '600',
                color: contactTab === 'replied' ? 'var(--accent, #f48d16)' : 'var(--text-secondary)',
                borderBottom: contactTab === 'replied' ? '2.5px solid var(--accent, #f48d16)' : '2.5px solid transparent'
              }}
            >
              Replied ({contactStats.replied})
            </button>
          </div>

          {/* Contact Inquiries Cards */}
          {filteredContacts.length === 0 ? (
            <div style={{
              background: 'var(--bg-white, #fff)', border: '1.5px solid var(--border)', borderRadius: '20px',
              padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)'
            }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>📬</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 6px', color: 'var(--text-primary)' }}>
                {contactTab === 'unread' ? 'No unread messages' : 'No messages found.'}
              </h3>
              <p style={{ fontSize: '14px', margin: 0 }}>
                {contactTab === 'unread' ? 'All contact requests have been reviewed or replied to.' : ''}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredContacts.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--bg-white, #fff)',
                    border: item.status === 'unread' ? '1.5px solid #fed7aa' : '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: item.status === 'unread' ? '0 4px 20px rgba(244, 141, 22, 0.08)' : 'none'
                  }}
                >
                  {/* Top Header of Card */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)' }}>
                          {item.name}
                        </span>
                        <span style={{
                          padding: '3px 9px', borderRadius: '99px', fontSize: '11px', fontWeight: '700',
                          textTransform: 'uppercase',
                          background: item.status === 'unread' ? '#ffedd5' : (item.status === 'replied' ? '#dcfce7' : '#e0f2fe'),
                          color: item.status === 'unread' ? '#c2410c' : (item.status === 'replied' ? '#15803d' : '#0369a1')
                        }}>
                          {item.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span>
                          Email: <a href={`mailto:${item.email}?subject=Re: Outreacio Inquiry`} style={{ color: 'var(--accent, #f48d16)', fontWeight: '600', textDecoration: 'none' }}>{item.email}</a>
                        </span>
                        <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} /> {new Date(item.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions on this message */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <a
                        href={`mailto:${item.email}?subject=Re: Outreacio Inquiry - ${encodeURIComponent(item.name)}`}
                        onClick={() => {
                          if (item.status === 'unread') {
                            handleContactStatus(item.id, 'replied');
                          }
                        }}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          background: 'var(--accent, #f48d16)', color: '#fff', textDecoration: 'none',
                          padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '700'
                        }}
                      >
                        <Mail size={14} /> Reply via Email
                      </a>

                      {item.status === 'unread' ? (
                        <button
                          type="button"
                          onClick={() => handleContactStatus(item.id, 'read')}
                          style={{
                            background: 'var(--bg-surface)', border: '1px solid var(--border)',
                            padding: '7px 12px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '600',
                            cursor: 'pointer', color: 'var(--text-primary)'
                          }}
                        >
                          Mark as Read
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleContactStatus(item.id, 'unread')}
                          style={{
                            background: 'var(--bg-surface)', border: '1px solid var(--border)',
                            padding: '7px 12px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '600',
                            cursor: 'pointer', color: 'var(--text-secondary)'
                          }}
                        >
                          Mark Unread
                        </button>
                      )}

                      {item.status !== 'replied' && (
                        <button
                          type="button"
                          onClick={() => handleContactStatus(item.id, 'replied')}
                          style={{
                            background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)',
                            padding: '7px 12px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '600',
                            cursor: 'pointer', color: '#15803d'
                          }}
                        >
                          Mark Replied
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteContact(item.id)}
                        title="Delete Message"
                        style={{
                          background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)',
                          padding: '7px 10px', borderRadius: '8px', cursor: 'pointer', color: '#dc2626'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Message Content Box */}
                  <div style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '16px 18px',
                    fontSize: '14.5px',
                    lineHeight: 1.6,
                    color: 'var(--text-primary)',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {item.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Screenshot Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', cursor: 'zoom-out'
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <img
              src={previewImage}
              alt="Payment Screenshot Proof"
              style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '12px', objectFit: 'contain' }}
            />
            <button
              onClick={() => setPreviewImage(null)}
              style={{
                position: 'absolute', top: '-14px', right: '-14px', background: '#251f19',
                color: '#fff', border: '2px solid #fff', borderRadius: '50%', width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Rejection Prompt Modal */}
      {rejectingItem && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-white, #fff)', borderRadius: '20px', padding: '28px',
            maxWidth: '460px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 8px', color: '#dc2626' }}>
              Reject Payment Submission
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
              Enter a reason for rejecting the submission for <strong>{rejectingItem.user_email}</strong>. This explanation will be included in the guidance email sent to the user.
            </p>

            <textarea
              rows={3}
              placeholder="e.g. Transaction UTR reference could not be found in our bank statement. Please verify the 12-digit number and resubmit."
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              style={{
                width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid var(--border)',
                background: 'var(--bg-surface)', fontSize: '13.5px', fontFamily: 'inherit', boxSizing: 'border-box',
                outline: 'none', marginBottom: '18px'
              }}
            />

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setRejectingItem(null)}
                disabled={actionInProgress}
                style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'none', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={actionInProgress}
                style={{ padding: '10px 18px', borderRadius: '10px', border: 'none', background: '#dc2626', color: '#fff', fontWeight: '700', cursor: 'pointer' }}
              >
                {actionInProgress ? 'Sending Notice…' : 'Confirm Rejection & Email User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
