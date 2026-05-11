import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Clock, Users, Droplets, CheckCircle } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import Card from '../components/ui/Card';
import BloodTypeBadge from '../components/ui/BloodTypeBadge';
import UrgencyBadge from '../components/ui/UrgencyBadge';
import Button from '../components/ui/Button';
import MatchedDonorsSection from '../components/ui/MatchedDonorsSection';

export default function RequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const toast = useToast();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const matchedSectionRef = useRef(null);

  useEffect(() => {
    fetchRequest();
  }, [id]);

  // Scroll to matched donors section if ?scroll=matches
  useEffect(() => {
    if (!loading && request && searchParams.get('scroll') === 'matches') {
      setTimeout(() => {
        matchedSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [loading, request, searchParams]);

  const fetchRequest = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/requests/${id}`);
      setRequest(res.data);
    } catch (err) {
      console.error('Failed to fetch request:', err);
      setRequest(null);
    } finally {
      setLoading(false);
    }
  };

  const timeAgo = (d) => {
    const m = Math.floor((Date.now() - new Date(d)) / 60000);
    if (m < 60) return `${m} minutes ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hours ago`;
    return `${Math.floor(h / 24)} days ago`;
  };

  const handleRespond = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await api.post(`/requests/${id}/respond`);
      toast('You\'ve responded! The recipient will contact you. 🩸', 'success');
      fetchRequest();
    } catch (err) {
      toast(err.response?.data?.message || err.message || 'Failed to respond', 'error');
    }
  };

  const handleStatus = async (status) => {
    try {
      await api.put(`/requests/${id}`, { status });
      toast(`Request marked as ${status}`, 'success');
      fetchRequest();
    } catch (err) {
      toast(err.response?.data?.message || err.message || 'Failed to update', 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(`/requests/${id}`);
      toast('Request deleted successfully', 'success');
      navigate('/dashboard');
    } catch (err) {
      toast(err.response?.data?.message || err.message || 'Failed to delete', 'error');
    }
  };

  if (loading) return (
    <div style={{ maxWidth:'800px', margin:'0 auto', padding:'80px 24px', textAlign:'center' }}>
      <div style={{ fontSize:'48px', marginBottom:'16px', animation:'pulse 1.5s ease-in-out infinite' }}>🩸</div>
      <p style={{ color:'var(--label-3)' }}>Loading request...</p>
    </div>
  );

  if (!request) return (
    <div style={{ maxWidth:'800px', margin:'0 auto', padding:'80px 24px', textAlign:'center' }}>
      <div style={{ fontSize:'48px', marginBottom:'16px' }}>🔍</div>
      <h2 style={{ fontSize:'22px', fontWeight:700, color:'var(--label)', marginBottom:'8px' }}>Request not found</h2>
      <p style={{ color:'var(--label-3)', marginBottom:'24px' }}>This request may have been fulfilled or removed.</p>
      <Button onClick={() => navigate('/requests')}>← Back to Requests</Button>
    </div>
  );

  const isOwner = user && (request.recipient?._id || request.recipient) === user._id;
  const alreadyResponded = user && (request.respondedDonors || []).some(r => (r.donor?._id || r.donor) === user._id);
  const isActive = request.status === 'open' || request.status === 'in-progress';

  const statusStyle = {
    open:         { bg:'rgba(52,199,89,0.1)',  text:'#1A7F37', border:'rgba(52,199,89,0.2)',  label:'Open' },
    'in-progress':{ bg:'rgba(0,122,255,0.1)',  text:'#0055CC', border:'rgba(0,122,255,0.2)',  label:'In Progress' },
    fulfilled:    { bg:'rgba(175,82,222,0.1)', text:'#6A1B9A', border:'rgba(175,82,222,0.2)', label:'Fulfilled' },
    cancelled:    { bg:'rgba(120,120,128,0.1)',text:'var(--label-3)', border:'rgba(120,120,128,0.2)', label:'Cancelled' },
  };
  const ss = statusStyle[request.status] || statusStyle.open;

  return (
    <div style={{ maxWidth:'800px', margin:'0 auto', padding:'32px 24px' }}>
      <button onClick={() => navigate('/requests')} style={{ display:'flex', alignItems:'center', gap:'7px', background:'none', border:'none', cursor:'pointer', color:'var(--label-3)', fontSize:'14px', fontWeight:600, marginBottom:'22px', padding:0, fontFamily:'inherit', transition:'color .15s' }}
        onMouseEnter={e => e.currentTarget.style.color='var(--label)'}
        onMouseLeave={e => e.currentTarget.style.color='var(--label-3)'}
      >
        <ArrowLeft size={15} /> Back to Requests
      </button>

      <Card padding="28px" style={{ marginBottom:'16px' }}>
        {/* Top */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'22px', flexWrap:'wrap', gap:'10px' }}>
          <div style={{ display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap' }}>
            <BloodTypeBadge type={request.bloodType} size="xl" />
            <UrgencyBadge urgency={request.urgency} />
            <span style={{ fontSize:'12px', fontWeight:600, background:ss.bg, color:ss.text, border:`1px solid ${ss.border}`, borderRadius:'8px', padding:'3px 9px' }}>{ss.label}</span>
          </div>
          <span style={{ fontSize:'13px', color:'var(--label-4)', display:'flex', alignItems:'center', gap:'4px' }}>
            <Clock size={12} /> {timeAgo(request.createdAt)}
          </span>
        </div>

        <h2 style={{ fontSize:'22px', fontWeight:800, color:'var(--label)', letterSpacing:'-0.025em', marginBottom:'4px' }}>
          {request.recipient?.name || 'Anonymous'}
        </h2>
        <p style={{ fontSize:'13px', color:'var(--label-4)', marginBottom:'22px' }}>Recipient</p>

        {/* Info grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:'12px', marginBottom:'22px' }}>
          {[
            { icon:<Droplets size={15} color="var(--red)" />, label:'Units Needed', value:`${request.units} unit${request.units > 1 ? 's' : ''}` },
            { icon:<Users size={15} color="var(--blue)" />, label:'Donors Responded', value:`${request.respondedDonors?.length || 0}` },
            ...(request.hospital ? [{ icon:<span>🏥</span>, label:'Hospital', value:request.hospital }] : []),
            ...(request.city ? [{ icon:<MapPin size={15} color="var(--green)" />, label:'Location', value:request.city }] : []),
          ].map((item, i) => (
            <div key={i} style={{ background:'rgba(118,118,128,0.07)', borderRadius:'12px', padding:'13px', display:'flex', gap:'9px', alignItems:'flex-start' }}>
              <span style={{ marginTop:'1px' }}>{item.icon}</span>
              <div>
                <p style={{ fontSize:'11px', color:'var(--label-4)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:'3px' }}>{item.label}</p>
                <p style={{ fontSize:'14px', fontWeight:600, color:'var(--label)' }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {request.description && (
          <div style={{ background:'rgba(118,118,128,0.07)', borderRadius:'12px', padding:'14px', marginBottom:'22px' }}>
            <p style={{ fontSize:'11px', fontWeight:600, color:'var(--label-4)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:'7px' }}>Details</p>
            <p style={{ fontSize:'14px', color:'var(--label-2)', lineHeight:1.6 }}>{request.description}</p>
          </div>
        )}

        {/* Actions */}
        {isActive ? (
          <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
            {!isOwner && (
              alreadyResponded ? (
                <div style={{ flex:1, padding:'13px', background:'rgba(52,199,89,0.1)', border:'1px solid rgba(52,199,89,0.2)', borderRadius:'12px', textAlign:'center', fontSize:'15px', fontWeight:600, color:'#1A7F37', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                  <CheckCircle size={17} /> You've responded
                </div>
              ) : (
                <Button size="lg" onClick={handleRespond} style={{ flex:1 }} icon={<Droplets size={17} />}>
                  I Can Donate Blood
                </Button>
              )
            )}
            {isOwner && (
              <div style={{ display:'flex', gap:'8px', flex:1, flexWrap:'wrap' }}>
                <Button variant="green" onClick={() => handleStatus('fulfilled')} icon={<CheckCircle size={15} />}>Mark Fulfilled</Button>
                <Button variant="ghost" onClick={() => handleStatus('cancelled')}>Cancel Request</Button>
                <Button variant="ghost" onClick={handleDelete} style={{ color:'var(--red)', borderColor:'rgba(255,59,48,0.2)' }}>🗑️ Delete</Button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding:'14px', background:'rgba(118,118,128,0.07)', borderRadius:'12px', textAlign:'center', fontSize:'15px', fontWeight:600, color:'var(--label-3)' }}>
            This request is {request.status}
          </div>
        )}
      </Card>

      {/* Responded donors */}
      {request.respondedDonors?.length > 0 && (
        <Card padding="22px">
          <h3 style={{ fontSize:'17px', fontWeight:700, color:'var(--label)', marginBottom:'14px', letterSpacing:'-0.02em' }}>
            Donors Who Responded ({request.respondedDonors.length})
          </h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {request.respondedDonors.map((r, i) => {
              const donor = r.donor;
              if (!donor || typeof donor === 'string') return null;
              const canSeePhone = isOwner || user?._id === donor._id;
              return (
                <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px', background:'rgba(118,118,128,0.07)', borderRadius:'12px', flexWrap:'wrap', gap:'10px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <div style={{ width:'38px', height:'38px', borderRadius:'11px', background:'linear-gradient(145deg,#FF453A,#FF3B30)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'13px', fontWeight:700 }}>
                      {donor.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight:600, fontSize:'14px', color:'var(--label)' }}>{donor.name}</p>
                      {donor.city && <p style={{ fontSize:'12px', color:'var(--label-4)' }}>📍 {donor.city}</p>}
                    </div>
                    <BloodTypeBadge type={donor.bloodType} size="sm" />
                  </div>
                  {canSeePhone && (
                    <a href={`tel:${donor.phone}`} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'7px 13px', background:'linear-gradient(180deg,#FF453A,#FF3B30)', color:'#fff', borderRadius:'10px', textDecoration:'none', fontSize:'13px', fontWeight:600 }}>
                      <Phone size={12} /> {donor.phone}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* AI-Matched Donors Section */}
      <MatchedDonorsSection
        ref={matchedSectionRef}
        requestId={id}
        requestStatus={request.status}
        viewerId={user?._id}
      />
    </div>
  );
}
