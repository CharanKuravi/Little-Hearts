import React, { useState, useEffect } from 'react';
import { Flame, Trophy, Target } from 'lucide-react';
import api from '../../api/axios';
import Card from './Card';
import BadgeDisplay from './BadgeDisplay';

const BADGE_TIER_ORDER = ['First Drop', 'Regular Hero', 'Lifesaver', 'Legend'];
const BADGE_THRESHOLDS = { 'First Drop': 1, 'Regular Hero': 5, 'Lifesaver': 10, 'Legend': 25 };

export default function AchievementsSection({ userId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) fetchBadges();
  }, [userId]);

  const fetchBadges = async () => {
    try {
      const res = await api.get(`/users/${userId}/badges`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch badges:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (!data) return null;

  const earnedNames = new Set((data.badges || []).map(b => b.name));
  const nextBadge = BADGE_TIER_ORDER.find(name => !earnedNames.has(name));
  const nextThreshold = nextBadge ? BADGE_THRESHOLDS[nextBadge] : null;
  const remaining = nextThreshold ? nextThreshold - (data.totalDonations || 0) : 0;
  const karmaPercent = Math.min(100, ((data.karmaScore || 0) / 500) * 100);

  return (
    <Card padding="22px">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <div style={{ width: '36px', height: '36px', background: 'rgba(255,149,0,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Trophy size={18} color="var(--orange)" strokeWidth={2.5} />
        </div>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--label)', letterSpacing: '-0.02em' }}>
          Achievements
        </h3>
      </div>

      {/* Karma Score */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--label-2)' }}>Karma Score</span>
          <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--orange)' }}>{data.karmaScore || 0}<span style={{ fontSize: '12px', color: 'var(--label-4)', fontWeight: 500 }}>/500</span></span>
        </div>
        <div style={{ height: '8px', background: 'rgba(118,118,128,0.12)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${karmaPercent}%`, background: 'linear-gradient(90deg, #FF9500, #FF6B00)', borderRadius: '4px', transition: 'width 0.6s ease' }} />
        </div>
      </div>

      {/* Streak */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'rgba(255,59,48,0.06)', borderRadius: '12px', marginBottom: '20px' }}>
        <Flame size={20} color="var(--red)" />
        <div>
          <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--label)', lineHeight: 1 }}>{data.donationStreak || 0}</p>
          <p style={{ fontSize: '12px', color: 'var(--label-3)', marginTop: '2px' }}>month streak</p>
        </div>
        {(data.donationStreak || 0) >= 3 && (
          <span style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: 600, color: 'var(--red)', background: 'rgba(255,59,48,0.1)', padding: '3px 9px', borderRadius: '8px' }}>On fire!</span>
        )}
      </div>

      {/* Badges */}
      {data.badges?.length > 0 ? (
        <div>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--label-4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Earned Badges</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {data.badges.map((badge, i) => (
              <BadgeDisplay key={i} badge={badge} size="md" />
            ))}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '16px 0', marginBottom: '12px' }}>
          <p style={{ color: 'var(--label-3)', fontSize: '14px' }}>No badges yet — make your first donation!</p>
        </div>
      )}

      {/* Next milestone */}
      {nextBadge && (
        <div style={{ padding: '12px', background: 'rgba(0,122,255,0.06)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Target size={16} color="var(--blue)" />
          <p style={{ fontSize: '13px', color: 'var(--label-2)' }}>
            <strong>{remaining} more donation{remaining !== 1 ? 's' : ''}</strong> to earn <strong>{nextBadge}</strong>
          </p>
        </div>
      )}
    </Card>
  );
}
