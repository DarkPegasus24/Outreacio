import React from 'react';

const FEATURE_LABELS = {
  crmIntegration: 'CRM Integration',
  advancedAnalytics: 'Advanced Analytics',
  priorityQueue: 'Priority Send Queue',
};

const CHECK_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="8" cy="8" r="8" fill="var(--primary)" opacity="0.12" />
    <path d="M4.5 8l2.5 2.5 4.5-5" stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const X_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="8" cy="8" r="8" fill="#6b7280" opacity="0.1" />
    <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#9ca3af" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export default function PlanCard({ planKey, plan, isPopular, onUpgradeClick, isCurrentPlan }) {
  if (!plan) return null;

  const {
    name = planKey || '',
    priceMonthly = 0,
    inboxLimit = null,
    sendCapDaily = null,
    aiCreditsMonthly = 0,
    verificationCreditsMonthly = 0,
    features = {}
  } = plan;

  const safeFeatures = features || {};
  const teamSeats = safeFeatures.teamSeats ?? 1;

  const featureRows = [
    { label: `${inboxLimit === null ? 'Unlimited' : inboxLimit} inbox${inboxLimit !== 1 ? 'es' : ''}`, enabled: true },
    { label: sendCapDaily === null ? 'Unlimited daily sends' : `${sendCapDaily} emails / day`, enabled: true },
    { label: aiCreditsMonthly > 0 ? `${aiCreditsMonthly.toLocaleString()} AI credits / mo` : 'No AI credits', enabled: aiCreditsMonthly > 0 },
    { label: verificationCreditsMonthly > 0 ? `${verificationCreditsMonthly.toLocaleString()} verification credits / mo` : 'No verification credits', enabled: verificationCreditsMonthly > 0 },
    { label: `${teamSeats} team seat${teamSeats !== 1 ? 's' : ''}`, enabled: true },
    ...Object.entries(FEATURE_LABELS).map(([key, label]) => ({ label, enabled: !!safeFeatures[key] })),
  ];

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      flex: '1 1 220px',
      maxWidth: '280px',
      minWidth: '200px',
      background: isPopular ? 'linear-gradient(145deg, var(--primary, #6366f1) 0%, #7c3aed 100%)' : 'var(--bg-surface)',
      border: isPopular ? 'none' : '1.5px solid var(--border)',
      borderRadius: '20px',
      padding: '28px 24px 24px',
      boxShadow: isPopular
        ? '0 20px 60px rgba(99,102,241,0.35)'
        : '0 4px 24px rgba(0,0,0,0.06)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'default',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = isPopular ? '0 28px 72px rgba(99,102,241,0.45)' : '0 12px 40px rgba(0,0,0,0.12)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = isPopular ? '0 20px 60px rgba(99,102,241,0.35)' : '0 4px 24px rgba(0,0,0,0.06)'; }}
    >
      {isPopular && (
        <div style={{
          position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
          color: '#fff', fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em',
          padding: '4px 14px', borderRadius: '20px', textTransform: 'uppercase', whiteSpace: 'nowrap'
        }}>
          Most Popular
        </div>
      )}

      <div style={{ marginBottom: '8px' }}>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: isPopular ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {name}
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '6px' }}>
          <span style={{ fontSize: '38px', fontWeight: '800', color: isPopular ? '#fff' : 'var(--text-primary)', lineHeight: 1 }}>
            {priceMonthly === 0 ? 'Free' : `$${priceMonthly}`}
          </span>
          {priceMonthly > 0 && (
            <span style={{ fontSize: '14px', color: isPopular ? 'rgba(255,255,255,0.6)' : 'var(--text-secondary)' }}>/mo</span>
          )}
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: isPopular ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--border)', margin: '16px 0' }} />

      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        {featureRows.map(({ label, enabled }) => (
          <li key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: enabled ? (isPopular ? '#fff' : 'var(--text-primary)') : (isPopular ? 'rgba(255,255,255,0.45)' : 'var(--text-secondary)') }}>
            {enabled
              ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><circle cx="8" cy="8" r="8" fill="rgba(255,255,255,0.2)" /><path d="M4.5 8l2.5 2.5 4.5-5" stroke={isPopular ? '#fff' : 'var(--primary)'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              : X_ICON
            }
            {label}
          </li>
        ))}
      </ul>

      <button
        onClick={() => !isCurrentPlan && onUpgradeClick(planKey, plan)}
        disabled={isCurrentPlan}
        style={{
          width: '100%', padding: '12px', borderRadius: '12px', border: 'none', cursor: isCurrentPlan ? 'default' : 'pointer',
          fontSize: '14px', fontWeight: '700',
          background: isCurrentPlan ? 'rgba(0,0,0,0.1)' : (isPopular ? 'rgba(255,255,255,0.18)' : 'var(--primary)'),
          color: isCurrentPlan ? (isPopular ? 'rgba(255,255,255,0.5)' : 'var(--text-secondary)') : (isPopular ? '#fff' : '#fff'),
          backdropFilter: isPopular && !isCurrentPlan ? 'blur(8px)' : 'none',
          border: isPopular && !isCurrentPlan ? '1.5px solid rgba(255,255,255,0.3)' : 'none',
          transition: 'all 0.2s ease',
          letterSpacing: '0.02em',
        }}
        onMouseEnter={e => { if (!isCurrentPlan) { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'scale(1.02)'; }}}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {isCurrentPlan ? '✓ Current Plan' : priceMonthly === 0 ? 'Get Started Free' : `Upgrade to ${name}`}
      </button>
    </div>
  );
}
