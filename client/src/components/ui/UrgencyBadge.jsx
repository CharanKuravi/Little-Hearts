import React from 'react';

/* Apple-style tinted urgency indicators */

const config = {
  critical: { bg: 'rgba(255,59,48,0.10)',  text: '#C0392B', border: 'rgba(255,59,48,0.18)',  dot: '#FF3B30', label: 'Critical' },
  urgent:   { bg: 'rgba(255,149,0,0.10)',  text: '#9A5700', border: 'rgba(255,149,0,0.18)',  dot: '#FF9500', label: 'Urgent'   },
  normal:   { bg: 'rgba(52,199,89,0.10)',  text: '#1A7F37', border: 'rgba(52,199,89,0.18)',  dot: '#34C759', label: 'Normal'   },
};

export default function UrgencyBadge({ urgency }) {
  const c = config[urgency] || config.normal;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      background: c.bg, color: c.text,
      border: `1px solid ${c.border}`,
      borderRadius: '8px', fontSize: '12px', fontWeight: 600,
      padding: '3px 9px', whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%',
        background: c.dot, flexShrink: 0,
        ...(urgency === 'critical' ? { animation: 'pulse 1.4s ease infinite' } : {}),
      }} />
      {c.label}
    </span>
  );
}
