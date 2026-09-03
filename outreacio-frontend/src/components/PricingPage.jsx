import React, { useEffect, useState } from 'react';
import PlanCard from './PlanCard';
import UpgradeModal from './UpgradeModal';
import { fetchPlans } from '../api/planService.js';
import { SkeletonPlansGrid } from './SkeletonLoader';

const FAQ_ITEMS = [
  {
    q: 'Is there a free trial?',
    a: 'Yes! The Free tier is permanent — no credit card required. Upgrade whenever you outgrow it.'
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
    q: 'What counts as an "AI credit"?',
    a: 'Each AI-powered email personalization or smart subject-line generation consumes one credit. Credits reset monthly.'
  },
  {
    q: 'What are "verification credits"?',
    a: 'Each email address verification check consumes one credit. This helps you maintain a healthy sender reputation by bouncing bad addresses before sending.'
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
      <div style={{ textAlign: 'center', marginBottom: '56px' }}>
        <div style={{
          display: 'inline-block', background: 'linear-gradient(90deg, var(--primary), #7c3aed)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          fontSize: '13px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase',
          marginBottom: '12px',
        }}>
          Simple, Honest Pricing
        </div>
        <h1 style={{ margin: '0 0 16px', fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: '900', lineHeight: 1.1, color: 'var(--text-primary)' }}>
          Scale your outreach<br />without scaling your costs
        </h1>
        <p style={{ margin: 0, fontSize: '17px', color: 'var(--text-secondary)', maxWidth: '520px', marginInline: 'auto', lineHeight: 1.7 }}>
          Start free. Upgrade when you're ready. No surprise charges — ever.
        </p>
      </div>

      {/* Plan Cards */}
      {loading ? (
        <SkeletonPlansGrid />
      ) : (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '72px' }}>
          {Object.entries(plans).map(([key, plan]) => (
            <PlanCard
              key={key}
              planKey={key}
              plan={plan}
              isPopular={key === 'pro'}
              isCurrentPlan={false}
              onUpgradeClick={() => setUpgradeModalOpen(true)}
            />
          ))}
        </div>
      )}

      {/* Single CTA row */}
      <div style={{ textAlign: 'center', marginBottom: '80px' }}>
        <button
          onClick={() => setUpgradeModalOpen(true)}
          style={{
            padding: '16px 40px', borderRadius: '14px', border: 'none',
            background: 'linear-gradient(90deg, var(--primary), #7c3aed)',
            color: '#fff', fontSize: '16px', fontWeight: '800', cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(99,102,241,0.35)',
            transition: 'opacity 0.2s ease, transform 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          View All Plans & Upgrade →
        </button>
        <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          No credit card required for Free tier. Pay via UPI for paid plans.
        </p>
      </div>

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
