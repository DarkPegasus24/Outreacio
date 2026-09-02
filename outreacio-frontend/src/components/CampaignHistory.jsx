import React, { useState, useEffect } from 'react';
import { History, RefreshCw, Trash2, Search, CheckCircle2, XCircle, Clock, Mail, AlertCircle, Sparkles } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function CampaignHistory({ csrfToken, onSwitchToNewCampaign }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const getAuthHeader = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
  };

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const authHeader = await getAuthHeader();
      const res = await fetch('/api/campaign-history', { headers: { ...authHeader } });
      const json = await res.json();
      if (res.ok && json.success) {
        setHistory(json.data || []);
      } else {
        setError(json.error || 'Failed to fetch campaign history');
      }
    } catch (err) {
      setError(err.message || 'Network error fetching history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campaign record?')) return;

    setDeletingId(id);
    try {
      const authHeader = await getAuthHeader();
      const res = await fetch(`/api/campaign-history/${id}`, {
        method: 'DELETE',
        headers: {
          'x-csrf-token': csrfToken || '',
          ...authHeader
        }
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setHistory((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert(`Failed to delete record: ${json.error || 'Unknown error'}`);
      }
    } catch (err) {
      alert(`Network error: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateStr;
    }
  };

  const filteredHistory = history.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      (item.subject || '').toLowerCase().includes(q) ||
      (item.sender_email || '').toLowerCase().includes(q) ||
      (item.status || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="parley-card" style={{
      background: 'var(--bg-white)',
      border: '1px solid var(--border)',
      borderRadius: '20px',
      padding: '28px 32px',
      boxShadow: '0 12px 36px rgba(37, 31, 25, 0.05)',
      maxWidth: '960px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '22px',
        flexWrap: 'wrap',
        gap: '14px',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--border)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--accent-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)'
            }}>
              <History size={18} />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
              Campaign History
            </h2>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
            Audit log of all past email sending campaigns and deliverability performance.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={fetchHistory}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={13} className={loading ? 'spinning' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {history.length > 0 && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by subject, sender email, or status..."
              className="form-input"
              style={{ paddingLeft: '34px', fontSize: '13.5px', height: '40px', width: '100%' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && history.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} className="spinning" style={{ margin: '0 auto 12px', color: 'var(--accent)' }} />
          <p style={{ fontSize: '14.5px' }}>Loading campaign history from Supabase...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{
          padding: '14px 18px',
          borderRadius: '10px',
          background: 'rgba(226, 75, 74, 0.08)',
          border: '1px solid rgba(226, 75, 74, 0.25)',
          color: 'var(--error)',
          fontSize: '13.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '20px'
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
          <button
            type="button"
            onClick={fetchHistory}
            className="btn btn-secondary btn-sm"
            style={{ marginLeft: 'auto' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && history.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '56px 24px',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--border-strong)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'var(--accent-light)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent)',
            marginBottom: '14px'
          }}>
            <History size={24} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '6px' }}>
            No campaigns sent yet
          </h3>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 20px' }}>
            When you complete or cancel an email campaign, a permanent record with deliverability statistics will appear here.
          </p>
          {onSwitchToNewCampaign && (
            <button
              type="button"
              onClick={onSwitchToNewCampaign}
              className="btn btn-primary btn-sm"
              style={{ padding: '8px 20px' }}
            >
              <span>Start Your First Campaign</span>
            </button>
          )}
        </div>
      )}

      {/* History Table */}
      {!loading && history.length > 0 && (
        <div style={{
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          background: 'var(--bg-white)'
        }}>
          <div className="table-responsive-container" style={{ overflowX: 'auto', maxHeight: '480px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px', minWidth: '720px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-hover)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 14px', color: 'var(--text-secondary)', fontWeight: '600' }}>Date &amp; Time</th>
                  <th style={{ padding: '12px 14px', color: 'var(--text-secondary)', fontWeight: '600' }}>Subject</th>
                  <th style={{ padding: '12px 14px', color: 'var(--text-secondary)', fontWeight: '600' }}>Sender</th>
                  <th style={{ padding: '12px 14px', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'center' }}>Sent / Total</th>
                  <th style={{ padding: '12px 14px', color: 'var(--text-secondary)', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '12px 14px', width: '50px', textAlign: 'center', color: 'var(--text-secondary)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--text-muted)' }}>
                      No campaigns matching "{searchQuery}".
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((item) => (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      {/* Date & Time */}
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', color: 'var(--text-primary)', fontWeight: '500' }}>
                        {formatDate(item.created_at)}
                      </td>

                      {/* Subject */}
                      <td style={{ padding: '12px 14px', maxWidth: '240px' }}>
                        <span
                          style={{
                            display: 'block',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontWeight: '600',
                            color: 'var(--text-primary)'
                          }}
                          title={item.subject}
                        >
                          {item.subject || '(No subject)'}
                        </span>
                        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                          Pacing: {(item.delay_ms / 1000).toFixed(1)}s delay
                        </span>
                      </td>

                      {/* Sender Email */}
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'block', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.sender_email}>
                          {item.sender_email}
                        </span>
                      </td>

                      {/* Sent / Total Count */}
                      <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: '700', color: item.sent_count > 0 ? '#128a4d' : 'var(--text-primary)' }}>
                            {item.sent_count}
                          </span>
                          <span style={{ color: 'var(--text-muted)' }}>/</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{item.total_recipients}</span>
                          {item.failed_count > 0 && (
                            <span style={{ fontSize: '11px', color: 'var(--error)', marginLeft: '4px' }}>
                              ({item.failed_count} failed)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        {item.status === 'completed' ? (
                          <span className="badge badge-success" style={{ fontSize: '12px', padding: '3px 8px' }}>
                            ✓ Completed
                          </span>
                        ) : item.status === 'cancelled' ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#e5e4dc',
                            color: '#5c554e',
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            fontSize: '11.5px',
                            fontWeight: '600'
                          }}>
                            Cancelled
                          </span>
                        ) : (
                          <span className="badge badge-danger" style={{ fontSize: '11.5px', padding: '3px 8px' }}>
                            {item.status || 'Failed'}
                          </span>
                        )}
                      </td>

                      {/* Delete Action */}
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="btn-icon"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '6px',
                            transition: 'all 0.15s ease'
                          }}
                          title="Delete record"
                        >
                          <Trash2 size={15} color={deletingId === item.id ? 'var(--text-muted)' : '#c42b2a'} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
