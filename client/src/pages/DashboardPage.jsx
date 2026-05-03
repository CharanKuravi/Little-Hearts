import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Droplets, CheckCircle, Plus, ArrowRight, Users, Activity } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import Card from '../components/ui/Card';
import BloodTypeBadge from '../components/ui/BloodTypeBadge';
import UrgencyBadge from '../components/ui/UrgencyBadge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';

const BLOOD_TYPES = ['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => ({ value: t, label: t }));
const URGENCY_OPTS = [
  { value:'critical', label:'🚨 Critical' },
  { value:'urgent',   label:'⚡ Urgent' },
  { value:'normal',   label:'✓ Normal' },
];
const EMPTY_FORM = { bloodType:'', urgency:'normal', units:1, hospital:'', city:'', description:'' };

export default function DashboardPage() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [posting, setPosting] = useState(false);
  
  const [myRequests, setMyRequests] = useState([]);
  const [myDonations, setMyDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqRes, donRes] = await Promise.all([
        api.get('/requests/my'),
        api.get('/donations/my'),
      ]);
      setMyRequests(reqRes.data || []);
      setMyDonations(donRes.data || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const openRequests   = myRequests.filter(r => r.status === 'open' || r.status === 'in-progress');
  const closedRequests = myRequests.filter(r => r.status === 'fulfilled' || r.status === 'cancelled');
  const totalResponses = myRequests.reduce((a, r) => a + (r.respondedDonors?.length || 0), 0);

  const setF = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (formErrors[field]) setFormErrors(fe => ({ ...fe, [field]: '' }));
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!form.bloodType) { setFormErrors({ bloodType: 'Required' }); return; }
    
    setPosting(true);
    try {
      await api.post('/requests', form);
      toast('Blood request posted! 🩸', 'success');
      setShowModal(false);
      setForm(EMPTY_FORM);
      fetchData(); // Refresh data
    } catch (err) {
      toast(err.response?.data?.message || err.message || 'Failed to post', 'error');
    } finally {
      setPosting(false);
    }
  };

  const handleStatusUpdate = async (reqId, status) => {
    try {
      await api.put(`/requests/${reqId}`, { status });
      toast(`Request ${status}`, 'success');
      fetchData(); // Refresh data
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to update', 'error');
    }
  };

  const handleDeleteRequest = async (reqId) => {
    if (!confirm('Are you sure you want to delete this request? This cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(`/requests/${reqId}`);
      toast('Request deleted successfully', 'success');
      fetchData(); // Refresh data
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to delete', 'error');
    }
  };

  const tabs = [
    { id:'overview',  label:'Overview' },
    { id:'requests',  label:`My Requests (${myRequests.length})` },
    { id:'donations', label:`Donations (${myDonations.length})` },
  ];

  return (
    <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'32px 24px' }}>
      {/* Welcome banner */}
      <div style={{
        background:'linear-gradient(145deg, #FF453A 0%, #FF6B6B 100%)',
        borderRadius:'20px', padding:'26px 28px', marginBottom:'24px',
        display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'14px',
        boxShadow:'0 8px 32px rgba(255,59,48,0.28)',
      }}>
        <div>
          <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'13px', marginBottom:'3px' }}>Welcome back,</p>
          <h1 style={{ fontSize:'26px', fontWeight:800, color:'#fff', letterSpacing:'-0.035em', marginBottom:'10px' }}>
            {user?.name} 👋
          </h1>
          <div style={{ display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap' }}>
            <BloodTypeBadge type={user?.bloodType} size="md" />
            <span style={{ fontSize:'12px', fontWeight:600, background:'rgba(255,255,255,0.18)', color:'#fff', borderRadius:'var(--r-full)', padding:'3px 11px' }}>
              {user?.role === 'both' ? '🩸 Donor & Recipient' : user?.role === 'donor' ? '🩸 Donor' : '🏥 Recipient'}
            </span>
            {user?.city && <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.65)' }}>📍 {user.city}</span>}
          </div>
        </div>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          <Button variant="ghost" style={{ background:'rgba(255,255,255,0.15)', color:'#fff', border:'1.5px solid rgba(255,255,255,0.28)' }} onClick={() => navigate('/profile')}>
            Edit Profile
          </Button>
          <Button style={{ background:'#fff', color:'var(--red)', boxShadow:'none' }} icon={<Plus size={15} />} onClick={() => setShowModal(true)}>
            Post Request
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:'12px', marginBottom:'24px' }}>
        {[
          { icon:<Heart size={20} color="var(--red)" fill="var(--red)" />, bg:'rgba(255,59,48,0.08)',  value:user?.totalDonations || 0, label:'Total Donations' },
          { icon:<Activity size={20} color="var(--blue)" />,              bg:'rgba(0,122,255,0.08)',   value:openRequests.length,       label:'Active Requests' },
          { icon:<CheckCircle size={20} color="var(--green)" />,          bg:'rgba(52,199,89,0.08)',   value:closedRequests.length,     label:'Fulfilled' },
          { icon:<Users size={20} color="var(--purple)" />,               bg:'rgba(175,82,222,0.08)', value:totalResponses,            label:'Donor Responses' },
        ].map((s, i) => (
          <Card key={i} padding="18px">
            <div style={{ display:'flex', alignItems:'center', gap:'11px' }}>
              <div style={{ width:'40px', height:'40px', background:s.bg, borderRadius:'11px', display:'flex', alignItems:'center', justifyContent:'center' }}>{s.icon}</div>
              <div>
                <p style={{ fontSize:'22px', fontWeight:800, color:'var(--label)', letterSpacing:'-0.035em' }}>{s.value}</p>
                <p style={{ fontSize:'11px', color:'var(--label-4)', fontWeight:500 }}>{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'3px', background:'rgba(118,118,128,0.12)', borderRadius:'12px', padding:'3px', marginBottom:'20px', width:'fit-content' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding:'7px 16px', borderRadius:'9px', border:'none', cursor:'pointer',
            fontSize:'13px', fontWeight:600, fontFamily:'inherit', transition:'all .18s',
            background: activeTab === tab.id ? '#fff' : 'transparent',
            color: activeTab === tab.id ? 'var(--label)' : 'var(--label-3)',
            boxShadow: activeTab === tab.id ? '0 1px 6px rgba(0,0,0,0.1)' : 'none',
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        loading ? (
          <div style={{ textAlign:'center', padding:'80px 24px' }}>
            <div style={{ fontSize:'48px', marginBottom:'16px', animation:'pulse 1.5s ease-in-out infinite' }}>🩸</div>
            <p style={{ color:'var(--label-3)' }}>Loading dashboard...</p>
          </div>
        ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'16px' }}>
          <Card padding="22px">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
              <h3 style={{ fontSize:'15px', fontWeight:700, color:'var(--label)' }}>Active Requests</h3>
              <button onClick={() => setActiveTab('requests')} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--red)', fontSize:'13px', fontWeight:600, fontFamily:'inherit' }}>View all →</button>
            </div>
            {openRequests.length === 0 ? (
              <div style={{ textAlign:'center', padding:'20px 0' }}>
                <p style={{ color:'var(--label-4)', fontSize:'13px', marginBottom:'10px' }}>No active requests</p>
                <Button size="sm" onClick={() => setShowModal(true)} icon={<Plus size={13} />}>Post Request</Button>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {openRequests.slice(0, 3).map(req => (
                  <div key={req._id} style={{ display:'flex', alignItems:'center', gap:'9px', padding:'11px', background:'rgba(118,118,128,0.07)', borderRadius:'10px' }}>
                    <BloodTypeBadge type={req.bloodType} size="sm" />
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:'13px', fontWeight:600, color:'var(--label)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{req.hospital || req.city || 'No location'}</p>
                      <p style={{ fontSize:'11px', color:'var(--label-4)' }}>{req.respondedDonors?.length || 0} responded</p>
                    </div>
                    <UrgencyBadge urgency={req.urgency} />
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card padding="22px">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
              <h3 style={{ fontSize:'15px', fontWeight:700, color:'var(--label)' }}>Recent Donations</h3>
              <button onClick={() => setActiveTab('donations')} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--red)', fontSize:'13px', fontWeight:600, fontFamily:'inherit' }}>View all →</button>
            </div>
            {myDonations.length === 0 ? (
              <div style={{ textAlign:'center', padding:'20px 0' }}>
                <p style={{ color:'var(--label-4)', fontSize:'13px', marginBottom:'10px' }}>No donations yet</p>
                <Link to="/requests" style={{ textDecoration:'none' }}><Button size="sm" variant="secondary">Find Requests</Button></Link>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {myDonations.slice(0, 3).map(don => (
                  <div key={don._id} style={{ display:'flex', alignItems:'center', gap:'9px', padding:'11px', background:'rgba(118,118,128,0.07)', borderRadius:'10px' }}>
                    <div style={{ width:'34px', height:'34px', background:'rgba(255,59,48,0.08)', borderRadius:'9px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Heart size={15} color="var(--red)" fill="var(--red)" />
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:'13px', fontWeight:600, color:'var(--label)' }}>{don.recipient?.name || 'Anonymous'}</p>
                      <p style={{ fontSize:'11px', color:'var(--label-4)' }}>{new Date(don.donatedAt).toLocaleDateString()}</p>
                    </div>
                    <BloodTypeBadge type={don.bloodType} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card padding="22px">
            <h3 style={{ fontSize:'15px', fontWeight:700, color:'var(--label)', marginBottom:'14px' }}>Quick Actions</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {[
                { icon:'🩸', label:'Post Blood Request', desc:'Need blood? Post a request', action:() => setShowModal(true), bg:'rgba(255,59,48,0.07)' },
                { icon:'🔍', label:'Find Donors', desc:'Search available donors', action:() => navigate('/donors'), bg:'rgba(0,122,255,0.07)' },
                { icon:'📋', label:'Browse Requests', desc:'Help someone in need', action:() => navigate('/requests'), bg:'rgba(52,199,89,0.07)' },
                { icon:'👤', label:'Edit Profile', desc:'Update your information', action:() => navigate('/profile'), bg:'rgba(175,82,222,0.07)' },
              ].map((item, i) => (
                <button key={i} onClick={item.action} style={{ display:'flex', alignItems:'center', gap:'11px', padding:'11px', borderRadius:'11px', background:item.bg, border:'none', cursor:'pointer', textAlign:'left', width:'100%', fontFamily:'inherit', transition:'all .18s' }}
                  onMouseEnter={e => e.currentTarget.style.transform='translateX(3px)'}
                  onMouseLeave={e => e.currentTarget.style.transform='translateX(0)'}
                >
                  <span style={{ fontSize:'18px' }}>{item.icon}</span>
                  <div>
                    <p style={{ fontSize:'13px', fontWeight:600, color:'var(--label)' }}>{item.label}</p>
                    <p style={{ fontSize:'11px', color:'var(--label-4)' }}>{item.desc}</p>
                  </div>
                  <ArrowRight size={13} color="var(--label-4)" style={{ marginLeft:'auto' }} />
                </button>
              ))}
            </div>
          </Card>
        </div>
        )
      )}

      {/* My Requests */}
      {activeTab === 'requests' && (
        loading ? (
          <div style={{ textAlign:'center', padding:'80px 24px' }}>
            <div style={{ fontSize:'48px', marginBottom:'16px', animation:'pulse 1.5s ease-in-out infinite' }}>📋</div>
            <p style={{ color:'var(--label-3)' }}>Loading requests...</p>
          </div>
        ) : (
        <div>
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'14px' }}>
            <Button icon={<Plus size={15} />} onClick={() => setShowModal(true)}>New Request</Button>
          </div>
          {myRequests.length === 0 ? (
            <Card padding="48px" style={{ textAlign:'center' }}>
              <div style={{ fontSize:'40px', marginBottom:'10px' }}>📋</div>
              <h3 style={{ fontSize:'17px', fontWeight:700, color:'var(--label)', marginBottom:'7px' }}>No requests yet</h3>
              <p style={{ color:'var(--label-3)', marginBottom:'18px', fontSize:'14px' }}>Post your first blood request to find donors.</p>
              <Button onClick={() => setShowModal(true)} icon={<Plus size={15} />}>Post Request</Button>
            </Card>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'14px' }}>
              {myRequests.map(req => <FullRequestCard key={req._id} request={req} onUpdate={handleStatusUpdate} onDelete={handleDeleteRequest} />)}
            </div>
          )}
        </div>
        )
      )}

      {/* Donations */}
      {activeTab === 'donations' && (
        loading ? (
          <div style={{ textAlign:'center', padding:'80px 24px' }}>
            <div style={{ fontSize:'48px', marginBottom:'16px', animation:'pulse 1.5s ease-in-out infinite' }}>🩸</div>
            <p style={{ color:'var(--label-3)' }}>Loading donations...</p>
          </div>
        ) : (
        <div>
          {myDonations.length === 0 ? (
            <Card padding="48px" style={{ textAlign:'center' }}>
              <div style={{ fontSize:'40px', marginBottom:'10px' }}>🩸</div>
              <h3 style={{ fontSize:'17px', fontWeight:700, color:'var(--label)', marginBottom:'7px' }}>No donations recorded</h3>
              <p style={{ color:'var(--label-3)', marginBottom:'18px', fontSize:'14px' }}>When you donate blood, it will appear here.</p>
              <Link to="/requests" style={{ textDecoration:'none' }}><Button variant="secondary">Find Requests to Help</Button></Link>
            </Card>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {myDonations.map(don => (
                <Card key={don._id} padding="18px">
                  <div style={{ display:'flex', alignItems:'center', gap:'14px', flexWrap:'wrap' }}>
                    <div style={{ width:'42px', height:'42px', borderRadius:'12px', background:'rgba(255,59,48,0.08)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Heart size={19} color="var(--red)" fill="var(--red)" />
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontWeight:700, fontSize:'15px', color:'var(--label)' }}>Donated to {don.recipient?.name || 'Anonymous'}</p>
                      <p style={{ fontSize:'13px', color:'var(--label-4)' }}>{don.hospital || 'Location not specified'} · {new Date(don.donatedAt).toLocaleDateString()}</p>
                    </div>
                    <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                      <BloodTypeBadge type={don.bloodType} size="sm" />
                      <span style={{ fontSize:'13px', color:'var(--label-3)', fontWeight:600 }}>{don.units} unit{don.units > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
        )
      )}

      {/* Post Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Post a Blood Request">
        <form onSubmit={handlePost} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            <Select label="Blood Type" value={form.bloodType} onChange={setF('bloodType')} options={BLOOD_TYPES} placeholder="Select type" error={formErrors.bloodType} required />
            <Select label="Urgency" value={form.urgency} onChange={setF('urgency')} options={URGENCY_OPTS} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            <Input label="Units Needed" type="number" value={form.units} onChange={setF('units')} min={1} max={10} required />
            <Input label="City" value={form.city} onChange={setF('city')} placeholder="Your city" />
          </div>
          <Input label="Hospital / Location" value={form.hospital} onChange={setF('hospital')} placeholder="Hospital name" />
          <div>
            <label style={{ fontSize:'13px', fontWeight:600, color:'var(--label-2)', display:'block', marginBottom:'5px' }}>Details</label>
            <textarea value={form.description} onChange={setF('description')} placeholder="Additional info..." rows={3}
              style={{ width:'100%', padding:'11px 13px', fontSize:'15px', fontFamily:'inherit', background:'rgba(118,118,128,0.08)', border:'1.5px solid transparent', borderRadius:'11px', outline:'none', resize:'vertical', color:'var(--label)', lineHeight:1.5, transition:'all .18s' }}
              onFocus={e => { e.target.style.background='#fff'; e.target.style.borderColor='var(--blue)'; e.target.style.boxShadow='0 0 0 3.5px rgba(0,122,255,0.18)'; }}
              onBlur={e => { e.target.style.background='rgba(118,118,128,0.08)'; e.target.style.borderColor='transparent'; e.target.style.boxShadow='none'; }}
            />
          </div>
          <div style={{ display:'flex', gap:'10px' }}>
            <Button variant="ghost" onClick={() => setShowModal(false)} style={{ flex:1 }} disabled={posting}>Cancel</Button>
            <Button type="submit" style={{ flex:2 }} disabled={posting}>
              {posting ? 'Posting...' : 'Post Request'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function FullRequestCard({ request, onUpdate, onDelete }) {
  const ss = {
    open:          { bg:'rgba(52,199,89,0.1)',  text:'#1A7F37', border:'rgba(52,199,89,0.2)'  },
    'in-progress': { bg:'rgba(0,122,255,0.1)',  text:'#0055CC', border:'rgba(0,122,255,0.2)'  },
    fulfilled:     { bg:'rgba(175,82,222,0.1)', text:'#6A1B9A', border:'rgba(175,82,222,0.2)' },
    cancelled:     { bg:'rgba(120,120,128,0.1)',text:'var(--label-3)', border:'rgba(120,120,128,0.2)' },
  }[request.status] || {};
  const isActive = request.status === 'open' || request.status === 'in-progress';

  return (
    <Card padding="18px">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
        <div style={{ display:'flex', gap:'7px', alignItems:'center' }}>
          <BloodTypeBadge type={request.bloodType} size="md" />
          <UrgencyBadge urgency={request.urgency} />
        </div>
        <span style={{ fontSize:'11px', fontWeight:600, background:ss.bg, color:ss.text, border:`1px solid ${ss.border}`, borderRadius:'7px', padding:'2px 8px' }}>{request.status}</span>
      </div>
      {request.hospital && <p style={{ fontSize:'13px', color:'var(--label-3)', marginBottom:'3px' }}>🏥 {request.hospital}</p>}
      {request.city && <p style={{ fontSize:'13px', color:'var(--label-3)', marginBottom:'7px' }}>📍 {request.city}</p>}
      <div style={{ display:'flex', gap:'10px', fontSize:'12px', color:'var(--label-4)', marginBottom:'12px' }}>
        <span>🩸 {request.units} unit{request.units > 1 ? 's' : ''}</span>
        <span>👥 {request.respondedDonors?.length || 0} responded</span>
      </div>
      {isActive ? (
        <div style={{ display:'flex', gap:'7px', flexWrap:'wrap' }}>
          <Link to={`/requests/${request._id}`} style={{ flex:1, textDecoration:'none', minWidth:'60px' }}>
            <button style={{ width:'100%', padding:'8px', background:'rgba(118,118,128,0.1)', border:'none', borderRadius:'9px', fontSize:'13px', fontWeight:600, color:'var(--label-2)', cursor:'pointer', fontFamily:'inherit' }}>View</button>
          </Link>
          <button onClick={() => onUpdate(request._id, 'fulfilled')} style={{ flex:1, padding:'8px', background:'rgba(52,199,89,0.1)', border:'1px solid rgba(52,199,89,0.2)', borderRadius:'9px', fontSize:'13px', fontWeight:600, color:'#1A7F37', cursor:'pointer', fontFamily:'inherit', minWidth:'60px' }}>✓ Done</button>
          <button onClick={() => onUpdate(request._id, 'cancelled')} style={{ padding:'8px 11px', background:'rgba(255,149,0,0.1)', border:'1px solid rgba(255,149,0,0.2)', borderRadius:'9px', fontSize:'13px', fontWeight:600, color:'var(--orange)', cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
          <button onClick={() => onDelete(request._id)} style={{ padding:'8px 11px', background:'rgba(255,59,48,0.1)', border:'1px solid rgba(255,59,48,0.2)', borderRadius:'9px', fontSize:'13px', fontWeight:600, color:'var(--red)', cursor:'pointer', fontFamily:'inherit' }} title="Delete request">🗑️</button>
        </div>
      ) : (
        <div style={{ display:'flex', gap:'7px' }}>
          <Link to={`/requests/${request._id}`} style={{ flex:1, textDecoration:'none' }}>
            <button style={{ width:'100%', padding:'8px', background:'rgba(118,118,128,0.1)', border:'none', borderRadius:'9px', fontSize:'13px', fontWeight:600, color:'var(--label-2)', cursor:'pointer', fontFamily:'inherit' }}>View</button>
          </Link>
          <button onClick={() => onDelete(request._id)} style={{ padding:'8px 11px', background:'rgba(255,59,48,0.1)', border:'1px solid rgba(255,59,48,0.2)', borderRadius:'9px', fontSize:'13px', fontWeight:600, color:'var(--red)', cursor:'pointer', fontFamily:'inherit' }} title="Delete request">🗑️</button>
        </div>
      )}
    </Card>
  );
}
