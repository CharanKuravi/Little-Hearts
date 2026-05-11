import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, X, Info, Heart, Droplet } from 'lucide-react';
import { BLOOD_TYPES, COMPATIBILITY_MATRIX, getCompatibleRecipients, getCompatibleDonors } from '../data/compatibilityMatrix';
import Card from '../components/ui/Card';

const TYPE_COLORS = {
  'O-': '#FF3B30', 'O+': '#FF6B6B',
  'A-': '#007AFF', 'A+': '#409CFF',
  'B-': '#34C759', 'B+': '#30D158',
  'AB-': '#AF52DE', 'AB+': '#BF5AF2',
};

export default function CompatibilityPage() {
  const [searchParams] = useSearchParams();
  const initialHighlight = BLOOD_TYPES.includes(searchParams.get('highlight')) ? searchParams.get('highlight') : null;
  const [selected, setSelected] = useState(initialHighlight);

  const canDonate = selected ? getCompatibleRecipients(selected) : [];
  const canReceive = selected ? getCompatibleDonors(selected) : [];

  const isHighlighted = (donor, recipient) => {
    if (!selected) return false;
    return donor === selected || recipient === selected;
  };

  const isMatch = (donor, recipient) => COMPATIBILITY_MATRIX[donor]?.[recipient];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 800, color: 'var(--label)', letterSpacing: '-0.035em', marginBottom: '8px' }}>
          Blood Compatibility Chart
        </h1>
        <p style={{ color: 'var(--label-3)', fontSize: '15px' }}>
          Click any blood type to see who can donate to whom
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>
        {/* Matrix */}
        <Card padding="24px">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'separate', borderSpacing: '4px', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ padding: '8px', fontSize: '11px', fontWeight: 600, color: 'var(--label-4)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>
                    Donor ↓ / Recipient →
                  </th>
                  {BLOOD_TYPES.map(type => (
                    <th key={type} style={{ padding: '4px' }}>
                      <button onClick={() => setSelected(selected === type ? null : type)} style={{
                        width: '48px', height: '36px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                        background: selected === type ? TYPE_COLORS[type] : 'rgba(118,118,128,0.1)',
                        color: selected === type ? '#fff' : 'var(--label)',
                        fontSize: '12px', fontWeight: 700, fontFamily: 'inherit',
                        transition: 'all .15s',
                        boxShadow: selected === type ? `0 2px 8px ${TYPE_COLORS[type]}55` : 'none',
                      }}>
                        {type}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BLOOD_TYPES.map(donor => (
                  <tr key={donor}>
                    <td style={{ padding: '4px 8px 4px 4px' }}>
                      <button onClick={() => setSelected(selected === donor ? null : donor)} style={{
                        width: '52px', height: '36px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                        background: selected === donor ? TYPE_COLORS[donor] : 'rgba(118,118,128,0.1)',
                        color: selected === donor ? '#fff' : 'var(--label)',
                        fontSize: '12px', fontWeight: 700, fontFamily: 'inherit',
                        transition: 'all .15s',
                        boxShadow: selected === donor ? `0 2px 8px ${TYPE_COLORS[donor]}55` : 'none',
                      }}>
                        {donor}
                      </button>
                    </td>
                    {BLOOD_TYPES.map(recipient => {
                      const compatible = isMatch(donor, recipient);
                      const highlighted = isHighlighted(donor, recipient);
                      return (
                        <td key={recipient} style={{ padding: '4px' }}>
                          <div style={{
                            width: '48px', height: '36px', borderRadius: '10px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: compatible
                              ? highlighted ? 'rgba(52,199,89,0.25)' : 'rgba(52,199,89,0.1)'
                              : highlighted ? 'rgba(255,59,48,0.15)' : 'rgba(118,118,128,0.06)',
                            border: highlighted ? `1.5px solid ${compatible ? 'rgba(52,199,89,0.5)' : 'rgba(255,59,48,0.3)'}` : '1.5px solid transparent',
                            transition: 'all .15s',
                          }}>
                            {compatible
                              ? <Check size={14} color={highlighted ? '#1A7F37' : 'var(--green)'} strokeWidth={2.5} />
                              : <X size={12} color={highlighted ? 'var(--red)' : 'var(--label-4)'} strokeWidth={2} />
                            }
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--sep)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--label-3)' }}>
              <Check size={12} color="var(--green)" strokeWidth={2.5} /> Compatible
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--label-3)' }}>
              <X size={12} color="var(--label-4)" strokeWidth={2} /> Incompatible
            </div>
            <div style={{ fontSize: '12px', color: 'var(--label-4)' }}>Click a blood type to highlight</div>
          </div>
        </Card>

        {/* Summary panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {selected ? (
            <>
              <Card padding="18px">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: TYPE_COLORS[selected], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: 800 }}>
                    {selected}
                  </div>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--label)' }}>Blood Type {selected}</p>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--label-4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Can donate to</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {canDonate.map(t => (
                      <span key={t} style={{ padding: '3px 10px', background: 'rgba(52,199,89,0.1)', color: '#1A7F37', border: '1px solid rgba(52,199,89,0.2)', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>{t}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--label-4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Can receive from</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {canReceive.map(t => (
                      <span key={t} style={{ padding: '3px 10px', background: 'rgba(0,122,255,0.1)', color: 'var(--blue)', border: '1px solid rgba(0,122,255,0.2)', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>{t}</span>
                    ))}
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <Card padding="18px">
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{ width: '48px', height: '48px', background: 'rgba(255,59,48,0.08)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Droplet size={22} color="var(--red)" />
                </div>
                <p style={{ fontSize: '14px', color: 'var(--label-3)' }}>Select a blood type to see compatibility details</p>
              </div>
            </Card>
          )}

          {/* Quick facts */}
          <Card padding="18px">
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--label-4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Quick Facts</p>
            {[
              { label: 'Universal Donor', value: 'O-', desc: 'Can donate to all types' },
              { label: 'Universal Recipient', value: 'AB+', desc: 'Can receive from all types' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'rgba(118,118,128,0.06)', borderRadius: '10px', marginBottom: i === 0 ? '8px' : 0 }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: TYPE_COLORS[f.value], background: `${TYPE_COLORS[f.value]}18`, padding: '3px 8px', borderRadius: '7px' }}>{f.value}</span>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--label)' }}>{f.label}</p>
                  <p style={{ fontSize: '11px', color: 'var(--label-4)' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* Educational section */}
      <div style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {[
          {
            title: 'ABO & Rh Blood Groups',
            icon: <Droplet size={18} color="var(--red)" />,
            bg: 'rgba(255,59,48,0.06)',
            content: 'Blood type is determined by antigens on red blood cells. The ABO system classifies blood as A, B, AB, or O. The Rh factor adds a + or - to each type. Mismatched transfusions can cause serious immune reactions, which is why compatibility matters.'
          },
          {
            title: 'Thalassemia & Blood Transfusions',
            icon: <Heart size={18} color="var(--purple)" fill="var(--purple)" />,
            bg: 'rgba(175,82,222,0.06)',
            content: 'Thalassemia is a genetic blood disorder where the body produces abnormal hemoglobin. Patients with severe thalassemia require blood transfusions every 2–4 weeks throughout their lives — up to 500–700 transfusions in a lifetime. Reliable, compatible donors are critical for their survival.'
          },
          {
            title: 'Donation Eligibility',
            icon: <Info size={18} color="var(--blue)" />,
            bg: 'rgba(0,122,255,0.06)',
            content: 'To donate blood: you must be 18–65 years old, weigh at least 45kg, be in good health, and wait at least 60 days between whole blood donations. Certain medications and recent illnesses may temporarily disqualify you. Always consult a medical professional before donating.'
          },
        ].map((section, i) => (
          <Card key={i} padding="20px" style={{ background: section.bg }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              {section.icon}
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--label)' }}>{section.title}</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--label-2)', lineHeight: 1.6 }}>{section.content}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
