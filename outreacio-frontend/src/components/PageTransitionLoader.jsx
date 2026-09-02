import React from 'react';
import Logo from './Logo';

export default function PageTransitionLoader({ targetView }) {
  const getLabel = () => {
    switch (targetView) {
      case 'dashboard':
        return 'Opening Dashboard...';
      case 'contact':
        return 'Loading Contact & Support...';
      case 'login':
        return 'Opening Sign In...';
      case 'landing':
      default:
        return 'Loading Home...';
    }
  };

  return (
    <div style={{
      minHeight: '65vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '40px 20px',
      animation: 'fadeIn 0.3s ease'
    }}>
      {/* Branded Logo with Pulse Effect */}
      <div style={{
        marginBottom: '28px',
        animation: 'pulse 1.8s infinite ease-in-out'
      }}>
        <Logo size="lg" />
      </div>

      {/* Modern Circular Spinner */}
      <div style={{
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        border: '3px solid rgba(37, 31, 25, 0.1)',
        borderTopColor: 'var(--accent, #f48d16)',
        animation: 'spin 0.8s linear infinite',
        marginBottom: '18px'
      }} />

      {/* Label */}
      <div style={{
        fontSize: '14.5px',
        fontWeight: '600',
        color: 'var(--text-secondary)',
        letterSpacing: '-0.01em'
      }}>
        {getLabel()}
      </div>
    </div>
  );
}
