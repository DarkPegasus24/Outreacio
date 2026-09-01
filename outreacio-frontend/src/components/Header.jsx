import React from 'react';

export default function Header({ currentView, onToggleView, onNavigateView, onOpenHelp, onResetAll }) {
  const navigate = (view, sectionId) => {
    if (onNavigateView) {
      onNavigateView(view);
    } else if (currentView !== view) {
      onToggleView();
    }

    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: '#F7F7F4',
      boxShadow: 'none',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 0',
      marginBottom: '20px',
      flexWrap: 'wrap',
      gap: '16px'
    }}>
      {/* Left: Brand Logo */}
      <div 
        onClick={() => navigate('landing')}
        style={{
          fontSize: '1.45rem',
          fontWeight: '700',
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        Outreacio
      </div>

      {/* Right: Nav Links & Parley CTA Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          fontSize: '14.5px',
          fontWeight: '500',
          color: 'var(--text-primary)'
        }}>
          <a
            href="#benefits"
            onClick={(e) => {
              e.preventDefault();
              navigate('landing', 'benefits');
            }}
            style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
          >
            Features
          </a>
          <span style={{ fontSize: '10px', color: 'rgba(37, 31, 25, 0.4)' }}>▪</span>

          <a
            href="#how-it-works-sec"
            onClick={(e) => {
              e.preventDefault();
              navigate('landing', 'how-it-works-sec');
            }}
            style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
          >
            Workflows
          </a>
          <span style={{ fontSize: '10px', color: 'rgba(37, 31, 25, 0.4)' }}>▪</span>

          <a
            href="#pricing"
            onClick={(e) => {
              e.preventDefault();
              navigate('landing', 'pricing');
            }}
            style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
          >
            Pricing
          </a>
          <span style={{ fontSize: '10px', color: 'rgba(37, 31, 25, 0.4)' }}>▪</span>

          <a
            href="/contact"
            onClick={(e) => {
              e.preventDefault();
              navigate('contact');
            }}
            style={{
              color: currentView === 'contact' ? 'var(--accent)' : 'inherit',
              fontWeight: currentView === 'contact' ? '700' : '500',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
          >
            Contact
          </a>
        </nav>

        {/* Parley CTA Button (Only shown on Landing / Contact pages) */}
        {currentView !== 'dashboard' && (
          <button
            onClick={() => navigate('dashboard')}
            className="parley-chat-btn"
            style={{ padding: '4px 16px 4px 4px' }}
          >
            <div className="parley-chat-icon" style={{ width: '32px', height: '32px', fontSize: '15px' }}>
              &gt;
            </div>
            <span style={{ fontSize: '14px' }}>
              Open Outreacio
            </span>
          </button>
        )}
      </div>
    </header>
  );
}
