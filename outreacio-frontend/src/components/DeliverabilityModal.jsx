import React from 'react';
import { X, AlertTriangle, ShieldCheck, CheckCircle2, Key, Globe, Mail } from 'lucide-react';

export default function DeliverabilityModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(37, 31, 25, 0.6)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '640px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        background: 'var(--bg-white)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 25px 50px -12px rgba(37, 31, 25, 0.25)',
        padding: '24px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '14px',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'var(--accent-light)',
              color: 'var(--accent)',
              padding: '8px',
              borderRadius: '8px'
            }}>
              <Globe size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Gmail Sending &amp; Deliverability Guide</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Simple tips to keep your emails landing in primary inboxes.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: '6px', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Notice */}
        <div style={{
          background: 'rgba(244, 141, 22, 0.08)',
          border: '1px solid rgba(244, 141, 22, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 16px',
          marginBottom: '20px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start'
        }}>
          <AlertTriangle size={20} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '13.5px', color: '#78350f' }}>
            <strong style={{ display: 'block', marginBottom: '3px' }}>
              Gmail Sending Tip:
            </strong>
            Always use safe pacing (2–3 seconds per email) to keep your Gmail account in good standing and avoid rate limit pauses.
          </div>
        </div>

        {/* Section 1: Gmail App Password */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Key size={15} color="var(--accent)" />
            1. Gmail App Password Setup
          </h4>
          
          <div style={{ background: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '13.5px', lineHeight: 1.6 }}>
            <p style={{ margin: '0 0 8px', color: 'var(--text-secondary)' }}>
              Google requires a 16-character App Password for third-party apps:
            </p>
            <ol style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-primary)' }}>
              <li>Open <strong>Google Account</strong> &rarr; <strong>Security</strong>.</li>
              <li>Turn ON <strong>2-Step Verification</strong>.</li>
              <li>Go to <strong>App Passwords</strong> and generate a password for Outreacio.</li>
              <li>Copy the 16 letters into Outreacio.</li>
            </ol>
          </div>
        </div>

        {/* Section 2: Best Practices */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={15} color="#128a4d" />
            2. Best Practices for Cold Outreach
          </h4>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <CheckCircle2 size={16} color="#128a4d" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Personalize with Company Names:</strong> Emails with <code>{`{{Company Name}}`}</code> get 4x higher open and reply rates.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <CheckCircle2 size={16} color="#128a4d" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Clean your list:</strong> Remove syntax errors and invalid email formats before starting.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <CheckCircle2 size={16} color="#128a4d" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Keep subject lines short:</strong> 3 to 6 words perform best. Avoid spam trigger words like "FREE $$", "ACT NOW".</span>
            </li>
          </ul>
        </div>

        <div style={{ textAlign: 'right' }}>
          <button onClick={onClose} className="btn btn-primary btn-sm" style={{ padding: '8px 20px' }}>
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
