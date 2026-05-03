import React, { useState } from 'react';

/* Apple-style text field */

export default function Input({
  label, type = 'text', value, onChange, placeholder,
  required, error, icon, hint, name, min, max, disabled, onKeyDown,
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {label && (
        <label style={{
          fontSize: '13px', fontWeight: 600,
          color: 'var(--label-2)',
          letterSpacing: '-0.005em',
        }}>
          {label}
          {required && <span style={{ color: 'var(--red)', marginLeft: '3px' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{
            position: 'absolute', left: '13px', top: '50%',
            transform: 'translateY(-50%)',
            color: focused ? 'var(--blue)' : 'var(--label-4)',
            display: 'flex', alignItems: 'center',
            transition: 'color .18s', pointerEvents: 'none',
          }}>
            {icon}
          </span>
        )}
        <input
          type={type} name={name} value={value}
          onChange={onChange} placeholder={placeholder}
          required={required} disabled={disabled}
          min={min} max={max} onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            padding: icon ? '11px 13px 11px 40px' : '11px 13px',
            fontSize: '15px',
            fontFamily: 'inherit',
            background: disabled ? 'var(--fill-4)' : focused ? '#fff' : 'rgba(118,118,128,0.08)',
            border: `1.5px solid ${error ? 'var(--red)' : focused ? 'var(--blue)' : 'transparent'}`,
            borderRadius: '11px',
            outline: 'none',
            color: 'var(--label)',
            transition: 'all .18s',
            boxShadow: focused ? '0 0 0 3.5px rgba(0,122,255,0.18)' : error ? '0 0 0 3.5px rgba(255,59,48,0.15)' : 'none',
            letterSpacing: '-0.01em',
          }}
        />
      </div>
      {error && <span style={{ fontSize: '12px', color: 'var(--red)', fontWeight: 500 }}>{error}</span>}
      {hint && !error && <span style={{ fontSize: '12px', color: 'var(--label-4)' }}>{hint}</span>}
    </div>
  );
}
