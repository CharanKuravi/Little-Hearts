import React from 'react';

/* Apple-style button system
   Variants: primary | secondary | ghost | tinted | green | blue | danger | destructive
   Sizes:    sm | md | lg | full
*/

const variants = {
  primary: {
    background: 'linear-gradient(180deg, #FF453A 0%, #FF3B30 100%)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 1px 0 rgba(255,255,255,0.18) inset, 0 4px 14px rgba(255,59,48,0.38)',
  },
  secondary: {
    background: 'rgba(255,59,48,0.10)',
    color: '#FF3B30',
    border: 'none',
    boxShadow: 'none',
  },
  ghost: {
    background: 'rgba(120,120,128,0.12)',
    color: 'var(--label-2)',
    border: 'none',
    boxShadow: 'none',
  },
  tinted: {
    background: 'rgba(0,122,255,0.10)',
    color: '#007AFF',
    border: 'none',
    boxShadow: 'none',
  },
  green: {
    background: 'linear-gradient(180deg, #30D158 0%, #34C759 100%)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 1px 0 rgba(255,255,255,0.18) inset, 0 4px 14px rgba(52,199,89,0.35)',
  },
  blue: {
    background: 'linear-gradient(180deg, #409CFF 0%, #007AFF 100%)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 1px 0 rgba(255,255,255,0.18) inset, 0 4px 14px rgba(0,122,255,0.35)',
  },
  danger: {
    background: 'rgba(255,59,48,0.10)',
    color: '#FF3B30',
    border: 'none',
    boxShadow: 'none',
  },
  destructive: {
    background: 'linear-gradient(180deg, #FF453A 0%, #FF3B30 100%)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 4px 14px rgba(255,59,48,0.38)',
  },
  outline: {
    background: '#fff',
    color: '#FF3B30',
    border: '1.5px solid rgba(255,59,48,0.35)',
    boxShadow: 'none',
  },
};

const sizes = {
  sm:   { padding: '6px 14px',  fontSize: '13px', borderRadius: '10px', fontWeight: 600, height: '30px' },
  md:   { padding: '9px 20px',  fontSize: '15px', borderRadius: '12px', fontWeight: 600, height: '38px' },
  lg:   { padding: '13px 26px', fontSize: '17px', borderRadius: '14px', fontWeight: 600, height: '50px' },
  full: { padding: '13px 26px', fontSize: '17px', borderRadius: '14px', fontWeight: 600, width: '100%', height: '50px' },
};

export default function Button({
  children, variant = 'primary', size = 'md',
  onClick, disabled, loading, type = 'button', style = {}, icon,
}) {
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '7px',
        fontFamily: 'inherit',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.42 : 1,
        transition: 'all .18s cubic-bezier(.16,1,.3,1)',
        outline: 'none',
        letterSpacing: '-0.01em',
        whiteSpace: 'nowrap',
        ...v, ...s, ...style,
      }}
      onMouseEnter={e => {
        if (!disabled && !loading) {
          e.currentTarget.style.filter = 'brightness(1.06)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.filter = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
      onMouseDown={e => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'scale(0.97)';
          e.currentTarget.style.filter = 'brightness(0.96)';
        }
      }}
      onMouseUp={e => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.filter = 'brightness(1.06)';
      }}
    >
      {loading ? (
        <span style={{
          width: '15px', height: '15px',
          border: '2px solid rgba(255,255,255,0.35)',
          borderTopColor: variant === 'ghost' || variant === 'secondary' || variant === 'tinted' || variant === 'danger' ? 'currentColor' : '#fff',
          borderRadius: '50%',
          animation: 'spin .65s linear infinite',
          display: 'inline-block', flexShrink: 0,
        }} />
      ) : icon}
      {children}
    </button>
  );
}
