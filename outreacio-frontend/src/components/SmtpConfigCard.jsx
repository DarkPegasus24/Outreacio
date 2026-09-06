import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, CheckCircle2, AlertCircle, RefreshCw, KeyRound, Mail, ShieldCheck, ExternalLink, ArrowRight, ArrowUp, Send, Sparkles } from 'lucide-react';

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
    <div className="smtp-wizard-backdrop-wrapper" style={{
      position: 'relative',
      borderRadius: '24px',
      padding: '8px',
      margin: '0 auto',
      maxWidth: '890px'
    }}>
      <style>{`
        @keyframes smtpCardEntrance {
          0% {
            opacity: 0;
            transform: translateY(14px) scale(0.99);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes bounceUpSoft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes bounceRightSoft {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }
        @keyframes floatSlow1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-4px, -8px) rotate(3deg); }
        }
        @keyframes floatSlow2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(6px, -10px) rotate(-4deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(1.06); }
        }
        .smtp-input-field:hover {
          border-color: var(--border-strong) !important;
        }
        .smtp-input-field:focus-within {
          border-color: var(--accent) !important;
          box-shadow: 0 0 0 3.5px var(--accent-light), 0 2px 10px rgba(244, 141, 22, 0.08) !important;
        }
        .smtp-instruction-link:hover {
          background: var(--accent-light) !important;
          border-color: var(--accent) !important;
          transform: translateY(-1px);
        }
      `}</style>

      {/* Decorative Ambient Background Elements (Subtle CSS Mesh + Dotted Pattern + Communication Icons) */}
      <div 
        aria-hidden="true" 
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '24px',
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 0
        }}
      >
        {/* Subtle Geometric Dot Grid Pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(var(--border) 1.2px, transparent 1.2px)',
          backgroundSize: '22px 22px',
          opacity: 0.65
        }} />

        {/* Ambient Radial Mesh Glow 1: Top-Right Warm Accent */}
        <div style={{
          position: 'absolute',
          top: '-15%',
          right: '-10%',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--accent-light) 0%, transparent 70%)',
          filter: 'blur(30px)',
          animation: 'pulseGlow 6s ease-in-out infinite',
          opacity: 0.7
        }} />

        {/* Ambient Radial Mesh Glow 2: Bottom-Left Soft Indigo/Primary Tint */}
        <div style={{
          position: 'absolute',
          bottom: '-15%',
          left: '-10%',
          width: '340px',
          height: '340px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.09) 0%, transparent 70%)',
          filter: 'blur(35px)',
          animation: 'pulseGlow 7s ease-in-out infinite alternate',
          opacity: 0.6
        }} />

        {/* Floating Decorative Mail & Communication Watermarks */}
        <div style={{
          position: 'absolute',
          top: '18px',
          right: '28px',
          color: 'var(--accent)',
          opacity: 0.08,
          animation: 'floatSlow1 7s ease-in-out infinite'
        }}>
          <Mail size={56} strokeWidth={1.2} />
        </div>

        <div style={{
          position: 'absolute',
          bottom: '24px',
          left: '24px',
          color: 'var(--text-secondary)',
          opacity: 0.06,
          animation: 'floatSlow2 8s ease-in-out infinite'
        }}>
          <Send size={50} strokeWidth={1.2} />
        </div>

        <div style={{
          position: 'absolute',
          top: '45%',
          left: '12px',
          color: 'var(--accent)',
          opacity: 0.05,
          animation: 'floatSlow1 9s ease-in-out infinite reverse'
        }}>
          <Sparkles size={28} strokeWidth={1.2} />
        </div>
      </div>

      {/* Main Glassmorphic SmtpConfigCard */}
      <div 
        className="parley-card" 
        style={{
          position: 'relative',
          zIndex: 1,
          background: 'var(--bg-white)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '30px 34px',
          boxShadow: '0 16px 40px -12px rgba(37, 31, 25, 0.08), 0 0 0 1px var(--border)',
          maxWidth: '860px',
          margin: '0 auto',
          animation: 'smtpCardEntrance 0.45s cubic-bezier(0.16, 1, 0.3, 1) both'
        }}
      >
        {/* Card Top Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '22px',
          flexWrap: 'wrap',
          gap: '14px',
          paddingBottom: '18px',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'var(--accent-light)',
              border: '1px solid var(--accent-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)',
              flexShrink: 0
            }}>
              <Mail size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
                  Connect Gmail Account
                </h2>
                {isVerified && (
                  <span style={{
                    fontSize: '11.5px',
                    fontWeight: '700',
                    color: 'var(--success)',
                    background: 'var(--success-bg)',
                    border: '1px solid var(--success-border)',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <CheckCircle2 size={12} /> Connected
                  </span>
                )}
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '3px', margin: 0 }}>
                Link your Gmail sender to deliver personalized outreach campaigns.
              </p>
            </div>
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
                padding: '9px 18px',
                borderRadius: '10px',
                boxShadow: isVerified ? '0 2px 10px var(--success-bg)' : 'var(--shadow-subtle)',
                transition: 'all 0.2s ease'
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
              animation: hasCredentials && !isVerified ? 'bounceUpSoft 1.2s ease-in-out infinite' : 'none',
              zIndex: 3
            }}>
              <ArrowUp size={14} />
              <span>Click here first</span>
            </div>
          </div>
        </div>

        {/* Enhanced Gmail Setup Instructions Banner */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderLeft: '4px solid var(--accent)',
          borderRadius: '14px',
          padding: '18px 20px',
          marginBottom: '24px',
          fontSize: '13.5px',
          color: 'var(--text-primary)',
          lineHeight: 1.6,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
            <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontSize: '14px' }}>
              <svg width="20" height="16" viewBox="0 0 24 19" fill="none" style={{ flexShrink: 0 }}>
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
              className="smtp-instruction-link"
              style={{
                fontSize: '12px',
                color: 'var(--accent)',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'var(--bg-white)',
                border: '1px solid var(--accent-border)',
                transition: 'all 0.2s ease'
              }}
            >
              <span>Google App Passwords</span>
              <ExternalLink size={12} />
            </a>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: 'var(--bg-white)',
                border: '1px solid var(--border)',
                color: 'var(--accent)',
                fontWeight: '700',
                fontSize: '11px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px'
              }}>1</span>
              <span>Turn on <strong>2-Step Verification</strong> in your Google Account security settings.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: 'var(--bg-white)',
                border: '1px solid var(--border)',
                color: 'var(--accent)',
                fontWeight: '700',
                fontSize: '11px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px'
              }}>2</span>
              <span>Visit <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontWeight: '600', textDecoration: 'underline' }}>myaccount.google.com/apppasswords</a> and create an App Password.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: 'var(--bg-white)',
                border: '1px solid var(--border)',
                color: 'var(--accent)',
                fontWeight: '700',
                fontSize: '11px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px'
              }}>3</span>
              <span>Paste your Gmail &amp; 16-character password below, then click <strong>"Test Gmail Connection"</strong>.</span>
            </div>
          </div>
        </div>

        {/* Form Fields Grid: 2 Fields (Gmail Address & 16-Character App Password) */}
        <div className="form-grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '20px' }}>
          {/* Gmail Address */}
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '7px', fontWeight: '600' }}>
              <Mail size={14} color="var(--accent)" />
              <span>Gmail Address</span>
              <span style={{ color: 'var(--accent)' }}>*</span>
            </label>
            <input
              type="email"
              className="input smtp-input-field"
              placeholder="your-email@gmail.com"
              value={config.user || ''}
              onChange={(e) => {
                onChange({ ...config, user: e.target.value });
                setTestResult(null);
                onVerifiedChange?.(false);
              }}
              style={{
                height: '44px',
                borderRadius: '10px',
                border: '1.5px solid var(--border-strong)',
                background: 'var(--bg-input)',
                padding: '10px 14px',
                fontSize: '14px',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease'
              }}
            />
          </div>

          {/* 16-Character App Password */}
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '7px', fontWeight: '600' }}>
              <KeyRound size={14} color="var(--accent)" />
              <span>16-Character App Password</span>
              <span style={{ color: 'var(--accent)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input smtp-input-field"
                placeholder="xxxx xxxx xxxx xxxx"
                value={config.pass || ''}
                onChange={(e) => {
                  onChange({ ...config, pass: e.target.value });
                  setTestResult(null);
                  onVerifiedChange?.(false);
                }}
                style={{
                  height: '44px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--border-strong)',
                  background: 'var(--bg-input)',
                  paddingLeft: '14px',
                  paddingRight: '42px',
                  fontSize: '14px',
                  fontFamily: showPassword ? 'inherit' : 'var(--font-mono)',
                  letterSpacing: showPassword ? 'normal' : '0.1em',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px',
                  borderRadius: '6px',
                  transition: 'color 0.2s, background 0.2s'
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
            padding: '14px 18px',
            borderRadius: '12px',
            background: testResult.success ? 'var(--success-bg)' : 'var(--error-bg)',
            border: `1px solid ${testResult.success ? 'var(--success-border)' : 'var(--error-border)'}`,
            color: testResult.success ? 'var(--success)' : 'var(--error)',
            fontSize: '13.5px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'fadeIn 0.25s ease',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
          }}>
            {testResult.success ? (
              <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
            ) : (
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Unified Card Footer: Security Note + Continue Action with Guiding Arrow */}
        <div className="card-footer-responsive" style={{
          paddingTop: '22px',
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
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: 'var(--success-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ShieldCheck size={15} color="var(--success)" />
            </div>
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
              animation: isVerified ? 'bounceRightSoft 1.2s ease-in-out infinite' : 'none',
              zIndex: 3
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
                gap: '8px',
                borderRadius: '10px',
                boxShadow: isVerified ? '0 4px 14px var(--accent-light)' : 'none'
              }}
            >
              <span>Continue to Recipients</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
