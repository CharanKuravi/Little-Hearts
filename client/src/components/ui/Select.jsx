import React, { useState } from 'react';

/* Apple-style select / picker */

export default function Select({
  label, value, onChange, options,
  placeholder = 'Select…', required, error, name, disabled,
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {label && (
        <label style={{
          fontSize: '13px', fontWeight: 600,
          color: 'var(--label-2)', letterSpacing: '-0.005em',
        }}>
          {label}
          {required && <span style={{ color: 'var(--red)', marginLeft: '3px' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <select
          name={name} value={value} onChange={onChange}
          required={required} disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            padding: '11px 36px 11px 13px',
            fontSize: '15px',
            fontFamily: 'inherit',
            background: disabled ? 'var(--fill-4)' : focused ? '#fff' : 'rgba(118,118,128,0.08)',
            border: `1.5px solid ${error ? 'var(--red)' : focused ? 'var(--blue)' : 'transparent'}`,
            borderRadius: '11px',
            outline: 'none',
            color: value ? 'var(--label)' : 'var(--label-4)',
            appearance: 'none',
            cursor: 'pointer',
            transition: 'all .18s',
            boxShadow: focused ? '0 0 0 3.5px rgba(0,122,255,0.18)' : 'none',
            letterSpacing: '-0.01em',
          }}
        >
          <option value="">{placeholder}</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span style={{
          position: 'absolute', right: '13px', top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none', color: 'var(--label-4)', fontSize: '11px',
        }}>▼</span>
      </div>
      {error && <span style={{ fontSize: '12px', color: 'var(--red)', fontWeight: 500 }}>{error}</span>}
    </div>
  );
}
