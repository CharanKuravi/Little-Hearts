/**
 * LocalStorage-based data store — zero network, instant response.
 * Replaces MongoDB entirely. Data persists across page refreshes.
 */

import { DEMO_DONORS, DEMO_REQUESTS, DEMO_STATS } from '../data/demoData';

// ── Helpers ──────────────────────────────────────────────────────────────────

const get = (key) => {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
};
const set = (key, val) => localStorage.setItem(key, JSON.stringify(val));

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

// ── Seed on first run ─────────────────────────────────────────────────────────

export function seedIfEmpty() {
  if (get('ll_seeded')) return;

  // Seed donors as users (no passwords stored — demo only)
  const users = DEMO_DONORS.map(d => ({
    ...d,
    _id: d._id,
    password: 'demo123',
    createdAt: new Date(Date.now() - Math.random() * 1e10).toISOString(),
    updatedAt: new Date().toISOString(),
  }));
  set('ll_users', users);

  // Seed requests
  const requests = DEMO_REQUESTS.map(r => ({
    ...r,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
    expiresAt: r.expiresAt instanceof Date ? r.expiresAt.toISOString() : r.expiresAt,
  }));
  set('ll_requests', requests);

  // Seed donations (empty to start)
  set('ll_donations', []);

  set('ll_seeded', true);
}

// ── Users ─────────────────────────────────────────────────────────────────────

export const Users = {
  all: () => get('ll_users') || [],

  find: (id) => (get('ll_users') || []).find(u => u._id === id) || null,

  findByPhone: (phone) => (get('ll_users') || []).find(u => u.phone === phone) || null,

  create: (data) => {
    const users = get('ll_users') || [];
    if (users.find(u => u.phone === data.phone)) {
      throw new Error('Phone number already registered');
    }
    const user = {
      _id: uid(),
      name: data.name,
      phone: data.phone,
      password: data.password,
      email: data.email || '',
      bloodType: data.bloodType,
      role: data.role || 'donor',
      city: data.city || '',
      age: data.age || null,
      bio: data.bio || '',
      isAvailable: true,
      totalDonations: 0,
      lastDonated: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(user);
    set('ll_users', users);
    return user;
  },

  update: (id, data) => {
    const users = get('ll_users') || [];
    const idx = users.findIndex(u => u._id === id);
    if (idx === -1) throw new Error('User not found');
    users[idx] = { ...users[idx], ...data, updatedAt: new Date().toISOString() };
    set('ll_users', users);
    return users[idx];
  },

  donors: ({ bloodType, city, page = 1, limit = 12 } = {}) => {
    let list = (get('ll_users') || []).filter(u =>
      (u.role === 'donor' || u.role === 'both') && u.isAvailable
    );
    if (bloodType) list = list.filter(u => u.bloodType === bloodType);
    if (city) list = list.filter(u => u.city?.toLowerCase().includes(city.toLowerCase()));
    list.sort((a, b) => (b.totalDonations || 0) - (a.totalDonations || 0));
    const total = list.length;
    const start = (page - 1) * limit;
    return { donors: list.slice(start, start + limit), total };
  },

  stats: () => {
    const users = get('ll_users') || [];
    const totalDonors     = users.filter(u => u.role === 'donor' || u.role === 'both').length;
    const totalRecipients = users.filter(u => u.role === 'recipient' || u.role === 'both').length;
    return { totalDonors, totalRecipients, totalUsers: users.length };
  },
};

// ── Requests ──────────────────────────────────────────────────────────────────

export const Requests = {
  all: () => get('ll_requests') || [],

  find: (id) => (get('ll_requests') || []).find(r => r._id === id) || null,

  query: ({ bloodType, urgency, city, status = 'open', page = 1, limit = 12 } = {}) => {
    let list = (get('ll_requests') || []).filter(r => r.status === status);
    if (bloodType) list = list.filter(r => r.bloodType === bloodType);
    if (urgency)   list = list.filter(r => r.urgency === urgency);
    if (city)      list = list.filter(r => r.city?.toLowerCase().includes(city.toLowerCase()));
    // Sort: critical first, then by date
    const urgencyOrder = { critical: 0, urgent: 1, normal: 2 };
    list.sort((a, b) => (urgencyOrder[a.urgency] ?? 2) - (urgencyOrder[b.urgency] ?? 2) || new Date(b.createdAt) - new Date(a.createdAt));
    const total = list.length;
    const start = (page - 1) * limit;
    // Populate recipient
    const users = get('ll_users') || [];
    const populated = list.slice(start, start + limit).map(r => ({
      ...r,
      recipient: users.find(u => u._id === (r.recipient?._id || r.recipient)) || r.recipient,
    }));
    return { requests: populated, total };
  },

  byUser: (userId) => {
    const users = get('ll_users') || [];
    return (get('ll_requests') || [])
      .filter(r => (r.recipient?._id || r.recipient) === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(r => ({
        ...r,
        recipient: users.find(u => u._id === (r.recipient?._id || r.recipient)) || r.recipient,
        respondedDonors: (r.respondedDonors || []).map(rd => ({
          ...rd,
          donor: users.find(u => u._id === (rd.donor?._id || rd.donor)) || rd.donor,
        })),
      }));
  },

  create: (userId, data) => {
    const requests = get('ll_requests') || [];
    const req = {
      _id: uid(),
      recipient: userId,
      bloodType: data.bloodType,
      urgency: data.urgency || 'normal',
      units: data.units || 1,
      hospital: data.hospital || '',
      city: data.city || '',
      description: data.description || '',
      status: 'open',
      respondedDonors: [],
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    requests.push(req);
    set('ll_requests', requests);
    // Return populated
    const users = get('ll_users') || [];
    return { ...req, recipient: users.find(u => u._id === userId) || { _id: userId } };
  },

  respond: (requestId, donorId) => {
    const requests = get('ll_requests') || [];
    const idx = requests.findIndex(r => r._id === requestId);
    if (idx === -1) throw new Error('Request not found');
    const req = requests[idx];
    const already = (req.respondedDonors || []).some(r => (r.donor?._id || r.donor) === donorId);
    if (already) throw new Error('You have already responded to this request');
    req.respondedDonors = [...(req.respondedDonors || []), { donor: donorId, respondedAt: new Date().toISOString(), status: 'pending' }];
    if (req.status === 'open') req.status = 'in-progress';
    requests[idx] = req;
    set('ll_requests', requests);
    // Return populated
    const users = get('ll_users') || [];
    return {
      ...req,
      recipient: users.find(u => u._id === (req.recipient?._id || req.recipient)) || req.recipient,
      respondedDonors: req.respondedDonors.map(rd => ({
        ...rd,
        donor: users.find(u => u._id === (rd.donor?._id || rd.donor)) || rd.donor,
      })),
    };
  },

  updateStatus: (requestId, userId, status) => {
    const requests = get('ll_requests') || [];
    const idx = requests.findIndex(r => r._id === requestId && (r.recipient?._id || r.recipient) === userId);
    if (idx === -1) throw new Error('Request not found');
    requests[idx].status = status;
    set('ll_requests', requests);
    return requests[idx];
  },
};

// ── Donations ─────────────────────────────────────────────────────────────────

export const Donations = {
  all: () => get('ll_donations') || [],

  byDonor: (donorId) => {
    const users = get('ll_users') || [];
    return (get('ll_donations') || [])
      .filter(d => d.donor === donorId)
      .sort((a, b) => new Date(b.donatedAt) - new Date(a.donatedAt))
      .map(d => ({
        ...d,
        recipient: users.find(u => u._id === d.recipient) || null,
      }));
  },

  create: (donorId, data) => {
    const donations = get('ll_donations') || [];
    const donation = {
      _id: uid(),
      donor: donorId,
      recipient: data.recipient || null,
      request: data.request || null,
      bloodType: data.bloodType,
      units: data.units || 1,
      hospital: data.hospital || '',
      notes: data.notes || '',
      donatedAt: new Date().toISOString(),
    };
    donations.push(donation);
    set('ll_donations', donations);
    // Bump donor stats
    const users = get('ll_users') || [];
    const idx = users.findIndex(u => u._id === donorId);
    if (idx !== -1) {
      users[idx].totalDonations = (users[idx].totalDonations || 0) + 1;
      users[idx].lastDonated = new Date().toISOString();
      set('ll_users', users);
    }
    return donation;
  },

  stats: () => {
    const donations = get('ll_donations') || [];
    const totalUnits = donations.reduce((s, d) => s + (d.units || 1), 0);
    return { totalDonations: donations.length, totalUnits };
  },
};

// ── Auth ──────────────────────────────────────────────────────────────────────

export const Auth = {
  currentUser: () => {
    const id = get('ll_current_user');
    if (!id) return null;
    return Users.find(id);
  },

  login: (phone, password) => {
    const user = Users.findByPhone(phone);
    if (!user) throw new Error('Invalid phone or password');
    if (user.password !== password) throw new Error('Invalid phone or password');
    set('ll_current_user', user._id);
    const { password: _, ...safe } = user;
    return safe;
  },

  register: (data) => {
    const user = Users.create(data);
    set('ll_current_user', user._id);
    const { password: _, ...safe } = user;
    return safe;
  },

  logout: () => localStorage.removeItem('ll_current_user'),

  updateProfile: (id, data) => {
    const user = Users.update(id, data);
    const { password: _, ...safe } = user;
    return safe;
  },
};
