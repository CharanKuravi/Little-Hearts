import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Phone, Heart, X, Users, Clock, Lock, UserCheck, Droplet } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import Card from '../components/ui/Card';
import BloodTypeBadge from '../components/ui/BloodTypeBadge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

const BLOOD_TYPES = ['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => ({ value: t, label: t }));
const GRADIENTS = [
  'linear-gradient(145deg,#FF453A,#FF3B30)',
  'linear-gradient(145deg,#409CFF,#007AFF)',
  'linear-gradient(145deg,#30D158,#34C759)',
  'linear-gradient(145deg,#BF5AF2,#AF52DE)',
  'linear-gradient(145deg,#FF9F0A,#FF9500)',
  'linear-gradient(145deg,#64D2FF,#5AC8FA)',
];

export default function DonorsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [bloodType, setBloodType] = useState(searchParams.get('bloodType') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [cityInput, setCityInput] = useState(searchParams.get('city') || '');
  const [page, setPage] = useState(1);
  const [donors, setDonors] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const LIMIT = 12;

  useEffect(() => {
    fetchDonors();
  }, [bloodType, city, page]);

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (bloodType) params.bloodType = bloodType;
      if (city) params.city = city;
      const res = await api.get('/users/donors', { params });
      setDonors(res.data.donors || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Failed to fetch donors:', err);
      setDonors([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCity(cityInput);
    setSearchParams({ ...(bloodType && { bloodType }), ...(cityInput && { city: cityInput }) });
    setPage(1);
  };

  const handleClear = () => {
    setBloodType(''); setCity(''); setCityInput('');
    setSearchParams({}); setPage(1);
  };

  const hasFilters = bloodType || city;
  const pages = Math.ceil(total / LIMIT);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 800, color: 'var(--label)', letterSpacing: '-0.035em', marginBottom: '6px' }}>Find Donors</h1>
        <p style={{ color: 'var(--label-3)', fontSize: '15px' }}>
          {total} available donor{total !== 1 ? 's' : ''} ready to help
        </p>
      </div>

      {/* Search bar */}
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1', minWidth: '140px' }}>
            <Select label="Blood Type" value={bloodType} onChange={e => { setBloodType(e.target.value); setPage(1); }} options={BLOOD_TYPES} placeholder="Any type" />
          </div>
          <div style={{ flex: '2', minWidth: '180px' }}>
            <Input label="City" value={cityInput} onChange={e => setCityInput(e.target.value)} placeholder="Search by city..." icon={<MapPin size={15} />} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {hasFilters && <Button variant="ghost" onClick={handleClear} icon={<X size={15} />}>Clear</Button>}
            <Button onClick={handleSearch} icon={<Search size={15} />}>Search</Button>
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {bloodType && (
            <span style={{ display:'inline-flex', alignItems:'center', gap:'5px', background:'rgba(255,59,48,0.08)', color:'var(--red)', border:'1px solid rgba(255,59,48,0.16)', borderRadius:'var(--r-full)', padding:'3px 11px', fontSize:'13px', fontWeight:600 }}>
              <Droplet size={11} fill="var(--red)" /> {bloodType}
              <button onClick={() => { setBloodType(''); setPage(1); }} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--red)', display:'flex', padding:0 }}><X size={11} /></button>
            </span>
          )}
          {city && (
            <span style={{ display:'inline-flex', alignItems:'center', gap:'5px', background:'rgba(0,122,255,0.08)', color:'var(--blue)', border:'1px solid rgba(0,122,255,0.16)', borderRadius:'var(--r-full)', padding:'3px 11px', fontSize:'13px', fontWeight:600 }}>
              <MapPin size={11} /> {city}
              <button onClick={() => { setCity(''); setCityInput(''); setPage(1); }} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--blue)', display:'flex', padding:0 }}><X size={11} /></button>
            </span>
          )}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ width:'72px', height:'72px', background:'rgba(255,59,48,0.08)', borderRadius:'20px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', animation:'pulse 1.5s ease-in-out infinite' }}>
            <Users size={32} color="var(--red)" />
          </div>
          <p style={{ color:'var(--label-3)', fontSize:'14px' }}>Loading donors...</p>
        </div>
      ) : donors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ width:'72px', height:'72px', background:'rgba(255,59,48,0.08)', borderRadius:'20px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
            <Users size={32} color="var(--red)" />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--label)', marginBottom: '8px' }}>No donors found</h3>
          <p style={{ color: 'var(--label-3)', fontSize: '14px', marginBottom: '20px' }}>
            {hasFilters ? 'Try adjusting your filters.' : 'No donors registered yet.'}
          </p>
          {hasFilters && <Button variant="secondary" onClick={handleClear}>Clear Filters</Button>}
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '14px' }}>
            {donors.map(donor => <DonorCard key={donor._id} donor={donor} />)}
          </div>

          {pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '28px', alignItems: 'center' }}>
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

function DonorCard({ donor }) {
  const { user } = useAuth();
  const toast = useToast();
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (user && donor._id) {
      checkConnectionStatus();
    }
  }, [user, donor._id]);

  const checkConnectionStatus = async () => {
    try {
      const res = await api.get(`/connections/status/${donor._id}`);
      setConnectionStatus(res.data);
    } catch (err) {
      console.error('Failed to check connection:', err);
    }
  };

  const handleConnectionRequest = async () => {
    if (!user) {
      toast('Please login to connect with donors', 'error');
      return;
    }

    setRequesting(true);
    try {
      await api.post(`/connections/request/${donor._id}`);
      toast('Connection request sent', 'success');
      checkConnectionStatus();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to send request', 'error');
    } finally {
      setRequesting(false);
    }
  };

  const initials = donor.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const grad = GRADIENTS[donor.name?.charCodeAt(0) % GRADIENTS.length];
  const isConnected = connectionStatus?.status === 'accepted';
  const isPending = connectionStatus?.status === 'pending';
  const showPhone = !donor.phoneHidden || isConnected;
  const showCity = !donor.cityHidden || isConnected;

  return (
    <Card hover padding="18px">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
        <div style={{ width:'48px', height:'48px', borderRadius:'13px', background:grad, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'17px', fontWeight:700, flexShrink:0 }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'5px', flexWrap:'wrap' }}>
            <span style={{ fontWeight:700, fontSize:'15px', color:'var(--label)' }}>{donor.name}</span>
            {donor.isAvailable && (
              <span style={{ fontSize:'11px', fontWeight:600, background:'rgba(52,199,89,0.1)', color:'#1A7F37', border:'1px solid rgba(52,199,89,0.2)', borderRadius:'var(--r-full)', padding:'1px 8px' }}>● Available</span>
            )}
            {isConnected && (
              <span style={{ fontSize:'11px', fontWeight:600, background:'rgba(0,122,255,0.1)', color:'var(--blue)', border:'1px solid rgba(0,122,255,0.2)', borderRadius:'var(--r-full)', padding:'1px 8px', display:'inline-flex', alignItems:'center', gap:'3px' }}>
                <UserCheck size={10} /> Connected
              </span>
            )}
          </div>
          <BloodTypeBadge type={donor.bloodType} size="sm" />
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginBottom:'14px' }}>
        {showCity && donor.city && (
          <div style={{ display:'flex', alignItems:'center', gap:'7px', fontSize:'13px', color:'var(--label-3)' }}>
            <MapPin size={12} color="var(--label-4)" /> {donor.city}
          </div>
        )}
        {!showCity && (
          <div style={{ display:'flex', alignItems:'center', gap:'7px', fontSize:'13px', color:'var(--label-4)', fontStyle:'italic' }}>
            <MapPin size={12} color="var(--label-4)" /> Location hidden
          </div>
        )}
        {donor.totalDonations > 0 && (
          <div style={{ display:'flex', alignItems:'center', gap:'7px', fontSize:'13px', color:'var(--label-3)' }}>
            <Heart size={12} color="var(--red)" fill="var(--red)" /> {donor.totalDonations} donation{donor.totalDonations !== 1 ? 's' : ''}
          </div>
        )}
        {donor.age && <div style={{ fontSize:'13px', color:'var(--label-3)', display:'flex', alignItems:'center', gap:'7px' }}>
          <Users size={12} color="var(--label-4)" /> {donor.age} years old
        </div>}
      </div>

      {donor.bio && (
        <p style={{ fontSize:'13px', color:'var(--label-3)', lineHeight:1.5, marginBottom:'14px', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
          {donor.bio}
        </p>
      )}

      {showPhone ? (
        <a href={`tel:${donor.phone}`} style={{
          display:'flex', alignItems:'center', justifyContent:'center', gap:'7px',
          padding:'10px', background:'linear-gradient(180deg,#FF453A,#FF3B30)',
          color:'#fff', borderRadius:'11px', textDecoration:'none',
          fontSize:'14px', fontWeight:600, transition:'all .18s',
          boxShadow:'0 3px 10px rgba(255,59,48,0.28)',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.filter='brightness(1.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.filter='none'; }}
        >
          <Phone size={14} /> Contact Donor
        </a>
      ) : (
        <div>
          {isPending ? (
            <div style={{ padding:'10px', background:'rgba(255,149,0,0.1)', border:'1px solid rgba(255,149,0,0.2)', borderRadius:'11px', textAlign:'center', fontSize:'13px', fontWeight:600, color:'var(--orange)', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
              <Clock size={14} /> Request Pending
            </div>
          ) : (
            <button onClick={handleConnectionRequest} disabled={requesting} style={{
              width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'7px',
              padding:'10px', background:'linear-gradient(180deg,#409CFF,#007AFF)',
              color:'#fff', borderRadius:'11px', border:'none', cursor:'pointer',
              fontSize:'14px', fontWeight:600, transition:'all .18s',
              boxShadow:'0 3px 10px rgba(0,122,255,0.28)', fontFamily:'inherit',
              opacity: requesting ? 0.6 : 1
            }}
              onMouseEnter={e => !requesting && (e.currentTarget.style.transform='translateY(-1px)', e.currentTarget.style.filter='brightness(1.06)')}
              onMouseLeave={e => (e.currentTarget.style.transform='translateY(0)', e.currentTarget.style.filter='none')}
            >
              {requesting ? <><Clock size={14} /> Sending...</> : <><UserCheck size={14} /> Request to Connect</>}
            </button>
          )}
          <p style={{ fontSize:'11px', color:'var(--label-4)', textAlign:'center', marginTop:'6px', fontStyle:'italic', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px' }}>
            <Lock size={10} /> Phone hidden until connected
          </p>
        </div>
      )}
    </Card>
  );
}
