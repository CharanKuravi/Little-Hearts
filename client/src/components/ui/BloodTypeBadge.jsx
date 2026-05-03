import React from 'react';

/* Apple-style tinted pill badges for blood types */

const palette = {
  'A+':  { bg: 'rgba(255,59,48,0.10)',   text: '#C0392B', border: 'rgba(255,59,48,0.18)'  },
  'A-':  { bg: 'rgba(255,149,0,0.10)',   text: '#9A5700', border: 'rgba(255,149,0,0.18)'  },
  'B+':  { bg: 'rgba(52,199,89,0.10)',   text: '#1A7F37', border: 'rgba(52,199,89,0.18)'  },
  'B-':  { bg: 'rgba(0,122,255,0.10)',   text: '#0055CC', border: 'rgba(0,122,255,0.18)'  },
  'AB+': { bg: 'rgba(175,82,222,0.10)',  text: '#6A1B9A', border: 'rgba(175,82,222,0.18)' },
  'AB-': { bg: 'rgba(255,45,85,0.10)',   text: '#A8003A', border: 'rgba(255,45,85,0.18)'  },
  'O+':  { bg: 'rgba(255,204,0,0.12)',   text: '#7A5800', border: 'rgba(255,204,0,0.22)'  },
  'O-':  { bg: 'rgba(90,200,250,0.12)',  text: '#005F7A', border: 'rgba(90,200,250,0.22)' },
};

const sizes = {
  sm: { fontSize: '11px', padding: '2px 8px',  fontWeight: 700, borderRadius: '6px'  },
  md: { fontSize: '13px', padding: '4px 10px', fontWeight: 700, borderRadius: '8px'  },
  lg: { fontSize: '15px', padding: '5px 12px', fontWeight: 800, borderRadius: '9px'  },
  xl: { fontSize: '20px', padding: '7px 16px', fontWeight: 800, borderRadius: '11px' },
};

export default function BloodTypeBadge({ type, size = 'md' }) {
  const c = palette[type] || { bg: 'rgba(120,120,128,0.1)', text: 'var(--label-3)', border: 'rgba(120,120,128,0.15)' };
  const s = sizes[size] || sizes.md;

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      background: c.bg, color: c.text,
      border: `1px solid ${c.border}`,
      whiteSpace: 'nowrap', letterSpacing: '0.01em',
      ...s,
    }}>
      {type}
    </span>
  );
}
