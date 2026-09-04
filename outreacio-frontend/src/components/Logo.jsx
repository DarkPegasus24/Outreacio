import React from 'react';

/**
 * Outreacio brand logo:
 * New icon + wordmark side by side.
 */
export default function Logo({ size = 'md', style = {}, onClick }) {
  const sizeStyles = {
    sm: { fontSize: '1.3rem', imgSize: '28px' },
    md: { fontSize: '1.65rem', imgSize: '36px' },
    lg: { fontSize: '2.4rem', imgSize: '52px' },
    xl: { fontSize: '3.2rem', imgSize: '68px' }
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
