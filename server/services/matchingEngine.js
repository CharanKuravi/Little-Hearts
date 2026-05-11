const User = require('../models/User');
const BloodRequest = require('../models/BloodRequest');

// ABO/Rh compatibility: COMPATIBILITY[donorType][recipientType] = true/false
const COMPATIBILITY = {
  'O-':  { 'O-':true,  'O+':true,  'A-':true,  'A+':true,  'B-':true,  'B+':true,  'AB-':true, 'AB+':true  },
  'O+':  { 'O-':false, 'O+':true,  'A-':false, 'A+':true,  'B-':false, 'B+':true,  'AB-':false,'AB+':true  },
  'A-':  { 'O-':false, 'O+':false, 'A-':true,  'A+':true,  'B-':false, 'B+':false, 'AB-':true, 'AB+':true  },
  'A+':  { 'O-':false, 'O+':false, 'A-':false, 'A+':true,  'B-':false, 'B+':false, 'AB-':false,'AB+':true  },
  'B-':  { 'O-':false, 'O+':false, 'A-':false, 'A+':false, 'B-':true,  'B+':true,  'AB-':true, 'AB+':true  },
  'B+':  { 'O-':false, 'O+':false, 'A-':false, 'A+':false, 'B-':false, 'B+':true,  'AB-':false,'AB+':true  },
  'AB-': { 'O-':false, 'O+':false, 'A-':false, 'A+':false, 'B-':false, 'B+':false, 'AB-':true, 'AB+':true  },
  'AB+': { 'O-':false, 'O+':false, 'A-':false, 'A+':false, 'B-':false, 'B+':false, 'AB-':false,'AB+':true  },
};

/**
 * Compute a match score (0–100) for a donor against a blood request.
 * Weights:
 *   Blood type exact match:       40 pts
 *   Blood type compatible (not exact): 20 pts
 *   Same city:                    25 pts
 *   isAvailable = true:           20 pts
 *   Last donated >= 60 days ago:  10 pts
 *   Total donations (capped 5):    5 pts
 */
function computeMatchScore(donor, request) {
  let score = 0;

  // Blood type
  const donorType = donor.bloodType;
  const reqType   = request.bloodType;
  if (donorType === reqType) {
    score += 40;
  } else if (COMPATIBILITY[donorType]?.[reqType]) {
    score += 20;
  } else {
    return 0; // incompatible — exclude entirely
  }

  // City match (case-insensitive)
  if (donor.city && request.city &&
      donor.city.toLowerCase().trim() === request.city.toLowerCase().trim()) {
    score += 25;
  }

  // Availability
  if (donor.isAvailable) score += 20;

  // 60-day donation gap
  if (donor.lastDonated) {
    const daysSince = (Date.now() - new Date(donor.lastDonated)) / (1000 * 60 * 60 * 24);
    if (daysSince >= 60) score += 10;
  } else {
    // Never donated — eligible
    score += 10;
  }

  // Donation count (1 pt each, capped at 5)
  score += Math.min(5, donor.totalDonations || 0);

  return Math.min(100, score);
}

/**
 * Get top-10 matched donors for a blood request.
 * Returns { matches: [...], total: number }
 */
async function getMatchesForRequest(requestId, viewerId) {
  const request = await BloodRequest.findById(requestId);
  if (!request) {
    const err = new Error('Request not found');
    err.statusCode = 404;
    throw err;
  }

  if (request.status === 'fulfilled' || request.status === 'cancelled') {
    return { matches: [], message: 'Matching not available for closed requests' };
  }

  // Get all potential donors (donor or both roles, not the requester)
  const donors = await User.find({
    role: { $in: ['donor', 'both'] },
    _id: { $ne: request.recipient }
  }).select('name bloodType city isAvailable lastDonated totalDonations badges karmaScore connections');

  // Score and filter
  const scored = donors
    .map(donor => {
      const score = computeMatchScore(donor, request);
      if (score === 0) return null;

      // Privacy: check if viewer is connected to this donor
      const isConnected = viewerId && donor.connections?.some(
        c => c.user?.toString() === viewerId.toString() && c.status === 'accepted'
      );

      return {
        _id: donor._id,
        name: donor.name,
        bloodType: donor.bloodType,
        city: isConnected ? donor.city : null,
        cityHidden: !isConnected,
        phoneHidden: !isConnected,
        isAvailable: donor.isAvailable,
        totalDonations: donor.totalDonations,
        badges: donor.badges || [],
        karmaScore: donor.karmaScore || 0,
        matchScore: score,
        matchPercent: score,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10);

  return { matches: scored, total: scored.length };
}

module.exports = { computeMatchScore, getMatchesForRequest, COMPATIBILITY };
