import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, User, LogOut, Menu, X, Bell, Droplets, Users, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import BloodTypeBadge from '../ui/BloodTypeBadge';

const navLinks = [
  { path: '/',          label: 'Home'        },
  { path: '/donors',    label: 'Find Donors' },
  { path: '/requests',  label: 'Requests'    },
  { path: '/connections', label: 'Connections', authRequired: true },
  { path: '/dashboard', label: 'Dashboard', authRequired: true   },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen]     = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchPendingRequests();
      const interval = setInterval(fetchPendingRequests, 30000); // Check every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchPendingRequests = async () => {
    try {
      const res = await api.get('/connections/requests');
      setPendingCount(res.data?.length || 0);
    } catch (err) {
      console.error('Failed to fetch pending requests:', err);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); setProfileOpen(false); };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(255,255,255,0.82)',
      backdropFilter: 'blur(28px) saturate(200%)',
      WebkitBackdropFilter: 'blur(28px) saturate(200%)',
      borderBottom: '1px solid rgba(0,0,0,0.07)',
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '52px', padding: '0 20px',
      }}>

        {/* ── Logo ── */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(145deg, #FF453A, #FF3B30)',
            borderRadius: '9px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(255,59,48,0.38)',
          }}>
            <Heart size={16} color="#fff" fill="#fff" className="animate-heartbeat" />
          </div>
          <span style={{ fontSize: '17px', fontWeight: 800, color: 'var(--label)', letterSpacing: '-0.04em' }}>
            Life<span style={{ color: 'var(--red)' }}>Link</span>
          </span>
        </Link>

        {/* ── Desktop Nav — macOS toolbar style ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }} className="desktop-nav">
          {navLinks.map(link => {
            if (link.authRequired && !user) return null;
            const active = location.pathname === link.path;
            const isConnections = link.path === '/connections';
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  textDecoration: 'none',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: active ? 600 : 500,
                  color: active ? 'var(--red)' : 'var(--label-3)',
                  background: active ? 'rgba(255,59,48,0.09)' : 'transparent',
                  transition: 'all .15s',
                  letterSpacing: '-0.01em',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(120,120,128,0.1)'; e.currentTarget.style.color = 'var(--label)'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--label-3)'; } }}
              >
                {link.label}
                {isConnections && pendingCount > 0 && (
                  <span style={{
                    minWidth: '18px', height: '18px', padding: '0 5px',
                    background: 'var(--red)', borderRadius: '9px',
                    fontSize: '11px', fontWeight: 700, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* ── Right side ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {user ? (
            <>

              {/* Profile pill */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    padding: '4px 10px 4px 4px',
                    background: 'rgba(120,120,128,0.1)',
                    border: 'none', borderRadius: '10px',
                    cursor: 'pointer', transition: 'background .15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(120,120,128,0.18)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(120,120,128,0.1)'}
                >
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '7px',
                    background: 'linear-gradient(145deg, #FF453A, #FF3B30)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '11px', fontWeight: 700,
                  }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--label-2)', letterSpacing: '-0.01em' }}>
                    {user.name?.split(' ')[0]}
                  </span>
                  <BloodTypeBadge type={user.bloodType} size="sm" />
                </button>

                {/* Dropdown — macOS popover style */}
                {profileOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: 'rgba(255,255,255,0.92)',
                    backdropFilter: 'blur(32px) saturate(200%)',
                    WebkitBackdropFilter: 'blur(32px) saturate(200%)',
                    borderRadius: '14px',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.06)',
                    minWidth: '200px', overflow: 'hidden',
                    animation: 'scaleIn .2s cubic-bezier(.16,1,.3,1)',
                    transformOrigin: 'top right',
                    zIndex: 200,
                  }}>
                    <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid rgba(60,60,67,0.1)' }}>
                      <p style={{ fontWeight: 700, fontSize: '14px', color: 'var(--label)' }}>{user.name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--label-4)', marginTop: '2px' }}>{user.phone}</p>
                    </div>
                    <div style={{ padding: '6px' }}>
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '9px',
                          padding: '9px 10px', borderRadius: '9px',
                          textDecoration: 'none', color: 'var(--label-2)',
                          fontSize: '14px', fontWeight: 500, transition: 'background .12s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(120,120,128,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <User size={14} /> My Profile
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setProfileOpen(false)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '9px',
                            padding: '9px 10px', borderRadius: '9px',
                            textDecoration: 'none', color: 'var(--blue)',
                            fontSize: '14px', fontWeight: 500, transition: 'background .12s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,122,255,0.08)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <Shield size={14} /> Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '9px',
                          padding: '9px 10px', borderRadius: '9px',
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--red)', fontSize: '14px', fontWeight: 500,
                          width: '100%', transition: 'background .12s', fontFamily: 'inherit',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,59,48,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '6px' }}>
              <Link to="/login" style={{
                textDecoration: 'none', padding: '7px 16px',
                borderRadius: '9px', fontSize: '14px', fontWeight: 600,
                color: 'var(--label-2)', background: 'rgba(120,120,128,0.1)',
                transition: 'background .15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(120,120,128,0.18)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(120,120,128,0.1)'}
              >
                Sign In
              </Link>
              <Link to="/register" style={{
                textDecoration: 'none', padding: '7px 16px',
                borderRadius: '9px', fontSize: '14px', fontWeight: 600,
                color: '#fff',
                background: 'linear-gradient(180deg, #FF453A 0%, #FF3B30 100%)',
                boxShadow: '0 2px 8px rgba(255,59,48,0.35)',
                transition: 'all .15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.06)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Join Now
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="mobile-menu-btn"
            style={{
              display: 'none', width: '32px', height: '32px',
              borderRadius: '8px', background: 'rgba(120,120,128,0.1)',
              border: 'none', cursor: 'pointer',
              alignItems: 'center', justifyContent: 'center', color: 'var(--label-2)',
            }}
          >
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          padding: '8px 12px 14px',
          borderTop: '1px solid rgba(60,60,67,0.08)',
          display: 'flex', flexDirection: 'column', gap: '2px',
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}>
          {navLinks.map(link => {
            if (link.authRequired && !user) return null;
            const isConnections = link.path === '/connections';
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                style={{
                  textDecoration: 'none', padding: '11px 14px',
                  borderRadius: '10px', fontSize: '15px', fontWeight: 500,
                  color: location.pathname === link.path ? 'var(--red)' : 'var(--label-2)',
                  background: location.pathname === link.path ? 'rgba(255,59,48,0.08)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                {link.label}
                {isConnections && pendingCount > 0 && (
                  <span style={{
                    minWidth: '20px', height: '20px', padding: '0 6px',
                    background: 'var(--red)', borderRadius: '10px',
                    fontSize: '12px', fontWeight: 700, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
