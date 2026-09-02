import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import { 
  Send, Clock, AlertTriangle, CheckCircle2, XCircle, StopCircle, 
  Download, Search, RefreshCw, ShieldAlert, Sparkles, Check, FileText,
  Mail, Timer, Zap, Info
} from 'lucide-react';

export default function CampaignMonitor({
  smtpConfig,
  subject,
  bodyHtml,
  attachments = [],
  recipients,
  throttleDelay,
  onThrottleChange,
  jobState,
  onStartCampaign,
  onCancelCampaign,
  onBack
}) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [logFilter, setLogFilter] = useState('all');
  const [logSearch, setLogSearch] = useState('');

  const validRecipients = recipients;
  const isSending = jobState.status === 'running';
  const isCompleted = jobState.status === 'completed';
  const isCancelled = jobState.status === 'cancelled';

  // Confetti on campaign completion
  React.useEffect(() => {
    if (isCompleted && jobState.sent > 0) {
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Fallback
      }
    }
  }, [isCompleted]);

  const progressPercent = jobState.total > 0
    ? Math.min(100, Math.round(((jobState.sent + jobState.failed) / jobState.total) * 100))
    : 0;

  const remainingCount = Math.max(0, jobState.total - (jobState.sent + jobState.failed));
  const estimatedSecondsLeft = Math.round((remainingCount * throttleDelay) / 1000);

  const formatEstimatedTime = (seconds) => {
    if (seconds <= 0) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const handleExportCsv = () => {
    if (!jobState.logs || jobState.logs.length === 0) return;

    const headers = ['Index', 'Company Name', 'Email', 'Status', 'Details', 'Timestamp'];
    const rows = jobState.logs.map(log => [
      log.index,
      `"${(log.companyName || '').replace(/"/g, '""')}"`,
      `"${(log.email || '').replace(/"/g, '""')}"`,
      `"${log.status}"`,
      `"${(log.details || '').replace(/"/g, '""')}"`,
      `"${log.timestamp}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `outreacio_campaign_report_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJson = () => {
    if (!jobState.logs || jobState.logs.length === 0) return;
    const blob = new Blob([JSON.stringify(jobState.logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `outreacio_campaign_report_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = (jobState.logs || []).filter(log => {
    if (logFilter === 'success') return log.status === 'success';
    if (logFilter === 'failed') return log.status === 'failed';
    return true;
  });

  return (
    <div className="parley-card" style={{
      background: 'var(--bg-white)',
      border: '1px solid var(--border)',
      borderRadius: '20px',
      padding: '28px 32px',
      boxShadow: '0 12px 36px rgba(37, 31, 25, 0.05)',
      maxWidth: '860px',
      margin: '0 auto'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '22px',
        flexWrap: 'wrap',
        gap: '12px',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--border)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
            Review &amp; Launch Campaign
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
            Review everything, configure rate limits, then hit send.
          </p>
        </div>

        <button
          type="button"
          disabled={isSending}
          onClick={onBack}
          className="btn btn-secondary btn-sm"
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          &larr; Back to Email Composer
        </button>
      </div>

      {/* Review Summary Box */}
      <div className="review-summary-grid" style={{
        background: '#f8f7f3',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '14px',
        fontSize: '13.5px'
      }}>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '12px', marginBottom: '2px' }}>Sending from</span>
          <strong
            style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}
            title={smtpConfig.user || 'Not connected'}
          >
            {smtpConfig.user || 'Not connected'}
          </strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '12px', marginBottom: '2px' }}>To</span>
          <strong
            style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}
            title={`${validRecipients.length} valid recipient${validRecipients.length === 1 ? '' : 's'}`}
          >
            {validRecipients.length} valid recipient{validRecipients.length === 1 ? '' : 's'}
          </strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '12px', marginBottom: '2px' }}>Subject</span>
          <strong
            style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}
            title={subject || '(No subject)'}
          >
            {subject || '(No subject)'}
          </strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '12px', marginBottom: '2px' }}>Delay pacing</span>
          <strong
            style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}
            title={`${(throttleDelay / 1000).toFixed(1)}s per email`}
          >
            {(throttleDelay / 1000).toFixed(1)}s per email
          </strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '12px', marginBottom: '2px' }}>Attachments</span>
          <strong
            style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}
            title={attachments.length > 0 ? `${attachments.length} file(s) (${(attachments.reduce((acc, f) => acc + (f.size || 0), 0) / (1024 * 1024)).toFixed(2)} MB)` : 'None'}
          >
            {attachments.length > 0
              ? `${attachments.length} file${attachments.length === 1 ? '' : 's'} (${(attachments.reduce((acc, f) => acc + (f.size || 0), 0) / (1024 * 1024)).toFixed(1)} MB)`
              : 'None'}
          </strong>
        </div>
      </div>

      {/* Throttle Controls & Summary Card */}
      <div style={{
        background: 'var(--bg-white)',
        padding: '18px 20px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div>
            <label className="form-label" style={{ marginBottom: 2, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} color="var(--accent)" /> Sending Speed:
              <strong style={{ color: 'var(--text-primary)', fontSize: '15px' }}> {(throttleDelay / 1000).toFixed(1)}s per email</strong>
            </label>
            <div style={{ fontSize: '12.5px', color: 'var(--text-primary)', marginTop: '2px', fontWeight: '500' }}>
              This means Outreacio waits {(throttleDelay / 1000).toFixed(1)} seconds between each email it sends.
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
              <Info size={12} color="var(--accent)" style={{ flexShrink: 0 }} />
              <span>Sending slower makes Gmail less likely to block or flag your account.</span>
            </div>
          </div>

          <div className="throttle-presets-row" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              disabled={isSending}
              onClick={() => onThrottleChange(500)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '12px', padding: '5px 12px', borderColor: throttleDelay === 500 ? 'var(--accent)' : undefined }}
            >
              Fast — higher risk
            </button>
            <button
              type="button"
              disabled={isSending}
              onClick={() => onThrottleChange(2000)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '12px', padding: '5px 12px', borderColor: throttleDelay === 2000 ? 'var(--accent)' : undefined }}
            >
              Recommended
            </button>
            <button
              type="button"
              disabled={isSending}
              onClick={() => onThrottleChange(5000)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '12px', padding: '5px 12px', borderColor: throttleDelay === 5000 ? 'var(--accent)' : undefined }}
            >
              Safest — slowest
            </button>
          </div>
        </div>

        <input
          type="range"
          min="200"
          max="15000"
          step="100"
          disabled={isSending}
          value={throttleDelay}
          onChange={(e) => onThrottleChange(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent)', cursor: isSending ? 'not-allowed' : 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
          <span>Fastest</span>
          <span>Balanced</span>
          <span>Slowest</span>
        </div>

        {/* Campaign Summary Pill Box */}
        <div style={{
          marginTop: '14px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          gap: '20px',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Mail size={14} color="var(--accent)" style={{ flexShrink: 0 }} />
            <span>Total Emails: <strong style={{ color: 'var(--text-primary)' }}>{validRecipients.length}</strong></span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Timer size={14} color="var(--accent)" style={{ flexShrink: 0 }} />
            <span>This will take about: <strong style={{ color: 'var(--text-primary)' }}>{formatEstimatedTime(Math.round((validRecipients.length * throttleDelay) / 1000))}</strong></span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={14} color="var(--accent)" style={{ flexShrink: 0 }} />
            <span>Speed: <strong style={{ color: 'var(--text-primary)' }}>1 email every {(throttleDelay / 1000).toFixed(1)} seconds</strong></span>
          </div>
        </div>
      </div>

      {/* Launch Banner */}
      {!isSending && !isCompleted && !isCancelled && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 22px',
          background: 'var(--accent-light)',
          border: '1px solid var(--accent-border)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div>
            <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
              Ready to send to {validRecipients.length} valid recipient{validRecipients.length === 1 ? '' : 's'}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Sending via Gmail ({smtpConfig.user || 'connected account'}) with {(throttleDelay / 1000).toFixed(1)}s delay between emails.
            </p>
          </div>

          <button
            type="button"
            disabled={validRecipients.length === 0 || !smtpConfig.user || !smtpConfig.pass || !subject || !bodyHtml}
            onClick={() => setShowConfirmModal(true)}
            className="btn btn-primary btn-lg"
          >
            <Send size={18} />
            <span>Launch Campaign ({validRecipients.length})</span>
          </button>
        </div>
      )}

      {/* Active Campaign Monitor Dashboard */}
      {(isSending || isCompleted || isCancelled || (jobState.logs && jobState.logs.length > 0)) && (
        <div style={{ background: 'var(--bg-white)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          {/* Header & Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isSending && (
                <span className="badge badge-accent" style={{ padding: '6px 12px', fontSize: '13px' }}>
                  <RefreshCw size={13} className="spinning" /> Sending Campaign...
                </span>
              )}
              {isCompleted && (
                <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: '13px' }}>
                  <CheckCircle2 size={13} /> Campaign Completed
                </span>
              )}
              {isCancelled && (
                <span className="badge badge-danger" style={{ padding: '6px 12px', fontSize: '13px' }}>
                  <XCircle size={13} /> Campaign Stopped
                </span>
              )}
              {isSending && (
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  ETA: <strong>{formatEstimatedTime(estimatedSecondsLeft)}</strong>
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isSending && (
                <button
                  type="button"
                  onClick={onCancelCampaign}
                  className="btn btn-danger btn-sm"
                >
                  <StopCircle size={14} /> Stop Campaign
                </button>
              )}
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={jobState.logs.length === 0}
                className="btn btn-secondary btn-sm"
                title="Export report as CSV"
              >
                <Download size={14} /> Export CSV
              </button>
              <button
                type="button"
                onClick={handleExportJson}
                disabled={jobState.logs.length === 0}
                className="btn btn-secondary btn-sm"
                title="Export report as JSON"
              >
                <FileText size={14} /> Export JSON
              </button>
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '13.5px',
              fontWeight: '600',
              marginBottom: '6px'
            }}>
              <span>Progress: {progressPercent}%</span>
              <span>{jobState.sent + jobState.failed} / {jobState.total} Processed</span>
            </div>

            <div style={{
              width: '100%',
              height: '10px',
              background: 'var(--bg-surface)',
              borderRadius: '9999px',
              overflow: 'hidden',
              border: '1px solid var(--border)'
            }}>
              <div style={{
                height: '100%',
                width: `${progressPercent}%`,
                background: 'var(--accent)',
                borderRadius: '9999px',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {/* Hero Metrics Tiles */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Total</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--text-primary)' }}>{jobState.total}</div>
            </div>
            <div style={{ background: 'var(--success-bg)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--success-border)', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#128a4d', textTransform: 'uppercase', fontWeight: '600' }}>Sent (Delivered)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#128a4d' }}>{jobState.sent}</div>
            </div>
            <div style={{ background: 'var(--error-bg)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--error-border)', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#c42b2a', textTransform: 'uppercase', fontWeight: '600' }}>Failed / Errors</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#c42b2a' }}>{jobState.failed}</div>
            </div>
            <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Remaining</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--text-primary)' }}>{remainingCount}</div>
            </div>
          </div>

          {/* Live Delivery Table */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700' }}>Live Delivery Stream ({jobState.logs.length})</h3>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    className="form-input"
                    style={{ paddingLeft: '26px', padding: '4px 8px 4px 26px', fontSize: '12px', width: '140px' }}
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setLogFilter('all')}
                  className="btn btn-sm"
                  style={{
                    fontSize: '12px',
                    padding: '3px 8px',
                    background: logFilter === 'all' ? 'var(--accent-light)' : 'var(--bg-surface)',
                    color: logFilter === 'all' ? 'var(--accent-hover)' : 'var(--text-secondary)'
                  }}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setLogFilter('success')}
                  className="btn btn-sm"
                  style={{
                    fontSize: '12px',
                    padding: '3px 8px',
                    background: logFilter === 'success' ? 'var(--success-bg)' : 'var(--bg-surface)',
                    color: logFilter === 'success' ? '#128a4d' : 'var(--text-secondary)'
                  }}
                >
                  Success
                </button>
                <button
                  type="button"
                  onClick={() => setLogFilter('failed')}
                  className="btn btn-sm"
                  style={{
                    fontSize: '12px',
                    padding: '3px 8px',
                    background: logFilter === 'failed' ? 'var(--error-bg)' : 'var(--bg-surface)',
                    color: logFilter === 'failed' ? '#c42b2a' : 'var(--text-secondary)'
                  }}
                >
                  Failed
                </button>
              </div>
            </div>

            <div className="table-responsive-container" style={{
              maxHeight: '440px',
              overflowY: 'auto',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'var(--bg-surface)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14.5px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface-hover)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <th style={{ padding: '11px 14px', width: '45px', color: 'var(--text-secondary)' }}>#</th>
                    <th style={{ padding: '11px 14px', color: 'var(--text-secondary)' }}>Company</th>
                    <th style={{ padding: '11px 14px', color: 'var(--text-secondary)' }}>Recipient Email</th>
                    <th style={{ padding: '11px 14px', width: '100px', color: 'var(--text-secondary)' }}>Status</th>
                    <th style={{ padding: '11px 14px', color: 'var(--text-secondary)' }}>Details</th>
                    <th style={{ padding: '11px 14px', width: '90px', color: 'var(--text-secondary)' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '32px 24px', color: 'var(--text-muted)' }}>
                        {isSending ? 'Sending in progress... First recipient log will appear shortly.' : 'No logs recorded yet.'}
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((item, idx) => (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: '1px solid var(--border)',
                          background: item.status === 'failed' ? 'var(--error-bg)' : 'var(--bg-white)'
                        }}
                      >
                        <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>{item.index}</td>
                        <td style={{ padding: '12px 14px', fontWeight: '500' }}>{item.companyName}</td>
                        <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '13.5px' }}>{item.email}</td>
                        <td style={{ padding: '12px 14px' }}>
                          {item.status === 'success' ? (
                            <span className="badge badge-success" style={{ fontSize: '12px', padding: '3px 8px' }}>✓ Sent</span>
                          ) : (
                            <span className="badge badge-danger" style={{ fontSize: '12px', padding: '3px 8px' }}>✗ Failed</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 14px', color: item.status === 'failed' ? 'var(--error)' : 'var(--text-secondary)', fontSize: '14px' }} title={item.details}>
                          {item.details}
                        </td>
                        <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '13px' }}>{item.timestamp}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal (Mounted to document.body via Portal to escape transformed ancestors) */}
      {showConfirmModal && createPortal(
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(37, 31, 25, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            background: 'var(--bg-white)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            boxShadow: '0 20px 40px rgba(37, 31, 25, 0.15)',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ background: 'var(--accent-light)', color: 'var(--accent)', padding: '8px', borderRadius: '8px' }}>
                <Send size={20} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Confirm Campaign Launch</h3>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              You are about to send <strong>{validRecipients.length} personalized emails</strong> via Gmail (<strong>{smtpConfig.user}</strong>) with a <strong>{(throttleDelay / 1000).toFixed(1)}s delay</strong> between emails.
            </p>

            <div style={{
              background: 'var(--warning-bg)',
              border: '1px solid var(--warning-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              fontSize: '13px',
              color: '#b45309',
              marginBottom: '20px',
              display: 'flex',
              gap: '8px'
            }}>
              <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>Only email people who agreed to be contacted. Sending unwanted bulk emails can get your Gmail account suspended and may break the law in some countries.</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  onStartCampaign();
                }}
                className="btn btn-primary"
              >
                <Check size={16} /> Yes, Start Sending
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
