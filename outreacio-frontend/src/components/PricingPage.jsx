import React, { useEffect, useState } from 'react';
import PlanCard from './PlanCard';
import UpgradeModal from './UpgradeModal';
import { fetchPlans } from '../api/planService.js';
import { SkeletonPlansGrid } from './SkeletonLoader';

const FAQ_ITEMS = [
  {
    q: 'Is there a free trial?',
    a: 'Yes! The Free tier is permanent — no credit card required. Upgrade whenever you need more inbox capacity or volume.'
  },
  {
    q: 'What are the limits on the Paid Plan ($4.99 / mo)?',
    a: 'The Paid Plan provides up to 150 emails per day, unlimited connected Gmail/Workspace inboxes, and priority sending dispatch.'
  },
  {
    q: 'Can I pay in Indian Rupees (INR)?',
    a: 'Yes! We support manual UPI transfer (GPay, PhonePe, Paytm, BHIM) at ₹425/month (equivalent of $4.99 USD) with manual human verification.'
  },
  {
    q: 'How does the UPI payment verification work?',
    a: 'Pay via UPI, then enter your 12-digit transaction UTR reference and upload a screenshot proof. Our team verifies and activates your account within 2–4 hours.'
  },
  /*
  // COMMENTED OUT: AI & Verification credits removed as service is focused on dedicated email delivery
  {
    q: 'What counts as an "AI credit"?',
    a: 'Each AI-powered email personalization or smart subject-line generation consumes one credit. Credits reset monthly.'
  },
  {
    q: 'What are "verification credits"?',
    a: 'Each email address verification check consumes one credit. This helps you maintain a healthy sender reputation by bouncing bad addresses before sending.'
  },
  */
  {
    q: 'Do you store my Gmail password?',
    a: 'Never. Your Gmail App Password is transmitted directly to the email dispatch server in temporary memory only while sending, and is never stored on disk or in any database.'
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
          fontSize: '20px', color: 'var(--primary)', lineHeight: 1,
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

export default function PricingPage({ onUpgrade, csrfToken }) {
  const [plans, setPlans] = useState({});
  const [loading, setLoading] = useState(true);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [currency, setCurrency] = useState('USD'); // 'USD' | 'INR'
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchPlans()
      .then(setPlans)
      .catch(err => console.error('Failed to load plans', err))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const handleUpgradeSuccess = (result) => {
    showToast(`🎉 ${result.message || 'Plan upgraded successfully!'}`);
    if (onUpgrade) onUpgrade(result);
  };

  // Keep strictly 2 plans: free and pro (paid)
  const displayPlans = Object.entries(plans).filter(([key]) => key === 'free' || key === 'pro');

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 20px 80px', fontFamily: 'inherit' }}>
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

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{
          display: 'inline-block', background: 'linear-gradient(90deg, var(--accent, #f48d16), #e07d0a)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          fontSize: '13px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase',
          marginBottom: '12px',
        }}>
          Simple, Honest Pricing
        </div>
        <h1 style={{ margin: '0 0 16px', fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: '900', lineHeight: 1.1, color: 'var(--text-primary)' }}>
          Scale your email outreach<br />without scaling your costs
        </h1>
        <p style={{ margin: 0, fontSize: '17px', color: 'var(--text-secondary)', maxWidth: '520px', marginInline: 'auto', lineHeight: 1.7 }}>
          Start free. Upgrade when you need higher sending capacity. No surprise charges — ever.
        </p>

        {/* Currency Switcher Toggle */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '999px',
          padding: '4px',
          marginTop: '28px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <button
            type="button"
            onClick={() => setCurrency('USD')}
            style={{
              border: 'none',
              background: currency === 'USD' ? 'var(--accent, #f48d16)' : 'transparent',
              color: currency === 'USD' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: '700',
              fontSize: '13px',
              padding: '6px 16px',
              borderRadius: '999px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            🇺🇸 USD ($)
          </button>
          <button
            type="button"
            onClick={() => setCurrency('INR')}
            style={{
              border: 'none',
              background: currency === 'INR' ? 'var(--accent, #f48d16)' : 'transparent',
              color: currency === 'INR' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: '700',
              fontSize: '13px',
              padding: '6px 16px',
              borderRadius: '999px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            🇮🇳 INR (₹)
          </button>
        </div>
      </div>

      {/* Plan Cards Grid: Exactly 2 plans */}
      {loading ? (
        <SkeletonPlansGrid />
      ) : (
        <div style={{
          display: 'flex',
          gap: '28px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'stretch',
          marginBottom: '72px',
          maxWidth: '780px',
          marginInline: 'auto'
        }}>
          {displayPlans.map(([key, plan]) => (
            <PlanCard
              key={key}
              planKey={key}
              plan={plan}
              currency={currency}
              isPopular={key === 'pro'}
              isCurrentPlan={false}
              onUpgradeClick={() => setUpgradeModalOpen(true)}
            />
          ))}
        </div>
      )}

      {/* FAQ */}
      <div style={{ maxWidth: '720px', marginInline: 'auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '26px', fontWeight: '800', marginBottom: '32px' }}>
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

      <style>{`
        @keyframes slideUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes spin    { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
