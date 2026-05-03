import React, { useState, useEffect } from 'react';
import { Users, Check, X, UserPlus, Clock, Phone, Inbox, Send } from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../components/ui/Toast';
import Card from '../components/ui/Card';
import BloodTypeBadge from '../components/ui/BloodTypeBadge';
import Button from '../components/ui/Button';

const GRADIENTS = [
  'linear-gradient(145deg,#FF453A,#FF3B30)',
  'linear-gradient(145deg,#409CFF,#007AFF)',
  'linear-gradient(145deg,#30D158,#34C759)',
  'linear-gradient(145deg,#BF5AF2,#AF52DE)',
  'linear-gradient(145deg,#FF9F0A,#FF9500)',
  'linear-gradient(145deg,#64D2FF,#5AC8FA)',
];

export default function ConnectionRequestsPage() {
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqRes, connRes] = await Promise.all([
        api.get('/connections/requests'),
        api.get('/connections/list')
      ]);
      
      // Separate received vs sent requests
      const allRequests = reqRes.data || [];
      const received = [];
      const sent = [];
      
      allRequests.forEach(req => {
        if (req.isSentByMe) {
          sent.push(req);
        } else {
          received.push(req);
        }
      });
      
      setRequests(received);
      setSentRequests(sent);
      setConnections(connRes.data || []);
    } catch (err) {
      console.error('Failed to fetch connections:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (userId, status) => {
    try {
      await api.put(`/connections/respond/${userId}`, { status });
      toast(status === 'accepted' ? 'Connection accepted' : 'Request rejected', 'success');
      fetchData();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to respond', 'error');
    }
  };

  const handleRemove = async (userId) => {
    if (!confirm('Remove this connection?')) return;
    
    try {
      await api.delete(`/connections/${userId}`);
      toast('Connection removed', 'success');
      fetchData();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to remove', 'error');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: '30px', fontWeight: 800, color: 'var(--label)', letterSpacing: '-0.035em', marginBottom: '8px' }}>
        Connections
      </h1>
      <p style={{ color: 'var(--label-3)', fontSize: '15px', marginBottom: '28px' }}>
        Manage your connection requests and connected donors
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '3px', background: 'rgba(118,118,128,0.12)', borderRadius: '12px', padding: '3px', marginBottom: '24px', width: 'fit-content' }}>
        <button onClick={() => setActiveTab('requests')} style={{
          padding: '7px 16px', borderRadius: '9px', border: 'none', cursor: 'pointer',
          fontSize: '13px', fontWeight: 600, fontFamily: 'inherit', transition: 'all .18s',
          background: activeTab === 'requests' ? '#fff' : 'transparent',
          color: activeTab === 'requests' ? 'var(--label)' : 'var(--label-3)',
          boxShadow: activeTab === 'requests' ? '0 1px 6px rgba(0,0,0,0.1)' : 'none',
        }}>
          Received ({requests.length})
        </button>
        <button onClick={() => setActiveTab('sent')} style={{
          padding: '7px 16px', borderRadius: '9px', border: 'none', cursor: 'pointer',
          fontSize: '13px', fontWeight: 600, fontFamily: 'inherit', transition: 'all .18s',
          background: activeTab === 'sent' ? '#fff' : 'transparent',
          color: activeTab === 'sent' ? 'var(--label)' : 'var(--label-3)',
          boxShadow: activeTab === 'sent' ? '0 1px 6px rgba(0,0,0,0.1)' : 'none',
        }}>
          Sent ({sentRequests.length})
        </button>
        <button onClick={() => setActiveTab('connections')} style={{
          padding: '7px 16px', borderRadius: '9px', border: 'none', cursor: 'pointer',
          fontSize: '13px', fontWeight: 600, fontFamily: 'inherit', transition: 'all .18s',
          background: activeTab === 'connections' ? '#fff' : 'transparent',
          color: activeTab === 'connections' ? 'var(--label)' : 'var(--label-3)',
          boxShadow: activeTab === 'connections' ? '0 1px 6px rgba(0,0,0,0.1)' : 'none',
        }}>
          Connected ({connections.length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ width: '72px', height: '72px', background: 'rgba(0,122,255,0.08)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', animation: 'pulse 1.5s ease-in-out infinite' }}>
            <Users size={32} color="var(--blue)" />
          </div>
          <p style={{ color: 'var(--label-3)', fontSize: '14px' }}>Loading...</p>
        </div>
      ) : activeTab === 'requests' ? (
        requests.length === 0 ? (
          <Card padding="48px" style={{ textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(0,122,255,0.08)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Inbox size={28} color="var(--blue)" strokeWidth={2} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--label)', marginBottom: '8px' }}>No pending requests</h3>
            <p style={{ color: 'var(--label-3)', fontSize: '14px' }}>When donors send you connection requests, they'll appear here</p>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {requests.map(req => <RequestCard key={req._id} request={req} onRespond={handleRespond} />)}
          </div>
        )
      ) : activeTab === 'sent' ? (
        sentRequests.length === 0 ? (
          <Card padding="48px" style={{ textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(0,122,255,0.08)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Send size={28} color="var(--blue)" strokeWidth={2} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--label)', marginBottom: '8px' }}>No sent requests</h3>
            <p style={{ color: 'var(--label-3)', fontSize: '14px' }}>Connection requests you send will appear here</p>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sentRequests.map(req => <SentRequestCard key={req._id} request={req} onCancel={handleRemove} />)}
          </div>
        )
      ) : (
        connections.length === 0 ? (
          <Card padding="48px" style={{ textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(52,199,89,0.08)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Users size={28} color="var(--green)" strokeWidth={2} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--label)', marginBottom: '8px' }}>No connections yet</h3>
            <p style={{ color: 'var(--label-3)', fontSize: '14px' }}>Accept connection requests to see donors' contact information</p>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {connections.map(conn => <ConnectionCard key={conn._id} connection={conn} onRemove={handleRemove} />)}
          </div>
        )
      )}
    </div>
  );
}

function RequestCard({ request, onRespond }) {
  const user = request.user;
  const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const grad = GRADIENTS[user.name?.charCodeAt(0) % GRADIENTS.length];

  return (
    <Card padding="18px">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: 700, flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
            <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--label)' }}>{user.name}</span>
            <BloodTypeBadge type={user.bloodType} size="sm" />
          </div>
          {user.totalDonations > 0 && (
            <p style={{ fontSize: '13px', color: 'var(--label-3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: 'var(--red)' }}>•</span> {user.totalDonations} donation{user.totalDonations !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => onRespond(user._id, 'accepted')} style={{
            padding: '9px 14px', background: 'rgba(52,199,89,0.1)', border: '1.5px solid rgba(52,199,89,0.3)',
            borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
            fontSize: '13px', fontWeight: 600, color: '#1A7F37', fontFamily: 'inherit', transition: 'all .15s'
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(52,199,89,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(52,199,89,0.1)'}
          >
            <Check size={14} /> Accept
          </button>
          <button onClick={() => onRespond(user._id, 'rejected')} style={{
            padding: '9px 14px', background: 'rgba(255,59,48,0.1)', border: '1.5px solid rgba(255,59,48,0.3)',
            borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
            fontSize: '13px', fontWeight: 600, color: 'var(--red)', fontFamily: 'inherit', transition: 'all .15s'
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,59,48,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,59,48,0.1)'}
          >
            <X size={14} /> Reject
          </button>
        </div>
      </div>
    </Card>
  );
}

function SentRequestCard({ request, onCancel }) {
  const user = request.user;
  const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const grad = GRADIENTS[user.name?.charCodeAt(0) % GRADIENTS.length];

  return (
    <Card padding="18px">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: 700, flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
            <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--label)' }}>{user.name}</span>
            <BloodTypeBadge type={user.bloodType} size="sm" />
          </div>
          <p style={{ fontSize: '13px', color: 'var(--label-3)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={12} color="var(--orange)" /> Waiting for response
          </p>
        </div>
        <button onClick={() => onCancel(user._id)} style={{
          padding: '9px 14px', background: 'rgba(118,118,128,0.1)', border: '1.5px solid rgba(118,118,128,0.2)',
          borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
          fontSize: '13px', fontWeight: 600, color: 'var(--label-3)', fontFamily: 'inherit', transition: 'all .15s'
        }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,59,48,0.1)';
            e.currentTarget.style.borderColor = 'rgba(255,59,48,0.3)';
            e.currentTarget.style.color = 'var(--red)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(118,118,128,0.1)';
            e.currentTarget.style.borderColor = 'rgba(118,118,128,0.2)';
            e.currentTarget.style.color = 'var(--label-3)';
          }}
        >
          <X size={14} /> Cancel
        </button>
      </div>
    </Card>
  );
}

function ConnectionCard({ connection, onRemove }) {
  const initials = connection.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const grad = GRADIENTS[connection.name?.charCodeAt(0) % GRADIENTS.length];

  return (
    <Card hover padding="18px">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '13px', background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '17px', fontWeight: 700, flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--label)', display: 'block', marginBottom: '5px' }}>{connection.name}</span>
          <BloodTypeBadge type={connection.bloodType} size="sm" />
        </div>
      </div>

      {connection.city && <p style={{ fontSize: '13px', color: 'var(--label-3)', marginBottom: '4px' }}>{connection.city}</p>}
      {connection.totalDonations > 0 && <p style={{ fontSize: '13px', color: 'var(--label-3)', marginBottom: '12px' }}>{connection.totalDonations} donations</p>}

      <div style={{ display: 'flex', gap: '8px' }}>
        <a href={`tel:${connection.phone}`} style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          padding: '9px', background: 'linear-gradient(180deg,#FF453A,#FF3B30)', color: '#fff',
          borderRadius: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: 600,
          boxShadow: '0 2px 8px rgba(255,59,48,0.25)', transition: 'all .15s'
        }}
          onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.06)'}
          onMouseLeave={e => e.currentTarget.style.filter = 'none'}
        >
          <Phone size={14} /> Call
        </a>
        <button onClick={() => onRemove(connection._id)} style={{
          padding: '9px 12px', background: 'rgba(118,118,128,0.1)', border: 'none',
          borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
          color: 'var(--label-3)', fontFamily: 'inherit', transition: 'all .15s'
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,59,48,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(118,118,128,0.1)'}
        >
          Remove
        </button>
      </div>
    </Card>
  );
}
