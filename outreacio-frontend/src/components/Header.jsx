import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, LayoutDashboard, ChevronDown, Sun, Moon, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
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
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const dropdownRef = useRef(null);
  const headerRef = useRef(null);

  const handleCloseMenu = (callback) => {
    setIsClosing(true);
    setTimeout(() => {
      setMobileMenuOpen(false);
      setIsClosing(false);
      if (typeof callback === 'function') {
        callback();
      }
    }, 220);
  };

  const navigate = (view, sectionId) => {
    if (mobileMenuOpen) {
      handleCloseMenu(() => {
        if (onNavigateView) {
          onNavigateView(view);
        } else if (currentView !== view) {
          onToggleView();
        }

        if (sectionId) {
          setTimeout(() => {
            const el = document.getElementById(sectionId);
            el?.scrollIntoView({ behavior: 'smooth' });
          }, 120);
        }
      });
      return;
    }

    setDropdownOpen(false);

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
    if (mobileMenuOpen) {
      handleCloseMenu(() => {
        if (user) {
          navigate('dashboard');
        } else if (onRequireAuth) {
          onRequireAuth();
        } else {
          navigate('login');
        }
      });
      return;
    }

    if (user) {
      navigate('dashboard');
    } else if (onRequireAuth) {
      onRequireAuth();
    } else {
      navigate('login');
    }
  };

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

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
      <header className="top-capsule-navbar" ref={headerRef}>
        {/* Inverted (Concave) Top Corner Curves (Desktop) */}
        <div className="top-capsule-corner top-capsule-corner-left" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24" preserveAspectRatio="none">
            <path
              d="M 0 0 A 24 24 0 0 1 24 24 L 26 24 L 26 0 L 0 0 Z"
              fill="var(--bg-primary, #f7f7f4)"
            />
            <path
              d="M 0 0 A 24 24 0 0 1 23.5 24.5"
              stroke="var(--navbar-border)"
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
              stroke="var(--navbar-border)"
              strokeWidth="0.9"
              fill="none"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        {/* Left: Brand Logo (Left corner) */}
        <div className="navbar-brand-container">
          <Logo size="md" onClick={() => navigate('landing')} />
        </div>

        {/* Right Desktop: Nav Links & Auth / CTA Button */}
        <div className="top-capsule-desktop-nav">
          <nav className="top-capsule-nav-links" style={{ gap: '4px' }}>
            <button
              type="button"
              className={`top-capsule-nav-link ${currentView === 'landing' ? 'active' : ''}`}
              onClick={() => navigate('landing', 'benefits')}
            >
              Features
            </button>

            <button
              type="button"
              className="top-capsule-nav-link"
              onClick={() => navigate('landing', 'how-it-works-sec')}
            >
              Workflows
            </button>

            <button
              type="button"
              className={`top-capsule-nav-link ${currentView === 'pricing' ? 'active' : ''}`}
              onClick={() => navigate('pricing')}
            >
              Pricing
            </button>

            <button
              type="button"
              className={`top-capsule-nav-link ${currentView === 'contact' ? 'active' : ''}`}
              onClick={() => navigate('contact')}
            >
              Contact
            </button>
          </nav>

          {/* Dark Mode Toggle — desktop */}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun size={16} className="theme-toggle-icon" />
            ) : (
              <Moon size={16} className="theme-toggle-icon" />
            )}
          </button>

          {/* User Authenticated Profile Dropdown */}
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
                  minWidth: '240px',
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

                  {/* Theme Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      toggleTheme();
                      setDropdownOpen(false);
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
                    {theme === 'dark' ? (
                      <>
                        <Sun size={15} color="var(--accent)" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon size={15} color="var(--accent)" />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </button>

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

        {/* Right Mobile: Hamburger Menu Button (Matches clean mobile header) */}
        <button
          type="button"
          className="mobile-menu-toggle-btn"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <div className="parley-hamburger-icon">
            <span />
            <span />
            <span />
          </div>
        </button>

        {/* Backdrop overlay on mobile */}
        {mobileMenuOpen && (
          <div
            className={`parley-mobile-backdrop ${isClosing ? 'closing' : ''}`}
            onClick={() => handleCloseMenu()}
            aria-hidden="true"
          />
        )}

        {/* Compact Attached Half-Height Mobile Menu Drawer with Smooth Animations */}
        {mobileMenuOpen && (
          <div className={`parley-mobile-menu-overlay ${isClosing ? 'closing' : ''}`}>
            {/* Top Bar inside Overlay */}
            <div className="parley-mobile-menu-header">
              <Logo size="md" onClick={() => navigate('landing')} />
              <button
                type="button"
                className="parley-mobile-close-btn"
                onClick={() => handleCloseMenu()}
                aria-label="Close menu"
              >
                <X size={26} strokeWidth={1.8} />
              </button>
            </div>

            {/* Menu Body */}
            <div className="parley-mobile-menu-body">
              {/* Workflows with Real 4 Steps */}
              <div className="parley-menu-group">
                <button
                  type="button"
                  className="parley-menu-main-link"
                  onClick={() => navigate('landing', 'how-it-works-sec')}
                >
                  Workflows
                </button>
                <div className="parley-menu-subitems-list">
                  <button
                    type="button"
                    className="parley-menu-subitem-link"
                    onClick={() => navigate('landing', 'how-it-works-sec')}
                  >
                    <span className="parley-orange-bullet" />
                    <span>Upload Your List</span>
                  </button>
                  <button
                    type="button"
                    className="parley-menu-subitem-link"
                    onClick={() => navigate('landing', 'how-it-works-sec')}
                  >
                    <span className="parley-orange-bullet" />
                    <span>Write Your Email</span>
                  </button>
                  <button
                    type="button"
                    className="parley-menu-subitem-link"
                    onClick={() => navigate('landing', 'how-it-works-sec')}
                  >
                    <span className="parley-orange-bullet" />
                    <span>Connect Gmail</span>
                  </button>
                  <button
                    type="button"
                    className="parley-menu-subitem-link"
                    onClick={() => navigate('landing', 'how-it-works-sec')}
                  >
                    <span className="parley-orange-bullet" />
                    <span>Send & Watch Live</span>
                  </button>
                </div>
              </div>

              {/* Pricing */}
              <div className="parley-menu-group">
                <button
                  type="button"
                  className={`parley-menu-main-link ${currentView === 'pricing' ? 'active' : ''}`}
                  onClick={() => navigate('pricing')}
                >
                  Pricing
                </button>
              </div>

              {/* Contact */}
              <div className="parley-menu-group">
                <button
                  type="button"
                  className={`parley-menu-main-link ${currentView === 'contact' ? 'active' : ''}`}
                  onClick={() => navigate('contact')}
                >
                  Contact
                </button>
              </div>
            </div>

            {/* Bottom Footer CTA */}
            <div className="parley-mobile-menu-footer">
              {user ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    background: 'var(--bg-surface)',
                    borderRadius: '10px'
                  }}>
                    <div style={{
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
                    }}>
                      {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {user.name || 'User'}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('dashboard')}
                    className="parley-mobile-hire-btn"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <div className="parley-mobile-hire-icon">
                      <LayoutDashboard size={18} />
                    </div>
                    <span>Open Dashboard</span>
                  </button>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={toggleTheme}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        background: 'none',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      {theme === 'dark' ? <Sun size={14} color="var(--accent)" /> : <Moon size={14} color="var(--accent)" />}
                      <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleCloseMenu(() => onLogout?.());
                      }}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid rgba(226, 75, 74, 0.2)',
                        background: 'rgba(226, 75, 74, 0.06)',
                        color: 'var(--error)',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <LogOut size={14} />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleLaunchClick}
                  className="parley-mobile-hire-btn"
                >
                  <div className="parley-mobile-hire-icon">
                    &gt;
                  </div>
                  <span>Get Started</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
