import React, { useState, useEffect } from 'react';
import { fetchAdminPayments, reviewPaymentSubmission } from '../api/planService';
import { Check, X, Eye, Copy, RefreshCw, Lock, ShieldCheck, AlertCircle, ExternalLink } from 'lucide-react';

export default function AdminPaymentsPage({ onNavigateHome }) {
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem('outreacio_admin_key') || '');
  const [keyInput, setKeyInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history'

  // Modal for screenshot preview
  const [previewImage, setPreviewImage] = useState(null);

  // Modal for rejection reason
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);
  const [copiedUtr, setCopiedUtr] = useState('');

  const loadPayments = async (keyToUse) => {
    const key = keyToUse ?? adminKey;
    setLoading(true);
    setError('');
    try {
      const data = await fetchAdminPayments(key);
      if (data.success) {
        setIsAuthenticated(true);
        setSubmissions(data.submissions || []);
        setStats(data.stats || { pending: 0, approved: 0, rejected: 0 });
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
      loadPayments(adminKey);
    }
  }, [adminKey]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    const cleanKey = keyInput.trim();
    sessionStorage.setItem('outreacio_admin_key', cleanKey);
    setAdminKey(cleanKey);
    loadPayments(cleanKey);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('outreacio_admin_key');
    setAdminKey('');
    setIsAuthenticated(false);
    setSubmissions([]);
  };

  const handleApprove = async (submission) => {
    if (!window.confirm(`Confirm approval of ${submission.plan_id.toUpperCase()} plan for ${submission.user_email}? This will activate their subscription immediately and send an activation receipt.`)) {
      return;
    }

    setActionInProgress(true);
    try {
      await reviewPaymentSubmission(submission.id, 'approve', '', adminKey);
      await loadPayments();
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
      await loadPayments();
    } catch (err) {
      alert(`Rejection error: ${err.message}`);
    } finally {
      setActionInProgress(false);
    }
  };

  const copyUtr = (utr) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(utr);
    setTimeout(() => setCopiedUtr(''), 2000);
  };

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const historySubmissions = submissions.filter(s => s.status !== 'pending');
  const displayedSubmissions = activeTab === 'pending' ? pendingSubmissions : historySubmissions;

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
            Admin Payments Portal
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
            Manual UPI Verification Bridge &bull; Enter your admin secret key to access pending payment proofs.
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input
              type="password"
              placeholder="Enter Admin Secret Key"
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              style={{
                padding: '12px 16px', borderRadius: '12px', border: '1.5px solid var(--border)',
                background: 'var(--bg-surface)', fontSize: '14px', outline: 'none'
              }}
            />

            {error && (
              <div style={{ fontSize: '12.5px', color: '#ef4444', textAlign: 'left', fontWeight: '500' }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px', borderRadius: '12px', border: 'none',
                background: 'var(--primary, #6366f1)', color: '#fff',
                fontSize: '14.5px', fontWeight: '700', cursor: 'pointer'
              }}
            >
              {loading ? 'Authenticating…' : 'Access Admin Dashboard →'}
            </button>
          </form>

          <div style={{ marginTop: '20px', fontSize: '12px', color: 'var(--text-muted)' }}>
            Default development key: <code>outreacio-admin-2026</code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '36px 20px 80px', fontFamily: 'inherit' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
              Manual UPI Payment Verification
            </h1>
            <span style={{
              background: '#fef3c7', color: '#92400e', fontSize: '11px', fontWeight: '700',
              padding: '3px 10px', borderRadius: '99px', textTransform: 'uppercase'
            }}>
              Bridge Mode
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Human-in-the-loop payment verification before Razorpay integration.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => loadPayments()}
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
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer',
            fontSize: '14.5px', fontWeight: activeTab === 'pending' ? '800' : '600',
            color: activeTab === 'pending' ? 'var(--primary, #6366f1)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'pending' ? '2.5px solid var(--primary, #6366f1)' : '2.5px solid transparent'
          }}
        >
          Pending Review ({pendingSubmissions.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer',
            fontSize: '14.5px', fontWeight: activeTab === 'history' ? '800' : '600',
            color: activeTab === 'history' ? 'var(--primary, #6366f1)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'history' ? '2.5px solid var(--primary, #6366f1)' : '2.5px solid transparent'
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
            {activeTab === 'pending' ? 'All caught up!' : 'No previous submissions yet.'}
          </h3>
          <p style={{ fontSize: '14px', margin: 0 }}>
            {activeTab === 'pending' ? 'There are no pending payment proofs awaiting manual verification.' : ''}
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
                display: 'grid',
                gridTemplateColumns: 'minmax(220px, 1.2fr) minmax(140px, 0.8fr) minmax(180px, 1fr) minmax(100px, 0.7fr) minmax(160px, 1fr)',
                alignItems: 'center',
                gap: '16px',
                boxShadow: sub.status === 'pending' ? '0 4px 16px rgba(245, 158, 11, 0.08)' : 'none'
              }}
            >
              {/* User info */}
              <div>
                <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-primary)' }}>
                  {sub.payer_name || 'Customer'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px', wordBreak: 'break-all' }}>
                  {sub.user_email}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Submitted: {new Date(sub.created_at).toLocaleString()}
                </div>
              </div>

              {/* Plan info */}
              <div>
                <span style={{
                  display: 'inline-block',
                  background: sub.plan_id === 'pro' ? 'linear-gradient(90deg, #6366f1, #7c3aed)' : 'var(--bg-surface)',
                  color: sub.plan_id === 'pro' ? '#fff' : 'var(--text-primary)',
                  fontSize: '12px', fontWeight: '800', padding: '4px 10px', borderRadius: '8px',
                  textTransform: 'uppercase'
                }}>
                  {sub.plan_id}
                </span>
                <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '4px' }}>
                  ${sub.amount_usd}/mo
                </div>
              </div>

              {/* UTR reference with 1-click copy */}
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '2px' }}>
                  Bank UTR Reference
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <code style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)', background: 'var(--bg-surface)', padding: '3px 6px', borderRadius: '6px' }}>
                    {sub.utr_reference}
                  </code>
                  <button
                    onClick={() => copyUtr(sub.utr_reference)}
                    title="Copy UTR"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedUtr === sub.utr_reference ? '#16a34a' : 'var(--text-muted)', padding: '2px' }}
                  >
                    {copiedUtr === sub.utr_reference ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Screenshot thumbnail */}
              <div>
                {sub.screenshot_url ? (
                  <button
                    onClick={() => setPreviewImage(sub.screenshot_url)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-surface)',
                      border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 10px',
                      fontSize: '12px', fontWeight: '600', cursor: 'pointer', color: 'var(--text-primary)'
                    }}
                  >
                    <Eye size={14} />
                    View Proof
                  </button>
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No screenshot</span>
                )}
              </div>

              {/* Action Buttons or Status */}
              <div style={{ textAlign: 'right' }}>
                {sub.status === 'pending' ? (
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleApprove(sub)}
                      disabled={actionInProgress}
                      style={{
                        padding: '8px 14px', borderRadius: '10px', border: 'none',
                        background: '#16a34a', color: '#fff', fontSize: '13px', fontWeight: '700',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                      }}
                    >
                      <Check size={14} /> Approve
                    </button>
                    <button
                      onClick={() => { setRejectingItem(sub); setRejectionReason(''); }}
                      disabled={actionInProgress}
                      style={{
                        padding: '8px 14px', borderRadius: '10px', border: 'none',
                        background: '#ef4444', color: '#fff', fontSize: '13px', fontWeight: '700',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                      }}
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                ) : (
                  <div>
                    <span style={{
                      fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '8px',
                      textTransform: 'uppercase',
                      background: sub.status === 'approved' ? 'rgba(22, 163, 74, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: sub.status === 'approved' ? '#16a34a' : '#dc2626'
                    }}>
                      {sub.status}
                    </span>
                    {sub.rejection_reason && (
                      <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px' }}>
                        {sub.rejection_reason}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Screenshot Preview Modal */}
      {previewImage && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }} onClick={() => setPreviewImage(null)}>
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img
              src={previewImage}
              alt="Payment Proof"
              style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
            />
            <button
              onClick={() => setPreviewImage(null)}
              style={{
                position: 'absolute', top: '-14px', right: '-14px', background: '#fff',
                border: 'none', borderRadius: '50%', width: '32px', height: '32px',
                fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
            >
              ✕
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
