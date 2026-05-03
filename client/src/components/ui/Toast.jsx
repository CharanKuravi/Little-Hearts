import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

/* Apple-style notification banners */

const ToastContext = createContext(null);

const config = {
  success: { icon: <CheckCircle size={16} />, bg: 'rgba(52,199,89,0.12)',  border: 'rgba(52,199,89,0.25)',  color: '#1A7F37', iconColor: '#34C759' },
  error:   { icon: <XCircle    size={16} />, bg: 'rgba(255,59,48,0.10)',  border: 'rgba(255,59,48,0.22)',  color: '#C0392B', iconColor: '#FF3B30' },
  warning: { icon: <AlertCircle size={16}/>, bg: 'rgba(255,149,0,0.10)',  border: 'rgba(255,149,0,0.22)',  color: '#9A5700', iconColor: '#FF9500' },
  info:    { icon: <Info        size={16} />, bg: 'rgba(0,122,255,0.09)', border: 'rgba(0,122,255,0.20)',  color: '#0055CC', iconColor: '#007AFF' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'info', duration = 3800) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const remove = id => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{
        position: 'fixed', bottom: '28px', right: '24px',
        display: 'flex', flexDirection: 'column', gap: '10px',
        zIndex: 9999, maxWidth: '360px', width: '100%',
        pointerEvents: 'none',
      }}>
        {toasts.map(t => {
          const c = config[t.type] || config.info;
          return (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'center', gap: '11px',
              background: 'rgba(255,255,255,0.88)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              border: `1px solid ${c.border}`,
              borderRadius: '14px',
              padding: '13px 15px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
              animation: 'slideUp .3s cubic-bezier(.16,1,.3,1)',
              pointerEvents: 'all',
            }}>
              <span style={{ color: c.iconColor, display: 'flex', flexShrink: 0 }}>{c.icon}</span>
              <span style={{ flex: 1, fontSize: '14px', fontWeight: 500, color: c.color, letterSpacing: '-0.01em' }}>
                {t.message}
              </span>
              <button
                onClick={() => remove(t.id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--label-4)', display: 'flex', padding: '2px',
                  flexShrink: 0,
                }}
              >
                <X size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
