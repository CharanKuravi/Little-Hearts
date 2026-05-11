const BADGE_THRESHOLDS = {
  'First Drop':   1,
  'Regular Hero': 5,
  'Lifesaver':    10,
  'Legend':       25,
};

const BADGE_TIER_ORDER = ['First Drop', 'Regular Hero', 'Lifesaver', 'Legend'];

/**
 * Check which badges a user has earned and award any new ones.
 * Mutates user.badges in place. Returns array of newly awarded badge names.
 */
function checkAndAwardBadges(user) {
  const newBadges = [];
  const existingNames = new Set((user.badges || []).map(b => b.name));

  for (const [name, threshold] of Object.entries(BADGE_THRESHOLDS)) {
    if ((user.totalDonations || 0) >= threshold && !existingNames.has(name)) {
      user.badges.push({ name, awardedAt: new Date() });
      newBadges.push(name);
    }
  }

  return newBadges;
}

/**
 * Compute karma score: (totalDonations × 10) + (streak × 5), capped at 500.
 */
function computeKarmaScore(totalDonations, streak) {
  return Math.min(500, (totalDonations * 10) + (streak * 5));
}

/**
 * Update donation streak based on the new donation date.
 * Mutates user.donationStreak and user.lastDonationMonth.
 * Returns the new streak value.
 */
function updateStreak(user, donationDate) {
  const newMonth = formatMonth(donationDate);
  const lastMonth = user.lastDonationMonth;

  if (!lastMonth) {
    // First donation ever
    user.donationStreak = 1;
  } else if (newMonth === lastMonth) {
    // Same month — no change to streak
  } else if (isConsecutiveMonth(lastMonth, newMonth)) {
    user.donationStreak = (user.donationStreak || 0) + 1;
  } else {
    // Gap — reset
    user.donationStreak = 1;
  }

  user.lastDonationMonth = newMonth;
  return user.donationStreak;
}

function formatMonth(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function isConsecutiveMonth(prev, next) {
  const [py, pm] = prev.split('-').map(Number);
  const [ny, nm] = next.split('-').map(Number);
  return (ny === py && nm === pm + 1) || (ny === py + 1 && pm === 12 && nm === 1);
}

module.exports = {
  BADGE_THRESHOLDS,
  BADGE_TIER_ORDER,
  checkAndAwardBadges,
  computeKarmaScore,
  updateStreak,
};
