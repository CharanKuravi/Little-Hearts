import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, MapPin, X, Droplets, Clock, ChevronRight, Zap } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import Card from '../components/ui/Card';
import BloodTypeBadge from '../components/ui/BloodTypeBadge';
import UrgencyBadge from '../components/ui/UrgencyBadge';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';

const BLOOD_TYPES = ['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => ({ value: t, label: t }));
const URGENCY_OPTS = [
  { value: 'critical', label: '🚨 Critical — Life threatening' },
  { value: 'urgent',   label: '⚡ Urgent — Needed soon' },
  { value: 'normal',   label: '✓ Normal — Scheduled' },
];

const EMPTY_FORM = { bloodType:'', urgency:'normal', units:1, hospital:'', city:'', description:'' };

export default function RequestsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [bloodType, setBloodType] = useState('');
  const [urgency, setUrgency]     = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [cityInput, setCityInput]   = useState('');
  const [page, setPage] = useState(1);
  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const LIMIT = 12;

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [bloodType, urgency, cityFilter, page]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = { status: 'open', page, limit: LIMIT };
      if (bloodType) params.bloodType = bloodType;
      if (urgency) params.urgency = urgency;
      if (cityFilter) params.city = cityFilter;
      const res = await api.get('/requests', { params });
      setRequests(res.data.requests || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
      setRequests([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const pages = Math.ceil(total / LIMIT);
  const hasFilters = bloodType || urgency || cityFilter;

  const handleSearch = () => { setCityFilter(cityInput); setPage(1); };
  const handleClear  = () => { setBloodType(''); setUrgency(''); setCityFilter(''); setCityInput(''); setPage(1); };

  const setF = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (formErrors[field]) setFormErrors(fe => ({ ...fe, [field]: '' }));
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!form.bloodType) { setFormErrors({ bloodType: 'Required' }); return; }
    
    setPosting(true);
    try {
      await api.post('/requests', form);
      toast('Blood request posted! 🩸', 'success');
      setShowModal(false);
      setForm(EMPTY_FORM);
      fetchRequests(); // Refresh list
    } catch (err) {
      toast(err.response?.data?.message || err.message || 'Failed to post', 'error');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'28px', flexWrap:'wrap', gap:'14px' }}>
        <div>
          <h1 style={{ fontSize:'30px', fontWeight:800, color:'var(--label)', letterSpacing:'-0.035em', marginBottom:'6px' }}>Blood Requests</h1>
          <p style={{ color:'var(--label-3)', fontSize:'15px' }}>{total} open request{total !== 1 ? 's' : ''} need your help</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => user ? setShowModal(true) : navigate('/login')}>
          Post a Request
        </Button>
      </div>

      {/* Filters */}
      <div style={{ background:'#fff', borderRadius:'16px', padding:'16px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', border:'1px solid rgba(0,0,0,0.05)', marginBottom:'20px' }}>
        <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', alignItems:'flex-end' }}>
          <div style={{ flex:1, minWidth:'130px' }}>
            <Select label="Blood Type" value={bloodType} onChange={e => { setBloodType(e.target.value); setPage(1); }} options={BLOOD_TYPES} placeholder="Any type" />
          </div>
          <div style={{ flex:1, minWidth:'130px' }}>
            <Select label="Urgency" value={urgency} onChange={e => { setUrgency(e.target.value); setPage(1); }} options={[{value:'critical',label:'🚨 Critical'},{value:'urgent',label:'⚡ Urgent'},{value:'normal',label:'✓ Normal'}]} placeholder="Any urgency" />
          </div>
          <div style={{ flex:2, minWidth:'160px' }}>
            <Input label="City" value={cityInput} onChange={e => setCityInput(e.target.value)} placeholder="Filter by city..." icon={<MapPin size={15} />} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          </div>
          <div style={{ display:'flex', gap:'8px' }}>
            {hasFilters && <Button variant="ghost" onClick={handleClear} icon={<X size={15} />}>Clear</Button>}
            <Button onClick={handleSearch} icon={<Search size={15} />}>Filter</Button>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'80px 24px' }}>
          <div style={{ width:'72px', height:'72px', background:'rgba(255,59,48,0.08)', borderRadius:'20px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', animation:'pulse 1.5s ease-in-out infinite' }}>
            <Droplets size={32} color="var(--red)" />
          </div>
          <p style={{ color:'var(--label-3)', fontSize:'14px' }}>Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div style={{ textAlign:'center', padding:'80px 24px' }}>
          <div style={{ width:'72px', height:'72px', background:'rgba(255,59,48,0.08)', borderRadius:'20px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
            <Droplets size={32} color="var(--red)" />
          </div>
          <h3 style={{ fontSize:'18px', fontWeight:700, color:'var(--label)', marginBottom:'8px' }}>No requests found</h3>
          <p style={{ color:'var(--label-3)', fontSize:'14px', marginBottom:'20px' }}>
            {hasFilters ? 'Try adjusting your filters.' : 'No open blood requests right now.'}
          </p>
          {hasFilters && <Button variant="secondary" onClick={handleClear}>Clear Filters</Button>}
        </div>
      ) : (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(290px, 1fr))', gap:'14px' }}>
            {requests.map(req => (
              <RequestCard key={req._id} request={req} onMutate={fetchRequests} />
            ))}
          </div>
          {pages > 1 && (
            <div style={{ display:'flex', justifyContent:'center', gap:'8px', marginTop:'28px', alignItems:'center' }}>
              <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</Button>
              <span style={{ fontSize:'13px', color:'var(--label-3)', padding:'0 12px' }}>{page} / {pages}</span>
              <Button variant="ghost" size="sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Next →</Button>
            </div>
          )}
        </>
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
            <Input label="City" value={form.city} onChange={setF('city')} placeholder="Your city" icon={<MapPin size={15} />} />
          </div>
          <Input label="Hospital / Location" value={form.hospital} onChange={setF('hospital')} placeholder="Hospital name" />
          <div>
            <label style={{ fontSize:'13px', fontWeight:600, color:'var(--label-2)', display:'block', marginBottom:'5px' }}>Details</label>
            <textarea value={form.description} onChange={setF('description')} placeholder="Additional info for donors..." rows={3} maxLength={500}
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

function RequestCard({ request, onMutate }) {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const timeAgo = (d) => {
    const m = Math.floor((Date.now() - new Date(d)) / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const alreadyResponded = user && (request.respondedDonors || []).some(r => (r.donor?._id || r.donor) === user._id);

  const handleRespond = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    
    try {
      await api.post(`/requests/${request._id}/respond`);
      toast('You\'ve responded! The recipient will contact you. 🩸', 'success');
      onMutate();
    } catch (err) {
      toast(err.response?.data?.message || err.message || 'Failed to respond', 'error');
    }
  };

  return (
    <Card hover padding="18px">
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'12px' }}>
        <BloodTypeBadge type={request.bloodType} size="lg" />
        <UrgencyBadge urgency={request.urgency} />
      </div>
      <p style={{ fontWeight:700, fontSize:'15px', color:'var(--label)', marginBottom:'5px' }}>
        {request.recipient?.name || 'Anonymous'}
      </p>
      {request.hospital && <p style={{ fontSize:'13px', color:'var(--label-3)', marginBottom:'3px' }}>🏥 {request.hospital}</p>}
      {request.city && <p style={{ fontSize:'13px', color:'var(--label-3)', marginBottom:'3px' }}>📍 {request.city}</p>}
      {request.description && (
        <p style={{ fontSize:'13px', color:'var(--label-3)', lineHeight:1.5, marginTop:'6px', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
          {request.description}
        </p>
      )}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:'10px', marginTop:'10px', borderTop:'1px solid var(--sep)', marginBottom:'12px' }}>
        <div style={{ display:'flex', gap:'10px' }}>
          <span style={{ fontSize:'12px', color:'var(--label-4)' }}>🩸 {request.units} unit{request.units > 1 ? 's' : ''}</span>
          {(request.respondedDonors?.length > 0) && (
            <span style={{ fontSize:'12px', color:'var(--label-4)' }}>👥 {request.respondedDonors.length}</span>
          )}
        </div>
        <span style={{ fontSize:'12px', color:'var(--label-4)', display:'flex', alignItems:'center', gap:'3px' }}>
          <Clock size={11} /> {timeAgo(request.createdAt)}
        </span>
      </div>
      <div style={{ display:'flex', gap:'8px' }}>
        <Link to={`/requests/${request._id}`} style={{ flex:1, textDecoration:'none' }}>
          <button style={{ width:'100%', padding:'9px', background:'rgba(118,118,128,0.1)', border:'none', borderRadius:'10px', fontSize:'13px', fontWeight:600, color:'var(--label-2)', cursor:'pointer', fontFamily:'inherit', transition:'background .15s' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(118,118,128,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(118,118,128,0.1)'}
          >
            Details
          </button>
        </Link>
        <Link to={`/requests/${request._id}?scroll=matches`} style={{ textDecoration:'none' }}>
          <button style={{ padding:'9px 11px', background:'rgba(0,122,255,0.1)', border:'1px solid rgba(0,122,255,0.2)', borderRadius:'10px', fontSize:'12px', fontWeight:600, color:'var(--blue)', cursor:'pointer', fontFamily:'inherit', transition:'all .15s', whiteSpace:'nowrap' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(0,122,255,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(0,122,255,0.1)'}
          >
            Find Donors
          </button>
        </Link>
        {alreadyResponded ? (
          <div style={{ flex:2, padding:'9px', background:'rgba(52,199,89,0.1)', border:'1px solid rgba(52,199,89,0.2)', borderRadius:'10px', fontSize:'13px', fontWeight:600, color:'#1A7F37', textAlign:'center' }}>
            Responded
          </div>
        ) : (
          <button onClick={handleRespond} style={{ flex:2, padding:'9px', background:'linear-gradient(180deg,#FF453A,#FF3B30)', border:'none', borderRadius:'10px', fontSize:'13px', fontWeight:600, color:'#fff', cursor:'pointer', fontFamily:'inherit', transition:'all .18s', boxShadow:'0 2px 8px rgba(255,59,48,0.25)' }}
            onMouseEnter={e => { e.currentTarget.style.filter='brightness(1.06)'; e.currentTarget.style.transform='translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.filter='none'; e.currentTarget.style.transform='translateY(0)'; }}
          >
            I Can Donate
          </button>
        )}
      </div>
    </Card>
  );
}
