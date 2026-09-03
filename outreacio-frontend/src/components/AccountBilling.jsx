import React, { useEffect, useState } from 'react';
import UpgradeModal from './UpgradeModal';
import { fetchCurrentPlan, fetchUsage } from '../api/planService.js';
import { SkeletonBilling } from './SkeletonLoader';

function UsageMeter({ label, used, limit, color = 'var(--primary)' }) {
  const pct = limit === null || limit === Infinity
    ? 0
    : Math.min(100, Math.round((used / limit) * 100));
  const isUnlimited = limit === null || limit === Infinity;
  const isWarning = pct >= 80;

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
        <span style={{ color: 'var(--text-primary)' }}>{label}</span>
        <span style={{ color: isWarning ? '#ef4444' : 'var(--text-secondary)' }}>
          {isUnlimited ? `${used.toLocaleString()} used (Unlimited)` : `${used.toLocaleString()} / ${limit.toLocaleString()}`}
        </span>
      </div>
      {!isUnlimited && (
        <div style={{ height: '8px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: isWarning ? 'linear-gradient(90deg,#f59e0b,#ef4444)' : color,
            borderRadius: '99px',
            transition: 'width 0.6s ease',
          }} />
        </div>
      )}
    </div>
  );
}

export default function AccountBilling({ csrfToken, onUpgradeSuccess: parentUpgradeSuccess }) {
  const [planData, setPlanData] = useState(null);
  const [usageData, setUsageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [allPlans, setAllPlans] = useState({});
  const [toast, setToast] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [plan, usage, plansRaw] = await Promise.all([
        fetchCurrentPlan().catch(() => null),
        fetchUsage().catch(() => null),
        fetch('/api/plans').then(r => r.json()).then(d => d.plans || {}).catch(() => ({})),
      ]);
      setPlanData(plan);
      setUsageData(usage);
      setAllPlans(plansRaw);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const handleUpgradeSuccess = (result) => {
    showToast(`🎉 ${result.message || 'Plan upgraded!'}`);
    load(); // refresh usage & plan
    if (parentUpgradeSuccess) parentUpgradeSuccess(result);
  };

  if (loading) {
    return <SkeletonBilling />;
  }

  const currentPlanId = planData?.planId || 'free';
  const plan = planData?.plan;
  const usage = usageData?.usage || {};
  const limits = usageData?.limits || {};

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 20px 80px', fontFamily: 'inherit' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(90deg, #22c55e, #16a34a)',
          color: '#fff', padding: '14px 28px', borderRadius: '14px',
          fontWeight: '700', fontSize: '15px', boxShadow: '0 8px 32px rgba(34,197,94,0.4)',
          zIndex: 9999, whiteSpace: 'nowrap',
        }}>
          {toast}
        </div>
      )}

      <h1 style={{ margin: '0 0 4px', fontSize: '26px', fontWeight: '800' }}>Billing & Usage</h1>
      <p style={{ margin: '0 0 36px', color: 'var(--text-secondary)', fontSize: '14px' }}>
        Your current plan, usage counters, and upgrade options.
      </p>

      {/* Current Plan Card */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%)',
        borderRadius: '20px', padding: '28px 32px', marginBottom: '28px',
        color: '#fff', boxShadow: '0 12px 40px rgba(99,102,241,0.3)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: '700', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Current Plan</p>
            <h2 style={{ margin: 0, fontSize: '32px', fontWeight: '900' }}>
              {plan?.name || 'Free'}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '14px', opacity: 0.75 }}>
              {plan?.priceMonthly === 0 ? 'Free forever' : `$${plan?.priceMonthly}/month`}
            </p>
          </div>
          <button
            onClick={() => setUpgradeOpen(true)}
            style={{
              padding: '10px 24px', borderRadius: '12px', border: '1.5px solid rgba(255,255,255,0.35)',
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
              color: '#fff', fontWeight: '700', fontSize: '14px', cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
          >
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Usage Meters */}
      <div style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border)', borderRadius: '20px', padding: '28px 32px', marginBottom: '28px' }}>
        <h3 style={{ margin: '0 0 24px', fontSize: '16px', fontWeight: '700' }}>This Month's Usage</h3>
        <UsageMeter
          label="Emails sent today"
          used={usage.sendsToday || 0}
          limit={limits.sendsPerDay === Infinity ? null : limits.sendsPerDay}
        />
        <UsageMeter
          label="AI credits used"
          used={usage.aiCreditsUsed || 0}
          limit={limits.aiCreditsPerMonth === Infinity ? null : limits.aiCreditsPerMonth}
          color="linear-gradient(90deg,#8b5cf6,#6366f1)"
        />
        <UsageMeter
          label="Verification credits used"
          used={usage.verificationCreditsUsed || 0}
          limit={limits.verificationCreditsPerMonth === Infinity ? null : limits.verificationCreditsPerMonth}
          color="linear-gradient(90deg,#06b6d4,#3b82f6)"
        />
      </div>

      <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
        Daily send counts reset at midnight UTC. AI & verification credits reset on the 1st of each month.
      </p>

      <UpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        currentPlanId={currentPlanId}
        plans={allPlans}
        csrfToken={csrfToken || ''}
        onUpgradeSuccess={handleUpgradeSuccess}
      />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
