import React from 'react';
import { Home, HelpCircle, Compass } from 'lucide-react';

export default function NotFoundPage({ onNavigateHome, onNavigateContact }) {
  return (
    <div style={{
      minHeight: '75vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px 80px',
      position: 'relative'
    }}>
      {/* Ambient background glow */}
      <div style={{
        position: 'absolute',
        width: '420px',
        height: '420px',
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
        maxWidth: '520px',
        width: '100%',
        background: 'var(--bg-white, #ffffff)',
        borderRadius: '24px',
        padding: '48px 36px',
        textAlign: 'center',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-hover, 0 20px 50px rgba(0,0,0,0.08))',
        backdropFilter: 'blur(16px)'
      }}>
        {/* Floating Compass Badge */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(244, 141, 22, 0.15) 0%, rgba(244, 141, 22, 0.28) 100%)',
          color: 'var(--accent, #f48d16)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          border: '1.5px solid rgba(244, 141, 22, 0.35)',
          boxShadow: '0 8px 24px rgba(244, 141, 22, 0.18)'
        }}>
          <Compass size={36} className="animate-pulse" />
        </div>

        {/* Big 404 Headline */}
        <div style={{
          fontSize: '4.5rem',
          fontWeight: '900',
          lineHeight: '1',
          letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, #f48d16 0%, #e07d0a 50%, #d97706 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '12px'
        }}>
          404
        </div>

        <h1 style={{
          fontSize: '24px',
          fontWeight: '800',
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          margin: '0 0 10px'
        }}>
          Page Not Found
        </h1>

        <p style={{
          fontSize: '14.5px',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          margin: '0 auto 32px',
          maxWidth: '420px'
        }}>
          The page you are looking for doesn't exist, was moved, or has an invalid route address.
        </p>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          alignItems: 'stretch',
          maxWidth: '360px',
          margin: '0 auto'
        }}>
          <button
            type="button"
            onClick={onNavigateHome}
            style={{
              padding: '13px 20px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #f48d16 0%, #e07d0a 100%)',
              color: '#ffffff',
              fontSize: '14.5px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 8px 24px rgba(244, 141, 22, 0.3)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 10px 28px rgba(244, 141, 22, 0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(244, 141, 22, 0.3)';
            }}
          >
            <Home size={16} />
            <span>Back to Outreacio Home</span>
          </button>

          {onNavigateContact && (
            <button
              type="button"
              onClick={onNavigateContact}
              style={{
                padding: '12px 20px',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                background: 'var(--bg-surface, transparent)',
                color: 'var(--text-secondary)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent, #f48d16)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <HelpCircle size={15} />
              <span>Contact Support &amp; FAQ</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
