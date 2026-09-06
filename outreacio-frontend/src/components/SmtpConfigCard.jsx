import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, CheckCircle2, AlertCircle, RefreshCw, KeyRound, Mail, ShieldCheck, ExternalLink, ArrowRight, ArrowUp } from 'lucide-react';

export default function SmtpConfigCard({ config, onChange, csrfToken, isVerified, onVerifiedChange, onContinue }) {
  const [showPassword, setShowPassword] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(isVerified ? { success: true, message: 'Gmail connected successfully! Ready to send emails.' } : null);

  const hasCredentials = Boolean(config.user?.trim() && config.pass?.trim());

  // Pre-fill last used Gmail address from localStorage on mount (App Password is NEVER stored)
  useEffect(() => {
    if (!config.user) {
      try {
        const savedEmail = localStorage.getItem('outreacio_last_gmail_address');
        if (savedEmail && typeof savedEmail === 'string' && savedEmail.trim()) {
          onChange({ ...config, user: savedEmail.trim() });
        }
      } catch (e) {
        // Silently fail if localStorage is restricted
      }
    }
  }, []);

  const handleTestConnection = async () => {
    if (!config.user || !config.pass) {
      setTestResult({
        success: false,
        message: 'Please enter your Gmail address and 16-character App Password before testing.'
      });
      onVerifiedChange?.(false);
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/verify-smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken || ''
        },
        body: JSON.stringify({
          smtpConfig: {
            user: config.user.trim(),
            pass: config.pass.trim()
          }
        })
      });

      let data = {};
      try {
        data = await response.json();
      } catch (jsonErr) {
        data = { message: response.status === 502 ? 'Connection to backend timed out. Please try again.' : `Server returned status ${response.status}` };
      }

      if (response.ok && data.success) {
        setTestResult({
          success: true,
          message: 'Gmail connected successfully! Ready to send emails.'
        });
        try {
          localStorage.setItem('outreacio_last_gmail_address', config.user.trim());
        } catch (e) {
          // Silently fail
        }
        onVerifiedChange?.(true);
      } else {
        setTestResult({
          success: false,
          message: data.message || 'Gmail verification failed. Please check your 16-character App Password.'
        });
        onVerifiedChange?.(false);
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: 'Could not connect to backend server. Make sure the server is running.'
      });
      onVerifiedChange?.(false);
    } finally {
      setTesting(false);
    }
  };

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
      <style>{`
        @keyframes bounceUpSoft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes bounceRightSoft {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }
      `}</style>

      {/* Card Header */}
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
            Connect Gmail Account
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
            Connect your Gmail so we can send emails on your behalf.
          </p>
        </div>

        {/* Test Connection Button with Guiding Arrow Pointer */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing || !config.user || !config.pass}
            className="btn btn-secondary btn-sm"
            style={{
              borderColor: isVerified ? 'var(--success)' : undefined,
              color: isVerified ? 'var(--success)' : undefined,
              fontWeight: '600',
              padding: '8px 16px'
            }}
          >
            {testing ? (
              <>
                <RefreshCw size={14} className="spinning" />
                <span>Checking Connection...</span>
              </>
            ) : (
              <>
                {isVerified ? <CheckCircle2 size={15} color="var(--success)" /> : <Mail size={15} />}
                <span>Test Gmail Connection</span>
              </>
            )}
          </button>

          {/* Guiding Arrow 1: Pointing up at Test Gmail */}
          <div style={{
            position: 'absolute',
            top: '100%',
            right: '8px',
            marginTop: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--accent)',
            fontSize: '12px',
            fontWeight: '600',
            opacity: hasCredentials && !isVerified ? 1 : 0,
            transform: hasCredentials && !isVerified ? 'translateY(0)' : 'translateY(6px)',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            animation: hasCredentials && !isVerified ? 'bounceUpSoft 1.2s ease-in-out infinite' : 'none'
          }}>
            <ArrowUp size={14} />
            <span>Click here first</span>
          </div>
        </div>
      </div>

      {/* Gmail Setup Instructions Banner */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '16px 20px',
        marginBottom: '24px',
        fontSize: '13.5px',
        color: 'var(--text-primary)',
        lineHeight: 1.6
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
          <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontSize: '14px' }}>
            <svg width="20" height="16" viewBox="0 0 24 19" fill="none">
              <path d="M1.5 3.5V15.5C1.5 16.6 2.4 17.5 3.5 17.5H5.5V7.5L12 12L18.5 7.5V17.5H20.5C21.6 17.5 22.5 16.6 22.5 15.5V3.5C22.5 2.1 20.9 1.3 19.8 2.1L12 7.5L4.2 2.1C3.1 1.3 1.5 2.1 1.5 3.5Z" fill="#EA4335"/>
              <path d="M1.5 3.5V15.5C1.5 16.6 2.4 17.5 3.5 17.5H5.5V7.5L1.5 4.5V3.5Z" fill="#4285F4"/>
              <path d="M22.5 3.5V15.5C22.5 16.6 21.6 17.5 20.5 17.5H18.5V7.5L22.5 4.5V3.5Z" fill="#34A853"/>
              <path d="M18.5 17.5H5.5V7.5L12 12L18.5 7.5V17.5Z" fill="#FBBC05"/>
            </svg>
            Quick 2-Minute Gmail Setup:
          </strong>
          <a
            href="https://myaccount.google.com/apppasswords"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '12.5px', color: 'var(--accent)', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            Google App Passwords <ExternalLink size={12} />
          </a>
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
          1. Turn on <strong>2-Step Verification</strong> in your Google Account.<br />
          2. Visit <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontWeight: '600' }}>myaccount.google.com/apppasswords</a> and create an App Password.<br />
          3. Paste your Gmail &amp; 16-character password below, then click <strong>"Test Gmail Connection"</strong>.
        </div>
      </div>

      {/* Form Fields Grid: 2 Fields (Gmail Address & 16-Character App Password) */}
      <div className="form-grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '20px' }}>
        {/* Gmail Address */}
        <div>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Mail size={14} color="var(--accent)" /> Gmail Address <span style={{ color: 'var(--accent)' }}>*</span>
          </label>
          <input
            type="email"
            className="input"
            placeholder="your-email@gmail.com"
            value={config.user || ''}
            onChange={(e) => {
              onChange({ ...config, user: e.target.value });
              setTestResult(null);
              onVerifiedChange?.(false);
            }}
            style={{ height: '42px' }}
          />
        </div>

        {/* 16-Character App Password */}
        <div>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <KeyRound size={14} color="var(--accent)" /> 16-Character App Password <span style={{ color: 'var(--accent)' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              className="input"
              placeholder="xxxx xxxx xxxx xxxx"
              value={config.pass || ''}
              onChange={(e) => {
                onChange({ ...config, pass: e.target.value });
                setTestResult(null);
                onVerifiedChange?.(false);
              }}
              style={{
                height: '42px',
                paddingRight: '40px',
                fontFamily: showPassword ? 'inherit' : 'var(--font-mono)'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Live Connection Test Result */}
      {testResult && (
        <div style={{
          marginBottom: '20px',
          padding: '12px 16px',
          borderRadius: '10px',
          background: testResult.success ? 'var(--success-bg)' : 'var(--error-bg)',
          border: `1px solid ${testResult.success ? 'var(--success-border)' : 'var(--error-border)'}`,
          color: testResult.success ? 'var(--success)' : 'var(--error)',
          fontSize: '13.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeIn 0.25s ease'
        }}>
          {testResult.success ? <CheckCircle2 size={18} style={{ flexShrink: 0 }} /> : <AlertCircle size={18} style={{ flexShrink: 0 }} />}
          <span>{testResult.message}</span>
        </div>
      )}

      {/* Unified Card Footer: Security Note + Continue Action with Guiding Arrow */}
      <div className="card-footer-responsive" style={{
        paddingTop: '20px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12.5px',
          color: 'var(--text-secondary)'
        }}>
          <ShieldCheck size={16} color="var(--success)" />
          <span>Password not saved on our servers. Stored in temporary memory only.</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* Guiding Arrow 2: Pointing at Continue to Recipients */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--accent)',
            fontSize: '13px',
            fontWeight: '600',
            opacity: isVerified ? 1 : 0,
            transform: isVerified ? 'translateX(0)' : 'translateX(-8px)',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            animation: isVerified ? 'bounceRightSoft 1.2s ease-in-out infinite' : 'none'
          }}>
            <span>Click here to continue</span>
            <ArrowRight size={15} />
          </div>

          {!isVerified && (
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Test your Gmail connection first.
            </span>
          )}

          <button
            type="button"
            disabled={!isVerified}
            onClick={onContinue}
            className="btn btn-primary"
            style={{
              padding: '10px 24px',
              fontSize: '14.5px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>Continue to Recipients</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
