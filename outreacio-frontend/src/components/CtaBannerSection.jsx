import React from 'react';

export default function CtaBannerSection({ onLaunchApp }) {
  return (
    <section className="parley-cta-banner animate-fade-in">
      <div className="parley-hero-overlay" />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '780px', margin: '0 auto' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
          lineHeight: 1.15,
          fontWeight: 700,
          color: '#ffffff',
          marginBottom: '16px',
          textShadow: '0 3px 16px rgba(0, 0, 0, 0.4)'
        }}>
          Send 25 emails today for free.<br />
          <span style={{ fontStyle: 'italic', fontWeight: 400 }}>No credit card required.</span>
        </h2>

        <p style={{
          color: 'rgba(255, 255, 255, 0.92)',
          fontSize: '1.1rem',
          maxWidth: '580px',
          margin: '0 auto 28px',
          lineHeight: 1.6,
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
        }}>
          Automate bulk email campaigns with smart pacing, live delivery tracking, and zero data retention.
        </p>

        <button onClick={onLaunchApp} className="parley-chat-btn" style={{ padding: '6px 22px 6px 6px' }}>
          <div className="parley-chat-icon" style={{ width: '38px', height: '38px', fontSize: '16px' }}>
            &gt;
          </div>
          <span style={{ fontSize: '15px' }}>Get Started Now</span>
        </button>
      </div>
    </section>
  );
}
