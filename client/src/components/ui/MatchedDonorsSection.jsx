import React, { useState, useEffect, forwardRef } from 'react';
import { Users, UserCheck, Zap, MapPin, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Card from './Card';
import BloodTypeBadge from './BloodTypeBadge';

const GRADIENTS = [
  'linear-gradient(145deg,#FF453A,#FF3B30)',
  'linear-gradient(145deg,#409CFF,#007AFF)',
  'linear-gradient(145deg,#30D158,#34C759)',
  'linear-gradient(145deg,#BF5AF2,#AF52DE)',
  'linear-gradient(145deg,#FF9F0A,#FF9500)',
];

const MatchedDonorsSection = forwardRef(function MatchedDonorsSection({ requestId, requestStatus, viewerId }, ref) {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isClosed = requestStatus === 'fulfilled' || requestStatus === 'cancelled';

  useEffect(() => {
    if (!isClosed && requestId) fetchMatches();
  }, [requestId, requestStatus]);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/requests/${requestId}/matches`);
      setMatches(res.data.matches || []);
    } catch (err) {
      if (err.response?.status !== 401) setError('Could not load matched donors');
    } finally {
      setLoading(false);
    }
  };

  if (isClosed) return null;

  return (
    <div ref={ref} style={{ marginTop: '16px' }}>
      <Card padding="22px">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <div style={{ width: '36px', height: '36px', background: 'rgba(0,122,255,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={18} color="var(--blue)" strokeWidth={2.5} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--label)', letterSpacing: '-0.02em' }}>
              AI-Matched Donors
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--label-4)', marginTop: '1px' }}>
              Ranked by compatibility, location, and availability
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ width: '40px', height: '40px', background: 'rgba(0,122,255,0.08)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', animation: 'pulse 1.5s ease-in-out infinite' }}>
              <Users size={20} color="var(--blue)" />
            </div>
            <p style={{ color: 'var(--label-3)', fontSize: '13px' }}>Finding best matches...</p>
          </div>
        ) : error ? (
          <p style={{ color: 'var(--label-3)', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>{error}</p>
        ) : matches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(118,118,128,0.08)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Users size={22} color="var(--label-4)" />
            </div>
            <p style={{ color: 'var(--label-3)', fontSize: '14px', fontWeight: 600 }}>No compatible donors found</p>
            <p style={{ color: 'var(--label-4)', fontSize: '13px', marginTop: '4px' }}>Try posting in more cities or adjusting the request</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {matches.map((donor, i) => {
              const initials = donor.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
              const grad = GRADIENTS[donor.name?.charCodeAt(0) % GRADIENTS.length];
              const scoreColor = donor.matchPercent >= 80 ? 'var(--green)' : donor.matchPercent >= 50 ? 'var(--orange)' : 'var(--label-3)';
              const scoreBg = donor.matchPercent >= 80 ? 'rgba(52,199,89,0.1)' : donor.matchPercent >= 50 ? 'rgba(255,149,0,0.1)' : 'rgba(118,118,128,0.1)';

              return (
                <div key={donor._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px', background: 'rgba(118,118,128,0.05)', borderRadius: '12px', border: '1px solid rgba(118,118,128,0.08)' }}>
                  {/* Rank */}
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--label-4)', minWidth: '18px', textAlign: 'center' }}>#{i + 1}</span>

                  {/* Avatar */}
                  <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 700, flexShrink: 0 }}>
                    {initials}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--label)' }}>{donor.name}</span>
                      <BloodTypeBadge type={donor.bloodType} size="sm" />
                      {donor.isAvailable && (
                        <span style={{ fontSize: '10px', fontWeight: 600, background: 'rgba(52,199,89,0.1)', color: '#1A7F37', border: '1px solid rgba(52,199,89,0.2)', borderRadius: '6px', padding: '1px 6px' }}>Available</span>
                      )}
                    </div>
                    {donor.cityHidden ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--label-4)' }}>
                        <Lock size={10} /> Location hidden
                      </div>
                    ) : donor.city ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--label-3)' }}>
                        <MapPin size={10} /> {donor.city}
                      </div>
                    ) : null}
                  </div>

                  {/* Match score */}
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ background: scoreBg, borderRadius: '10px', padding: '6px 10px' }}>
                      <p style={{ fontSize: '16px', fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{donor.matchPercent}%</p>
                      <p style={{ fontSize: '10px', color: 'var(--label-4)', marginTop: '2px' }}>match</p>
                    </div>
                  </div>

                  {/* Action */}
                  {donor.phoneHidden ? (
                    <button onClick={() => navigate('/connections')} style={{
                      padding: '8px 12px', background: 'linear-gradient(180deg,#409CFF,#007AFF)',
                      color: '#fff', border: 'none', borderRadius: '9px', cursor: 'pointer',
                      fontSize: '12px', fontWeight: 600, fontFamily: 'inherit', whiteSpace: 'nowrap',
                      display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      <UserCheck size={12} /> Connect
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
});

export default MatchedDonorsSection;
