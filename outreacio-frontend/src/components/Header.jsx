import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import Logo from './Logo';

export default function Header({ 
  currentView, 
  onToggleView, 
  onNavigateView, 
  onOpenHelp, 
  onResetAll,
  user,
  onLogout,
  onRequireAuth
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const handleLaunchClick = () => {
    if (user) {
      navigate('dashboard');
    } else if (onRequireAuth) {
      onRequireAuth();
    } else {
      navigate('login');
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="top-capsule-navbar-wrapper">
      <header className="top-capsule-navbar">
        {/* Inverted (Concave) Top Corner Curves */}
        <div className="top-capsule-corner top-capsule-corner-left" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24" preserveAspectRatio="none">
            <path
              d="M 0 0 A 24 24 0 0 1 24 24 L 26 24 L 26 0 L 0 0 Z"
              fill="var(--bg-primary, #f7f7f4)"
            />
            <path
              d="M 0 0 A 24 24 0 0 1 23.5 24.5"
              stroke="#000000"
              strokeWidth="0.9"
              fill="none"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        <div className="top-capsule-corner top-capsule-corner-right" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24" preserveAspectRatio="none">
            <path
              d="M 0 24 A 24 24 0 0 1 24 0 L -2 0 L -2 24 L 0 24 Z"
              fill="var(--bg-primary, #f7f7f4)"
            />
            <path
              d="M 0.5 24.5 A 24 24 0 0 1 24 0"
              stroke="#000000"
              strokeWidth="0.9"
              fill="none"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        {/* Left: Brand Logo */}
        <Logo size="md" onClick={() => navigate('landing')} />

      {/* Right: Nav Links & Auth / CTA Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <nav className="top-capsule-nav-links">
          <button
            type="button"
            className={`top-capsule-nav-link ${currentView === 'landing' ? 'active' : ''}`}
            onClick={() => navigate('landing', 'benefits')}
          >
            Features
          </button>
          <span style={{ fontSize: '10px', color: 'rgba(37, 31, 25, 0.4)' }}>▪</span>

          <button
            type="button"
            className="top-capsule-nav-link"
            onClick={() => navigate('landing', 'how-it-works-sec')}
          >
            Workflows
          </button>
          <span style={{ fontSize: '10px', color: 'rgba(37, 31, 25, 0.4)' }}>▪</span>

          <button
            type="button"
            className={`top-capsule-nav-link ${currentView === 'pricing' ? 'active' : ''}`}
            onClick={() => navigate('pricing')}
          >
            Pricing
          </button>
          <span style={{ fontSize: '10px', color: 'rgba(37, 31, 25, 0.4)' }}>▪</span>

          <button
            type="button"
            className={`top-capsule-nav-link ${currentView === 'contact' ? 'active' : ''}`}
            onClick={() => navigate('contact')}
          >
            Contact
          </button>
        </nav>

        {/* User Authenticated Profile Dropdown (Parley Dark Aesthetic) */}
        {user ? (
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="parley-chat-btn"
              style={{
                padding: '4px 14px 4px 4px',
                gap: '10px'
              }}
            >
              <div 
                className="parley-chat-icon" 
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '8px', 
                  background: '#f48d16',
                  color: '#251f19',
                  fontSize: '14px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {(user.name || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <span style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#ffffff',
                maxWidth: '130px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {user.name || user.email?.split('@')[0]}
              </span>
              <ChevronDown size={14} color="rgba(255, 255, 255, 0.7)" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                background: 'var(--bg-white)',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                padding: '8px',
                minWidth: '220px',
                boxShadow: '0 10px 30px rgba(37, 31, 25, 0.1)',
                zIndex: 200,
                animation: 'fadeIn 0.2s ease'
              }}>
                <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', marginBottom: '6px' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {user.name || 'User'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                    {user.email}
                  </div>
                </div>

                {currentView !== 'dashboard' && (
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('dashboard');
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      background: 'none',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '500',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    <LayoutDashboard size={15} color="var(--accent)" />
                    <span>Open Dashboard</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    onLogout?.();
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    background: 'none',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: 'var(--error)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--error-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <LogOut size={15} />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Unauthenticated CTA Button */
          <button
            onClick={handleLaunchClick}
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
    </div>
  );
}
