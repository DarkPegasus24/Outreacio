import React, { useState, useEffect } from 'react';
import UpgradeModal from './UpgradeModal';
import { fetchPlans } from '../api/planService.js';

const FAQ_ITEMS = [
  {
    q: 'Is there a free trial?',
    a: 'Yes! The Free tier is permanent | no credit card required. Upgrade whenever you outgrow it.'
  },
  {
    q: 'How does the payment shortcut work?',
    a: 'Pay via UPI or bank transfer, then enter your transaction reference in the form. Your plan activates instantly after submission and is verified manually by our team.'
  },
  {
    q: 'Can I downgrade or cancel anytime?',
    a: 'You can switch to a lower plan at any time. Your usage resets at the start of each billing cycle.'
  },
  {
    q: 'Do you store my Gmail password?',
    a: 'Never. Your Gmail App Password is transmitted directly to the email dispatch server only for sending and is never stored on disk or in any database.'
  }
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        borderBottom: '1px solid var(--border)',
        padding: '16px 0',
        cursor: 'pointer',
        userSelect: 'none',
      }}
      onClick={() => setOpen(o => !o)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text-primary)' }}>{q}</span>
        <span style={{
          fontSize: '20px', color: 'var(--accent, #f48d16)', lineHeight: 1,
          transform: open ? 'rotate(45deg)' : 'rotate(0)', transition: 'transform 0.2s ease',
          flexShrink: 0,
        }}>+</span>
      </div>
      {open && (
        <p style={{ margin: '10px 0 0', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
          {a}
        </p>
      )}
    </div>
  );
}

const CheckIcon = ({ dimmed = false }) => (
  <svg width="17" height="17" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, opacity: dimmed ? 0.35 : 1 }}>
    <circle cx="8" cy="8" r="8" fill="var(--accent, #f48d16)" opacity={dimmed ? 0.1 : 0.18} />
    <path d="M4.5 8l2.5 2.5 4.5-5" stroke="var(--accent, #f48d16)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const WhiteCheckIcon = () => (
  <svg width="17" height="17" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="8" cy="8" r="8" fill="#ffffff" opacity="0.25" />
    <path d="M4.5 8l2.5 2.5 4.5-5" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function PricingPage({ onUpgrade, onGetStarted, csrfToken }) {
  const [currency, setCurrency] = useState('USD'); // 'USD' | 'INR'
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [plans, setPlans] = useState({});
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchPlans()
      .then(setPlans)
      .catch(err => console.error('Failed to load plans', err));
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const handleUpgradeSuccess = (result) => {
    showToast(`🎉 ${result.message || 'Plan upgraded successfully!'}`);
    if (onUpgrade) onUpgrade(result);
  };

  const handleGetStartedFree = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 20px 80px', fontFamily: 'inherit' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(90deg, #22c55e, #16a34a)',
          color: '#fff', padding: '14px 28px', borderRadius: '14px',
          fontWeight: '700', fontSize: '15px', boxShadow: '0 8px 32px rgba(34,197,94,0.4)',
          zIndex: 9999, whiteSpace: 'nowrap', animation: 'slideUp 0.3s ease',
        }}>
          {toast}
        </div>
      )}

      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{
          display: 'inline-block',
          color: 'var(--accent, #f48d16)',
          fontSize: '13px',
          fontWeight: '800',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '10px',
        }}>
          SIMPLE, HONEST PRICING
        </div>
        <h1 style={{
          margin: '0 auto 16px',
          fontSize: 'clamp(28px, 4.8vw, 44px)',
          fontWeight: '900',
          lineHeight: 1.15,
          color: 'var(--text-primary)',
          letterSpacing: '-0.025em',
          maxWidth: '720px'
        }}>
          Scale your email outreach<br />without scaling your costs
        </h1>
        <p style={{
          margin: '0 auto 28px',
          fontSize: '15.5px',
          color: 'var(--text-secondary)',
          maxWidth: '560px',
          lineHeight: 1.6
        }}>
          Start free. Upgrade when you need higher sending capacity. No surprise charges | ever.
        </p>

        {/* Currency Switcher Toggle */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '9999px',
          padding: '4px',
          gap: '4px'
        }}>
          <button
            type="button"
            onClick={() => setCurrency('USD')}
            style={{
              padding: '6px 16px',
              borderRadius: '9999px',
              border: 'none',
              background: currency === 'USD' ? 'var(--accent, #f48d16)' : 'transparent',
              color: currency === 'USD' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🇺🇸 USD ($)</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrency('INR')}
            style={{
              padding: '6px 16px',
              borderRadius: '9999px',
              border: 'none',
              background: currency === 'INR' ? 'var(--accent, #f48d16)' : 'transparent',
              color: currency === 'INR' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🇮🇳 INR (₹)</span>
          </button>
        </div>
      </div>

      {/* 2 Plans Grid (Exact match to screenshot) */}
      <div style={{
        display: 'flex',
        gap: '28px',
        justifyContent: 'center',
        alignItems: 'stretch',
        flexWrap: 'wrap',
        marginBottom: '72px'
      }}>
        {/* Card 1: FREE TIER */}
        <div style={{
          flex: '1 1 320px',
          maxWidth: '390px',
          minWidth: '290px',
          background: 'var(--bg-white)',
          border: '1.5px solid var(--border)',
          borderRadius: '24px',
          padding: '32px 28px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: 'var(--shadow-card)',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease'
        }}>
          <div>
            <div style={{
              fontSize: '12px',
              fontWeight: '800',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}>
              FREE TIER
            </div>

            <h2 style={{
              fontSize: '38px',
              fontWeight: '900',
              color: 'var(--text-primary)',
              margin: '0 0 4px',
              lineHeight: 1
            }}>
              Free
            </h2>

            <p style={{
              fontSize: '13.5px',
              color: 'var(--text-secondary)',
              margin: '0 0 28px'
            }}>
              Free forever · No card needed
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--text-primary)' }}>
                <CheckIcon />
                <span>1 Connected Inbox (Gmail)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--text-primary)' }}>
                <CheckIcon />
                <span>25 emails / day</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGetStartedFree}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '12px',
              border: '1.5px solid var(--border)',
              background: 'var(--bg-white)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-subtle)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = 'var(--accent, #f48d16)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            Get Started Free
          </button>
        </div>

        {/* Card 2: PAID PLAN (Most Popular) */}
        <div style={{
          flex: '1 1 320px',
          maxWidth: '390px',
          minWidth: '290px',
          position: 'relative',
          background: 'linear-gradient(145deg, #f48d16 0%, #e07d0a 100%)',
          borderRadius: '24px',
          padding: '32px 28px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 20px 50px rgba(244, 141, 22, 0.35)',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease'
        }}>
          {/* Top Floating Badge */}
          <div style={{
            position: 'absolute',
            top: '-14px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#251f19',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: '800',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '5px 18px',
            borderRadius: '9999px',
            boxShadow: '0 4px 14px rgba(37, 31, 25, 0.3)',
            whiteSpace: 'nowrap',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            MOST POPULAR
          </div>

          <div>
            <div style={{
              fontSize: '12px',
              fontWeight: '800',
              letterSpacing: '0.08em',
              color: 'rgba(255, 255, 255, 0.85)',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}>
              PAID PLAN
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '2px' }}>
              <span style={{ fontSize: '42px', fontWeight: '900', color: '#ffffff', lineHeight: 1 }}>
                {currency === 'USD' ? '$4.99' : '₹425'}
              </span>
              <span style={{ fontSize: '15px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.8)' }}>
                /mo
              </span>
            </div>

            <p style={{
              fontSize: '12.5px',
              color: 'rgba(255, 255, 255, 0.82)',
              margin: '0 0 28px',
              fontWeight: '500'
            }}>
              {currency === 'USD' ? '~ ₹425 INR / month' : '~ $4.99 USD / month'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#ffffff' }}>
                <WhiteCheckIcon />
                <span>1 Connected Inbox (Gmail)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#ffffff' }}>
                <WhiteCheckIcon />
                <span>150 emails / day</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setUpgradeModalOpen(true)}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '12px',
              border: 'none',
              background: '#ffffff',
              color: '#251f19',
              fontSize: '14px',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.18)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.12)';
            }}
          >
            Upgrade to Paid Plan
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '24px', fontWeight: '800', marginBottom: '28px', color: 'var(--text-primary)' }}>
          Frequently Asked Questions
        </h2>
        {FAQ_ITEMS.map(item => <FaqItem key={item.q} {...item} />)}
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        currentPlanId={null}
        plans={plans}
        csrfToken={csrfToken || ''}
        onUpgradeSuccess={handleUpgradeSuccess}
      />
    </div>
  );
}
