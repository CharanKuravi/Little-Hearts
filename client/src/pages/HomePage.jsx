import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Users, Droplets, ArrowRight, Search, Shield, Zap, Clock, Star, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import Button from '../components/ui/Button';
import BloodTypeBadge from '../components/ui/BloodTypeBadge';
import UrgencyBadge from '../components/ui/UrgencyBadge';
import Card from '../components/ui/Card';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function HomePage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalDonors: 0, totalRecipients: 0, totalUsers: 0 });
  const [donationStats, setDonationStats] = useState({ totalDonations: 0, totalUnits: 0 });
  const [recentRequests, setRecentRequests] = useState([]);
  const [selectedBlood, setSelectedBlood] = useState('');

  useEffect(() => {
    api.get('/users/stats').then(r => setStats(r.data.stats)).catch(() => {});
    api.get('/donations/stats').then(r => setDonationStats(r.data)).catch(() => {});
    api.get('/requests?limit=3&status=open').then(r => setRecentRequests(r.data.requests || [])).catch(() => {});
  }, []);

  return (
    <div>
      {/* ── Hero ── */}
      <section style={{
        background: 'linear-gradient(160deg, #fff 0%, #FFF0EF 55%, #fff5f5 100%)',
        padding: '72px 24px 64px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', top:'-120px', right:'-80px', width:'500px', height:'500px', background:'radial-gradient(circle, rgba(255,59,48,0.07) 0%, transparent 65%)', borderRadius:'50%', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-80px', left:'-60px', width:'360px', height:'360px', background:'radial-gradient(circle, rgba(255,59,48,0.04) 0%, transparent 65%)', borderRadius:'50%', pointerEvents:'none' }} />

        <div style={{ maxWidth:'1200px', margin:'0 auto', position:'relative' }}>
          <div style={{ maxWidth:'660px' }}>
            <div style={{
              display:'inline-flex', alignItems:'center', gap:'7px',
              background:'rgba(255,59,48,0.08)', border:'1px solid rgba(255,59,48,0.16)',
              borderRadius:'var(--r-full)', padding:'5px 14px', marginBottom:'22px',
            }}>
              <span style={{ width:'7px', height:'7px', background:'var(--red)', borderRadius:'50%', animation:'pulse 1.6s ease infinite' }} />
              <span style={{ fontSize:'13px', fontWeight:600, color:'var(--red)', letterSpacing:'-0.01em' }}>
                Free · No Middlemen · Community Driven
              </span>
            </div>

            <h1 style={{
              fontSize:'clamp(38px, 5.5vw, 64px)',
              fontWeight:900, color:'var(--label)',
              letterSpacing:'-0.045em', lineHeight:1.08,
              marginBottom:'18px',
            }}>
              Blood shouldn't<br />
              have a{' '}
              <span style={{
                background:'linear-gradient(135deg, #FF3B30 0%, #FF6B6B 100%)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              }}>price tag.</span>
            </h1>

            <p style={{
              fontSize:'18px', color:'var(--label-3)',
              lineHeight:1.65, marginBottom:'36px', maxWidth:'500px',
              letterSpacing:'-0.01em',
            }}>
              Little Hearts connects donors directly with recipients — no cash, no exploitation, just humanity helping humanity.
            </p>

            <div style={{
              display:'flex', gap:'10px', flexWrap:'wrap',
              background:'rgba(255,255,255,0.9)',
              backdropFilter:'blur(20px)',
              WebkitBackdropFilter:'blur(20px)',
              padding:'12px 14px',
              borderRadius:'16px',
              boxShadow:'0 4px 24px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.05)',
              marginBottom:'28px', maxWidth:'480px',
            }}>
              <div style={{ flex:1, minWidth:'140px' }}>
                <p style={{ fontSize:'11px', fontWeight:600, color:'var(--label-4)', textTransform:'uppercase', letterSpacing:'.055em', marginBottom:'5px' }}>
                  Blood Type Needed
                </p>
                <select
                  value={selectedBlood}
                  onChange={e => setSelectedBlood(e.target.value)}
                  style={{
                    width:'100%', border:'none', outline:'none',
                    fontSize:'16px', fontWeight:600, color:'var(--label)',
                    background:'transparent', fontFamily:'inherit', cursor:'pointer',
                    letterSpacing:'-0.01em',
                  }}
                >
                  <option value="">Any blood type</option>
                  {BLOOD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <Button onClick={() => navigate(selectedBlood ? `/donors?bloodType=${selectedBlood}` : '/donors')} icon={<Search size={15} />}>
                Find Donors
              </Button>
            </div>

            <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
              <Link to="/register" style={{ textDecoration:'none' }}>
                <Button size="lg" icon={<Heart size={17} fill="#fff" />}>Become a Donor</Button>
              </Link>
              <Link to="/requests" style={{ textDecoration:'none' }}>
                <Button variant="ghost" size="lg" icon={<ArrowRight size={17} />}>View Requests</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section style={{ background:'#1C1C1E', padding:'28px 24px' }}>
        <div style={{
          maxWidth:'1200px', margin:'0 auto',
          display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))',
          gap:'0', textAlign:'center',
        }}>
          {[
            { value: stats.totalDonors?.toLocaleString() || '0',    label:'Registered Donors',  color:'#FF3B30' },
            { value: stats.totalRecipients?.toLocaleString() || '0',  label:'Recipients Helped',  color:'#34C759' },
            { value: donationStats.totalDonations?.toLocaleString() || '0', label:'Donations Made', color:'#007AFF' },
            { value: donationStats.totalUnits?.toLocaleString() || '0',     label:'Units Donated',  color:'#FF9500' },
          ].map((s, i) => (
            <div key={i} style={{ padding:'8px 16px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
              <div style={{ fontSize:'28px', fontWeight:800, color:'#fff', letterSpacing:'-0.04em', fontVariantNumeric:'tabular-nums' }}>{s.value}</div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)', marginTop:'3px', fontWeight:500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Blood Type Grid ── */}
      <section style={{ padding:'60px 24px', background:'#fff' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
          <p className="section-label" style={{ textAlign:'center', marginBottom:'6px' }}>Quick Search</p>
          <h2 style={{ fontSize:'28px', fontWeight:800, color:'var(--label)', letterSpacing:'-0.035em', textAlign:'center', marginBottom:'8px' }}>
            Find by Blood Type
          </h2>
          <p style={{ color:'var(--label-3)', fontSize:'15px', textAlign:'center', marginBottom:'36px' }}>
            Tap any type to instantly find available donors
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(110px, 1fr))', gap:'10px' }}>
            {BLOOD_TYPES.map(type => (
              <Link key={type} to={`/donors?bloodType=${type}`} style={{ textDecoration:'none' }}>
                <div style={{
                  background:'rgba(118,118,128,0.06)',
                  border:'1px solid rgba(0,0,0,0.05)',
                  borderRadius:'16px', padding:'18px 10px',
                  textAlign:'center', cursor:'pointer',
                  transition:'all .2s cubic-bezier(.16,1,.3,1)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(255,59,48,0.07)'; e.currentTarget.style.borderColor='rgba(255,59,48,0.2)'; e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(255,59,48,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='rgba(118,118,128,0.06)'; e.currentTarget.style.borderColor='rgba(0,0,0,0.05)'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}
                >
                  <BloodTypeBadge type={type} size="lg" />
                  <div style={{ fontSize:'11px', color:'var(--label-4)', marginTop:'8px', fontWeight:500 }}>Find donors</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ padding:'60px 24px', background:'var(--bg)' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
          <p className="section-label" style={{ textAlign:'center', marginBottom:'6px' }}>How It Works</p>
          <h2 style={{ fontSize:'28px', fontWeight:800, color:'var(--label)', letterSpacing:'-0.035em', textAlign:'center', marginBottom:'40px' }}>
            Three steps to save a life
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:'16px' }}>
            {[
              { step:'01', icon:<Users size={26} color="var(--red)" />, bg:'rgba(255,59,48,0.08)', title:'Register', desc:'Sign up with your name, phone, and blood type. Choose donor, recipient, or both.' },
              { step:'02', icon:<Search size={26} color="var(--blue)" />, bg:'rgba(0,122,255,0.08)', title:'Search & Connect', desc:'Recipients post requests. Donors search by blood type and city to find matches.' },
              { step:'03', icon:<Heart size={26} color="var(--green)" fill="var(--green)" />, bg:'rgba(52,199,89,0.08)', title:'Save a Life', desc:'Contact each other directly. No fees, no middlemen — just people helping people.' },
            ].map((item, i) => (
              <Card key={i} hover padding="26px">
                <div style={{ width:'52px', height:'52px', background:item.bg, borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'18px' }}>
                  {item.icon}
                </div>
                <div style={{ fontSize:'11px', fontWeight:700, color:'var(--label-4)', letterSpacing:'.08em', textTransform:'uppercase', marginBottom:'7px' }}>Step {item.step}</div>
                <h3 style={{ fontSize:'18px', fontWeight:700, color:'var(--label)', marginBottom:'9px', letterSpacing:'-0.02em' }}>{item.title}</h3>
                <p style={{ fontSize:'14px', color:'var(--label-3)', lineHeight:1.6 }}>{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Urgent Requests ── */}
      {recentRequests.length > 0 && (
        <section style={{ padding:'60px 24px', background:'#fff' }}>
          <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'28px', flexWrap:'wrap', gap:'12px' }}>
              <div>
                <p className="section-label" style={{ marginBottom:'4px' }}>Live Feed</p>
                <h2 style={{ fontSize:'26px', fontWeight:800, color:'var(--label)', letterSpacing:'-0.035em' }}>Urgent Requests</h2>
              </div>
              <Link to="/requests" style={{ textDecoration:'none' }}>
                <Button variant="tinted" size="sm" icon={<ChevronRight size={14} />}>View All</Button>
              </Link>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'14px' }}>
              {recentRequests.map(req => <RequestCard key={req._id} request={req} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Why Little Hearts ── */}
      <section style={{ padding:'60px 24px', background:'var(--bg)' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
          <p className="section-label" style={{ textAlign:'center', marginBottom:'6px' }}>Why Little Hearts</p>
          <h2 style={{ fontSize:'28px', fontWeight:800, color:'var(--label)', letterSpacing:'-0.035em', textAlign:'center', marginBottom:'36px' }}>
            Built different
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(210px, 1fr))', gap:'14px' }}>
            {[
              { icon:<Shield size={20} color="var(--blue)" />,  bg:'rgba(0,122,255,0.08)',  title:'Completely Free',   desc:'No charges, no hidden fees. Blood is a gift, not a transaction.' },
              { icon:<Zap    size={20} color="var(--orange)" />, bg:'rgba(255,149,0,0.08)', title:'Instant Matching',  desc:'Search by blood type and city to find donors in minutes.' },
              { icon:<Clock  size={20} color="var(--green)" />,  bg:'rgba(52,199,89,0.08)', title:'24/7 Available',    desc:'Emergencies don\'t wait. Our platform is always on.' },
              { icon:<Heart  size={20} color="var(--red)" fill="var(--red)" />, bg:'rgba(255,59,48,0.08)', title:'Community First', desc:'Built by the community, for the community.' },
            ].map((item, i) => (
              <Card key={i} padding="22px">
                <div style={{ width:'44px', height:'44px', background:item.bg, borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'14px' }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize:'15px', fontWeight:700, color:'var(--label)', marginBottom:'7px' }}>{item.title}</h3>
                <p style={{ fontSize:'13px', color:'var(--label-3)', lineHeight:1.6 }}>{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding:'80px 24px',
        background:'linear-gradient(145deg, #FF3B30 0%, #FF6B6B 100%)',
        textAlign:'center',
      }}>
        <div style={{ maxWidth:'560px', margin:'0 auto' }}>
          <div style={{ width:'64px', height:'64px', background:'rgba(255,255,255,0.15)', borderRadius:'18px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
            <Heart size={32} color="#fff" fill="#fff" className="animate-heartbeat" />
          </div>
          <h2 style={{ fontSize:'34px', fontWeight:900, color:'#fff', letterSpacing:'-0.04em', marginBottom:'14px' }}>
            Ready to save a life?
          </h2>
          <p style={{ fontSize:'17px', color:'rgba(255,255,255,0.78)', marginBottom:'32px', lineHeight:1.6, letterSpacing:'-0.01em' }}>
            Join thousands of donors and recipients. It takes 2 minutes to register and could save someone's life today.
          </p>
          <div style={{ display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/register" style={{ textDecoration:'none' }}>
              <button style={{
                padding:'13px 28px', background:'#fff', color:'var(--red)',
                border:'none', borderRadius:'13px', fontSize:'16px', fontWeight:700,
                cursor:'pointer', transition:'all .18s', fontFamily:'inherit',
                boxShadow:'0 4px 16px rgba(0,0,0,0.15)',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.15)'; }}
              >
                Register — It's Free
              </button>
            </Link>
            <Link to="/donors" style={{ textDecoration:'none' }}>
              <button style={{
                padding:'13px 28px', background:'rgba(255,255,255,0.15)',
                color:'#fff', border:'1.5px solid rgba(255,255,255,0.4)',
                borderRadius:'13px', fontSize:'16px', fontWeight:700,
                cursor:'pointer', transition:'all .18s', fontFamily:'inherit',
              }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.25)'}
                onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.15)'}
              >
                Browse Donors
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function RequestCard({ request }) {
  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <Link to={`/requests/${request._id}`} style={{ textDecoration:'none' }}>
      <Card hover padding="18px">
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'12px' }}>
          <BloodTypeBadge type={request.bloodType} size="lg" />
          <UrgencyBadge urgency={request.urgency} />
        </div>
        <p style={{ fontWeight:700, fontSize:'15px', color:'var(--label)', marginBottom:'5px' }}>
          {request.recipient?.name || 'Anonymous'}
        </p>
        {request.hospital && <p style={{ fontSize:'13px', color:'var(--label-3)', marginBottom:'3px' }}>🏥 {request.hospital}</p>}
        {request.city && <p style={{ fontSize:'13px', color:'var(--label-3)' }}>📍 {request.city}</p>}
        <div style={{ marginTop:'12px', paddingTop:'10px', borderTop:'1px solid var(--sep)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:'12px', color:'var(--label-4)' }}>{request.units} unit{request.units > 1 ? 's' : ''} · {timeAgo(request.createdAt)}</span>
          <span style={{ fontSize:'13px', color:'var(--red)', fontWeight:600, display:'flex', alignItems:'center', gap:'3px' }}>Respond <ChevronRight size={13} /></span>
        </div>
      </Card>
    </Link>
  );
}
