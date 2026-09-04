import React from 'react';

/*
// COMMENTED OUT: Service limited to dedicated email delivery service
const FEATURE_LABELS = {
  crmIntegration: 'CRM Integration',
  advancedAnalytics: 'Advanced Analytics',
  priorityQueue: 'Priority Send Queue',
};
*/

const CHECK_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="8" cy="8" r="8" fill="var(--accent, #f48d16)" opacity="0.12" />
    <path d="M4.5 8l2.5 2.5 4.5-5" stroke="var(--accent, #f48d16)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const X_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="8" cy="8" r="8" fill="#6b7280" opacity="0.1" />
    <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#9ca3af" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export default function PlanCard({
  planKey,
  plan,
  isPopular,
  onUpgradeClick,
  isCurrentPlan,
  currency = 'USD'
}) {
  if (!plan) return null;

  const {
    name = planKey || '',
    priceMonthly = 0,
    priceINR = 425,
    inboxLimit = null,
    sendCapDaily = null
  } = plan;

  const isFree = priceMonthly === 0;

  // Dedicated email delivery feature matrix
  const featureRows = [
    {
      label: inboxLimit === null ? 'Unlimited Connected Inboxes' : `${inboxLimit} Connected Inbox (Gmail)`,
      enabled: true
    },
    {
      label: sendCapDaily === null ? 'Unlimited daily sends (Provider limits)' : `${sendCapDaily} emails / day`,
      enabled: true
    },
    {
      label: 'Smart Multi-Sheet Excel & CSV parser',
      enabled: true
    },
    {
      label: 'Dynamic tags ({{Name}}, {{Company}})',
      enabled: true
    },
    {
      label: 'Real-time delivery tracking & logs',
      enabled: true
    },
    {
      label: 'Zero disk storage (Safe in-memory SMTP)',
      enabled: true
    },
    {
      label: 'Priority email dispatch & faster rate',
      enabled: !isFree
    }
  ];

  /*
  // COMMENTED OUT: AI and non-email features removed as service is now email focused
  const nonEmailFeatures = [
    { label: `${teamSeats} team seats`, enabled: false },
    { label: 'AI personalization credits', enabled: false },
    { label: 'Verification credits', enabled: false },
    { label: 'CRM integration & webhook sync', enabled: false }
  ];
  */

  // Price formatting based on currency
  const displayPrice = isFree
    ? (currency === 'INR' ? '₹0' : 'Free')
    : (currency === 'INR' ? `₹${priceINR || 425}` : `$${priceMonthly}`);

  const conversionNote = isFree
    ? 'Free forever • No card needed'
    : currency === 'INR'
      ? `≈ $${priceMonthly} USD / month`
      : `≈ ₹${priceINR || 425} INR / month`;

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      flex: '1 1 280px',
      maxWidth: '340px',
      minWidth: '260px',
      background: isPopular ? 'linear-gradient(145deg, #f48d16 0%, #e07d0a 100%)' : 'var(--bg-surface)',
      border: isPopular ? 'none' : '1.5px solid var(--border)',
      borderRadius: '20px',
      padding: '32px 26px 26px',
      boxShadow: isPopular
        ? '0 20px 60px rgba(244, 141, 22, 0.38)'
        : '0 4px 24px rgba(0,0,0,0.06)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'default',
      textAlign: 'left'
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = isPopular ? '0 28px 72px rgba(244, 141, 22, 0.5)' : '0 12px 40px rgba(0,0,0,0.12)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = isPopular ? '0 20px 60px rgba(244, 141, 22, 0.38)' : '0 4px 24px rgba(0,0,0,0.06)';
    }}
    >
      {isPopular && (
        <div style={{
          position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
          background: '#251f19',
          color: '#fff', fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em',
          padding: '5px 16px', borderRadius: '20px', textTransform: 'uppercase', whiteSpace: 'nowrap',
          boxShadow: '0 4px 14px rgba(37, 31, 25, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}>
          Most Popular
        </div>
      )}

      <div style={{ marginBottom: '8px' }}>
        <p style={{
          margin: 0,
          fontSize: '13px',
          fontWeight: '700',
          color: isPopular ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em'
        }}>
          {name}
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '6px' }}>
          <span style={{ fontSize: '42px', fontWeight: '800', color: isPopular ? '#fff' : 'var(--text-primary)', lineHeight: 1 }}>
            {displayPrice}
          </span>
          {!isFree && (
            <span style={{ fontSize: '15px', color: isPopular ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)' }}>/mo</span>
          )}
        </div>
        <div style={{
          fontSize: '12px',
          marginTop: '6px',
          color: isPopular ? 'rgba(255,255,255,0.75)' : 'var(--text-secondary)',
          fontWeight: '500'
        }}>
          {conversionNote}
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: isPopular ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--border)', margin: '16px 0' }} />

      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 26px', display: 'flex', flexDirection: 'column', gap: '11px', flex: 1 }}>
        {featureRows.map(({ label, enabled }) => (
          <li key={label} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13.5px',
            lineHeight: 1.4,
            color: enabled ? (isPopular ? '#fff' : 'var(--text-primary)') : (isPopular ? 'rgba(255,255,255,0.45)' : 'var(--text-secondary)')
          }}>
            {enabled
              ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><circle cx="8" cy="8" r="8" fill={isPopular ? 'rgba(255,255,255,0.2)' : 'rgba(244, 141, 22, 0.12)'} /><path d="M4.5 8l2.5 2.5 4.5-5" stroke={isPopular ? '#fff' : 'var(--accent, #f48d16)'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
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
          width: '100%',
          padding: '13px',
          borderRadius: '12px',
          cursor: isCurrentPlan ? 'default' : 'pointer',
          fontSize: '14.5px',
          fontWeight: '700',
          background: isCurrentPlan ? 'rgba(0,0,0,0.06)' : '#ffffff',
          color: isCurrentPlan
            ? 'var(--text-muted)'
            : isPopular
              ? '#251f19'
              : 'var(--text-primary)',
          border: isCurrentPlan ? '1px solid transparent' : '1px solid rgba(37, 31, 25, 0.12)',
          boxShadow: isCurrentPlan ? 'none' : '0 2px 8px rgba(0,0,0,0.06)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
          letterSpacing: '0.01em',
        }}
        onMouseEnter={e => {
          if (!isCurrentPlan) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)';
          }
        }}
        onMouseLeave={e => {
          if (!isCurrentPlan) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
          }
        }}
      >
        {isCurrentPlan ? '✓ Current Plan' : isFree ? 'Get Started Free' : `Upgrade to ${name}`}
      </button>
    </div>
  );
}
