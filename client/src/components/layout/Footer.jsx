import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: '#111827',
      color: '#9CA3AF',
      padding: '48px 24px 24px',
      marginTop: 'auto'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          marginBottom: '40px'
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{
                width: '36px', height: '36px',
                background: 'linear-gradient(135deg, #FF3B30, #FF6B6B)',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Heart size={18} color="#fff" fill="#fff" />
              </div>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>
                Little<span style={{ color: '#FF3B30' }}>Hearts</span>
              </span>
            </div>
            <p style={{ fontSize: '14px', lineHeight: 1.6, maxWidth: '240px' }}>
              Connecting blood donors with recipients. Every drop counts, every life matters.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#fff', fontWeight: 700, fontSize: '14px', marginBottom: '16px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Quick Links
            </h4>
            {[
              { to: '/', label: 'Home' },
              { to: '/donors', label: 'Find Donors' },
              { to: '/requests', label: 'Blood Requests' },
              { to: '/dashboard', label: 'Dashboard' },
            ].map(link => (
              <Link key={link.to} to={link.to} style={{
                display: 'block',
                color: '#9CA3AF',
                textDecoration: 'none',
                fontSize: '14px',
                marginBottom: '10px',
                transition: 'color 0.2s'
              }}
                onMouseEnter={e => e.currentTarget.style.color = '#FF3B30'}
                onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Blood Types */}
          <div>
            <h4 style={{ color: '#fff', fontWeight: 700, fontSize: '14px', marginBottom: '16px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Blood Types
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                <Link key={type} to={`/donors?bloodType=${type}`} style={{
                  padding: '4px 10px',
                  background: 'rgba(255,59,48,0.1)',
                  border: '1px solid rgba(255,59,48,0.2)',
                  borderRadius: '8px',
                  color: '#FF6B6B',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,59,48,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,59,48,0.1)'; }}
                >
                  {type}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: '#fff', fontWeight: 700, fontSize: '14px', marginBottom: '16px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Emergency
            </h4>
            {[
              { icon: <Phone size={14} />, text: '1-800-LIL-HEARTS' },
              { icon: <Mail size={14} />, text: 'help@littlehearts.org' },
              { icon: <MapPin size={14} />, text: 'Available Nationwide' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: '14px' }}>
                <span style={{ color: '#FF3B30' }}>{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <p style={{ fontSize: '13px' }}>
            © 2025 Little Hearts Blood Bank. Built to save lives.
          </p>
          <p style={{ fontSize: '13px' }}>
            Free. Transparent. Community-driven.
          </p>
        </div>
      </div>
    </footer>
  );
}
