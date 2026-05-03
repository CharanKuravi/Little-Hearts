import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/* macOS-style sheet / dialog */

export default function Modal({ isOpen, onClose, title, children, width = '520px' }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.36)',
        backdropFilter: 'blur(12px) saturate(160%)',
        WebkitBackdropFilter: 'blur(12px) saturate(160%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '20px',
        animation: 'fadeIn .22s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(40px) saturate(200%)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          borderRadius: '20px',
          width: '100%', maxWidth: width,
          maxHeight: '90vh', overflow: 'auto',
          boxShadow: '0 32px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.6) inset',
          animation: 'scaleIn .28s cubic-bezier(.16,1,.3,1)',
          border: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px 16px',
          borderBottom: '1px solid rgba(60,60,67,0.1)',
          position: 'sticky', top: 0,
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '20px 20px 0 0',
          zIndex: 1,
        }}>
          <h2 style={{
            fontSize: '17px', fontWeight: 700,
            color: 'var(--label)', letterSpacing: '-0.02em',
          }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '28px', height: '28px',
              borderRadius: '50%',
              background: 'rgba(120,120,128,0.16)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--label-3)', transition: 'background .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(120,120,128,0.26)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(120,120,128,0.16)'}
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>
        <div style={{ padding: '20px' }}>{children}</div>
      </div>
    </div>
  );
}
