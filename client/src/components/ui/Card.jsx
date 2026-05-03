import React from 'react';

/* Apple-style card with subtle shadow and hover lift */

export default function Card({ children, style = {}, onClick, hover = false, padding = '20px', glass = false }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background: glass ? 'rgba(255,255,255,0.78)' : '#fff',
        backdropFilter: glass ? 'blur(24px) saturate(180%)' : 'none',
        WebkitBackdropFilter: glass ? 'blur(24px) saturate(180%)' : 'none',
        borderRadius: '18px',
        padding,
        boxShadow: hovered
          ? '0 8px 32px rgba(0,0,0,0.11), 0 2px 8px rgba(0,0,0,0.06)'
          : '0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        border: glass ? '1px solid rgba(255,255,255,0.55)' : '1px solid rgba(0,0,0,0.05)',
        transition: 'all .22s cubic-bezier(.16,1,.3,1)',
        transform: hovered ? 'translateY(-3px)' : 'none',
        cursor: onClick ? 'pointer' : 'default',
        ...style
      }}
    >
      {children}
    </div>
  );
}
