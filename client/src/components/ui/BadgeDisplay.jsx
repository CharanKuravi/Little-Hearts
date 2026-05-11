import React from 'react';
import { Droplet, Star, Heart, Crown } from 'lucide-react';

const BADGE_CONFIG = {
  'First Drop':   { icon: Droplet, color: 'var(--red)',    bg: 'rgba(255,59,48,0.1)',    border: 'rgba(255,59,48,0.2)'    },
  'Regular Hero': { icon: Star,    color: 'var(--blue)',   bg: 'rgba(0,122,255,0.1)',    border: 'rgba(0,122,255,0.2)'    },
  'Lifesaver':    { icon: Heart,   color: 'var(--green)',  bg: 'rgba(52,199,89,0.1)',    border: 'rgba(52,199,89,0.2)'    },
  'Legend':       { icon: Crown,   color: 'var(--purple)', bg: 'rgba(175,82,222,0.1)',   border: 'rgba(175,82,222,0.2)'   },
};

export default function BadgeDisplay({ badge, size = 'md' }) {
  const config = BADGE_CONFIG[badge?.name];
  if (!config) return null;

  const Icon = config.icon;
  const isSmall = size === 'sm';

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: isSmall ? '3px' : '5px',
      padding: isSmall ? '2px 7px' : '4px 10px',
      background: config.bg, border: `1px solid ${config.border}`,
      borderRadius: 'var(--r-full)',
      fontSize: isSmall ? '11px' : '12px', fontWeight: 600, color: config.color,
    }}>
      <Icon size={isSmall ? 10 : 12} color={config.color} fill={badge.name === 'Lifesaver' ? config.color : 'none'} />
      {badge.name}
    </span>
  );
}
