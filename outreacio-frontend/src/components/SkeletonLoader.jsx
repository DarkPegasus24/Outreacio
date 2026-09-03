import React from 'react';

export function SkeletonBox({ width = '100%', height = '20px', borderRadius = '10px', style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, rgba(37, 31, 25, 0.06) 25%, rgba(37, 31, 25, 0.12) 50%, rgba(37, 31, 25, 0.06) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite ease-in-out',
        ...style
      }}
    />
  );
}

export function SkeletonPlansGrid({ count = 4 }) {
  return (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', margin: '32px 0 60px' }}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          style={{
            flex: '1 1 220px',
            maxWidth: '280px',
            minWidth: '200px',
            background: 'var(--bg-surface, #eeede6)',
            border: '1.5px solid var(--border)',
            borderRadius: '20px',
            padding: '28px 24px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {/* Header & Price Skeleton */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <SkeletonBox width="40%" height="14px" />
            <SkeletonBox width="65%" height="36px" borderRadius="12px" />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0' }} />

          {/* Feature lines skeleton */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            <SkeletonBox width="85%" height="16px" />
            <SkeletonBox width="90%" height="16px" />
            <SkeletonBox width="75%" height="16px" />
            <SkeletonBox width="80%" height="16px" />
            <SkeletonBox width="60%" height="16px" />
          </div>

          {/* Button skeleton */}
          <SkeletonBox width="100%" height="44px" borderRadius="12px" style={{ marginTop: '12px' }} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '36px 20px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header section skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <SkeletonBox width="200px" height="28px" style={{ marginBottom: '8px' }} />
          <SkeletonBox width="300px" height="16px" />
        </div>
        <SkeletonBox width="130px" height="40px" borderRadius="12px" />
      </div>

      {/* KPI Cards Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ background: 'var(--bg-surface, #eeede6)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <SkeletonBox width="50%" height="14px" style={{ marginBottom: '12px' }} />
            <SkeletonBox width="70%" height="32px" borderRadius="8px" />
          </div>
        ))}
      </div>

      {/* Main Content Box Skeleton */}
      <div style={{ background: 'var(--bg-white, #fff)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <SkeletonBox width="30%" height="22px" style={{ marginBottom: '8px' }} />
        <SkeletonBox width="100%" height="48px" borderRadius="10px" />
        <SkeletonBox width="100%" height="48px" borderRadius="10px" />
        <SkeletonBox width="100%" height="48px" borderRadius="10px" />
      </div>
    </div>
  );
}

export function SkeletonBilling() {
  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <SkeletonBox width="220px" height="32px" style={{ marginBottom: '8px' }} />
      <div style={{ background: 'var(--bg-surface)', borderRadius: '20px', padding: '24px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <SkeletonBox width="40%" height="20px" />
        <SkeletonBox width="100%" height="12px" borderRadius="99px" />
        <SkeletonBox width="100%" height="12px" borderRadius="99px" />
        <SkeletonBox width="100%" height="12px" borderRadius="99px" />
      </div>
    </div>
  );
}

export default function SkeletonLoader({ type = 'dashboard' }) {
  if (type === 'plans') return <SkeletonPlansGrid />;
  if (type === 'billing') return <SkeletonBilling />;
  return <SkeletonDashboard />;
}
