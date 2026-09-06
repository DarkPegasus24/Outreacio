import React from 'react';

/**
 * Outreacio brand logo:
 * Icon (desktop only) + wordmark text.
 */
export default function Logo({ size = 'md', style = {}, onClick }) {
  const sizeStyles = {
    sm: { fontSize: '1.25rem', imgSize: '26px' },
    md: { fontSize: '1.55rem', imgSize: '34px' },
    lg: { fontSize: '2.2rem', imgSize: '48px' },
    xl: { fontSize: '3.0rem', imgSize: '64px' }
  };

  const selected = typeof size === 'string' ? sizeStyles[size] || sizeStyles.md : { fontSize: `${size}px`, imgSize: `${size}px` };

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: onClick ? 'pointer' : 'default',
        ...style
      }}
      title="Outreacio"
    >
      <img
        src="/logo.png"
        alt="Outreacio Logo"
        className="brand-logo-icon"
        style={{
          width: selected.imgSize,
          height: selected.imgSize,
          objectFit: 'contain',
          flexShrink: 0
        }}
      />
      <div
        className="brand-wordmark"
        style={{ fontSize: selected.fontSize }}
      >
        <span>Outr</span>
        <span className="brand-wordmark-cut-e">e</span>
        <span>acio</span>
      </div>
    </div>
  );
}
