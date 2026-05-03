import React, { useState, useEffect } from 'react';
import { Users, Activity, Droplets, AlertCircle, TrendingUp, Shield, Search, Filter, Download, Trash2, Ban, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import Card from '../components/ui/Card';
import BloodTypeBadge from '../components/ui/BloodTypeBadge';
import UrgencyBadge from '../components/ui/UrgencyBadge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

export default function AdminPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast('Access denied. Admin only.', 'error');
      return;
    }
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to fetch stats', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', background: 'rgba(255,59,48,0.08)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Shield size={36} color="var(--red)" strokeWidth={2} />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--label)', marginBottom: '12px' }}>Access Denied</h2>
        <p style={{ color: 'var(--label-3)', fontSize: '15px' }}>This area is restricted to administrators only.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Shield size={28} color="var(--blue)" strokeWidth={2.5} />
          <h1 style={{ fontSize: '30px', fontWeight: 800, color: 'var(--label)', letterSpacing: '-0.035em' }}>Admin Panel</h1>
        </div>
        <p style={{ color: 'var(--label-3)', fontSize: '15px' }}>Monitor and manage the Blood Bank platform</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '3px', background: 'rgba(118,118,128,0.12)', borderRadius: '12px', padding: '3px', marginBottom: '24px', overflowX: 'auto' }}>
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'requests', label: 'Requests', icon: Droplets },
          { id: 'logs', label: 'Activity Logs', icon: FileText }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: '8px 16px', borderRadius: '9px', border: 'none', cursor: 'pointer',
            fontSize: '13px', fontWeight: 600, fontFamily: 'inherit', transition: 'all .18s',
            background: activeTab === tab.id ? '#fff' : 'transparent',
            color: activeTab === tab.id ? 'var(--label)' : 'var(--label-3)',
            boxShadow: activeTab === tab.id ? '0 1px 6px rgba(0,0,0,0.1)' : 'none',
            display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap'
          }}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ width: '72px', height: '72px', background: 'rgba(0,122,255,0.08)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', animation: 'pulse 1.5s ease-in-out infinite' }}>
            <Activity size={32} color="var(--blue)" />
          </div>
          <p style={{ color: 'var(--label-3)', fontSize: '14px' }}>Loading dashboard...</p>
        </div>
      ) : (
        <>
          {activeTab === 'overview' && <OverviewTab stats={stats} />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'requests' && <RequestsTab />}
          {activeTab === 'logs' && <LogsTab />}
        </>
      )}
    </div>
  );
}

function OverviewTab({ stats }) {
  if (!stats) return null;

  const statCards = [
    { label: 'Total Users', value: stats.overview.totalUsers, icon: Users, color: 'var(--blue)', bg: 'rgba(0,122,255,0.08)' },
    { label: 'Active Donors', value: stats.overview.totalDonors, icon: Droplets, color: 'var(--red)', bg: 'rgba(255,59,48,0.08)' },
    { label: 'Recipients', value: stats.overview.totalRecipients, icon: AlertCircle, color: 'var(--orange)', bg: 'rgba(255,149,0,0.08)' },
    { label: 'Blood Requests', value: stats.overview.totalRequests, icon: FileText, color: 'var(--purple)', bg: 'rgba(175,82,222,0.08)' },
    { label: 'Active Requests', value: stats.overview.activeRequests, icon: Activity, color: 'var(--green)', bg: 'rgba(52,199,89,0.08)' },
    { label: 'Total Donations', value: stats.overview.totalDonations, icon: CheckCircle, color: 'var(--teal)', bg: 'rgba(90,200,250,0.08)' },
    { label: 'Connections', value: stats.overview.totalConnections, icon: Users, color: 'var(--indigo)', bg: 'rgba(88,86,214,0.08)' }
  ];

  return (
    <div>
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '28px' }}>
        {statCards.map((stat, i) => (
          <Card key={i} padding="18px">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <stat.icon size={20} color={stat.color} strokeWidth={2.5} />
              </div>
              <div>
                <p style={{ fontSize: '24px', fontWeight: 800, color: 'var(--label)', lineHeight: 1 }}>{stat.value}</p>
                <p style={{ fontSize: '12px', color: 'var(--label-3)', marginTop: '4px' }}>{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px', marginBottom: '28px' }}>
        {/* Blood Type Distribution */}
        <Card padding="20px">
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--label)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Droplets size={18} color="var(--red)" />
            Blood Type Distribution
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {stats.bloodTypeStats.map(item => (
              <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BloodTypeBadge type={item._id} size="sm" />
                <div style={{ flex: 1, height: '8px', background: 'rgba(118,118,128,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--red), #FF6B6B)', width: `${(item.count / stats.overview.totalUsers) * 100}%`, borderRadius: '4px' }} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--label-3)', minWidth: '40px', textAlign: 'right' }}>{item.count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Request Urgency */}
        <Card padding="20px">
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--label)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} color="var(--orange)" />
            Request Urgency
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats.urgencyStats.map(item => (
              <div key={item._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <UrgencyBadge urgency={item._id} />
                <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--label)' }}>{item.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card padding="20px">
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--label)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} color="var(--blue)" />
          Recent Activity
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {stats.recentActivity.map((log, i) => (
            <div key={i} style={{ padding: '12px', background: 'rgba(118,118,128,0.05)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: getActionColor(log.action) }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', color: 'var(--label)', fontWeight: 600 }}>
                  {log.user?.name || 'System'} • {formatAction(log.action)}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--label-4)', marginTop: '2px' }}>
                  {new Date(log.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function UsersTab() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', {
        params: { page, search, role: roleFilter }
      });
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch (err) {
      toast('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchUsers();
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      await api.delete(`/admin/users/${userId}`);
      toast('User deleted successfully', 'success');
      fetchUsers();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to delete user', 'error');
    }
  };

  const pages = Math.ceil(total / 20);

  return (
    <div>
      {/* Search and Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            icon={<Search size={15} />}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          options={[
            { value: '', label: 'All Roles' },
            { value: 'donor', label: 'Donors' },
            { value: 'recipient', label: 'Recipients' },
            { value: 'both', label: 'Both' }
          ]}
        />
        <Button onClick={handleSearch} icon={<Search size={15} />}>Search</Button>
      </div>

      {/* Users Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <p style={{ color: 'var(--label-3)' }}>Loading users...</p>
        </div>
      ) : (
        <>
          <Card padding="0">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--sep)' }}>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--label-3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>User</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--label-3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--label-3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Blood Type</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--label-3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--label-3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Joined</th>
                    <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: 'var(--label-3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id} style={{ borderBottom: '1px solid var(--sep)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--label)' }}>{user.name}</p>
                          {user.city && <p style={{ fontSize: '12px', color: 'var(--label-4)', marginTop: '2px' }}>{user.city}</p>}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <p style={{ fontSize: '13px', color: 'var(--label-3)' }}>{user.phone}</p>
                        {user.email && <p style={{ fontSize: '12px', color: 'var(--label-4)', marginTop: '2px' }}>{user.email}</p>}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <BloodTypeBadge type={user.bloodType} size="sm" />
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--label-3)', textTransform: 'capitalize' }}>{user.role}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--label-3)' }}>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button onClick={() => handleDelete(user._id)} style={{
                          padding: '6px 10px', background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.2)',
                          borderRadius: '8px', cursor: 'pointer', color: 'var(--red)', fontSize: '12px', fontWeight: 600,
                          display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: 'inherit'
                        }}>
                          <Trash2 size={12} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px', alignItems: 'center' }}>
              <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</Button>
              <span style={{ fontSize: '13px', color: 'var(--label-3)', padding: '0 12px' }}>
                {page} / {pages}
              </span>
              <Button variant="ghost" size="sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Next →</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function RequestsTab() {
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchRequests();
  }, [page]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/requests', { params: { page } });
      setRequests(res.data.requests);
      setTotal(res.data.total);
    } catch (err) {
      toast('Failed to fetch requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (requestId) => {
    if (!confirm('Delete this blood request?')) return;
    
    try {
      await api.delete(`/admin/requests/${requestId}`);
      toast('Request deleted successfully', 'success');
      fetchRequests();
    } catch (err) {
      toast('Failed to delete request', 'error');
    }
  };

  const pages = Math.ceil(total / 20);

  return (
    <div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <p style={{ color: 'var(--label-3)' }}>Loading requests...</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gap: '12px' }}>
            {requests.map(req => (
              <Card key={req._id} padding="18px">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <BloodTypeBadge type={req.bloodType} size="md" />
                      <UrgencyBadge urgency={req.urgency} />
                      <span style={{ fontSize: '13px', color: 'var(--label-3)' }}>• {req.units} unit{req.units > 1 ? 's' : ''}</span>
                    </div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--label)', marginBottom: '6px' }}>
                      {req.recipient?.name || 'Anonymous'}
                    </p>
                    {req.hospital && <p style={{ fontSize: '13px', color: 'var(--label-3)', marginBottom: '4px' }}>{req.hospital}</p>}
                    {req.city && <p style={{ fontSize: '13px', color: 'var(--label-3)', marginBottom: '4px' }}>{req.city}</p>}
                    <p style={{ fontSize: '12px', color: 'var(--label-4)', marginTop: '8px' }}>
                      {req.respondedDonors?.length || 0} donor{req.respondedDonors?.length !== 1 ? 's' : ''} responded • {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button onClick={() => handleDelete(req._id)} style={{
                    padding: '8px 12px', background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.2)',
                    borderRadius: '10px', cursor: 'pointer', color: 'var(--red)', fontSize: '13px', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'inherit'
                  }}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </Card>
            ))}
          </div>

          {pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px', alignItems: 'center' }}>
              <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</Button>
              <span style={{ fontSize: '13px', color: 'var(--label-3)', padding: '0 12px' }}>
                {page} / {pages}
              </span>
              <Button variant="ghost" size="sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Next →</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function LogsTab() {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/logs', { params: { page, limit: 50 } });
      setLogs(res.data.logs);
      setTotal(res.data.total);
    } catch (err) {
      toast('Failed to fetch logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const pages = Math.ceil(total / 50);

  return (
    <div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <p style={{ color: 'var(--label-3)' }}>Loading activity logs...</p>
        </div>
      ) : (
        <>
          <Card padding="0">
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {logs.map((log, i) => (
                <div key={i} style={{ padding: '14px 18px', borderBottom: i < logs.length - 1 ? '1px solid var(--sep)' : 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getActionColor(log.action), flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', color: 'var(--label)', fontWeight: 600 }}>
                      {log.user?.name || 'System'} • {formatAction(log.action)}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--label-4)', marginTop: '3px' }}>
                      {new Date(log.timestamp).toLocaleString()} • {log.ipAddress || 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px', alignItems: 'center' }}>
              <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</Button>
              <span style={{ fontSize: '13px', color: 'var(--label-3)', padding: '0 12px' }}>
                {page} / {pages}
              </span>
              <Button variant="ghost" size="sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Next →</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Helper functions
function getActionColor(action) {
  const colors = {
    USER_REGISTER: 'var(--green)',
    USER_LOGIN: 'var(--blue)',
    USER_LOGOUT: 'var(--label-4)',
    USER_DELETE: 'var(--red)',
    REQUEST_CREATE: 'var(--orange)',
    REQUEST_RESPOND: 'var(--purple)',
    DONATION_CREATE: 'var(--teal)',
    CONNECTION_REQUEST: 'var(--indigo)',
    CONNECTION_ACCEPT: 'var(--green)',
    CONNECTION_REJECT: 'var(--red)',
    ADMIN_ACTION: 'var(--red)'
  };
  return colors[action] || 'var(--label-3)';
}

function formatAction(action) {
  return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}
