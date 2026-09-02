import React from 'react';

/**
 * Parley-styled brand wordmark:
 * Ultra-bold grotesque typography with signature stencil-slit cut through the letter 'e'.
 */
export default function Logo({ size = 'md', style = {}, onClick }) {
  const sizeStyles = {
    sm: { fontSize: '1.3rem' },
    md: { fontSize: '1.65rem' },
    lg: { fontSize: '2.4rem' },
    xl: { fontSize: '3.2rem' }
  };

  const selectedSize = typeof size === 'string' ? sizeStyles[size] || sizeStyles.md : { fontSize: `${size}px` };

  return (
    <div
      onClick={onClick}
      className="brand-wordmark"
      style={{
        cursor: onClick ? 'pointer' : 'default',
        ...selectedSize,
        ...style
      }}
      title="Outreacio"
    >
      <span>Outr</span>
      <span className="brand-wordmark-cut-e">e</span>
      <span>acio</span>
    </div>
  );
}
