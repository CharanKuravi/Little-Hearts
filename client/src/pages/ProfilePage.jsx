import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, MapPin, Calendar, Heart, Edit3, Save, X, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import api from '../api/axios';
import Card from '../components/ui/Card';
import BloodTypeBadge from '../components/ui/BloodTypeBadge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

const ROLES = [
  { value:'donor',     label:'🩸 Donor' },
  { value:'recipient', label:'🏥 Recipient' },
  { value:'both',      label:'💪 Both' },
];

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '', email: user?.email || '',
    city: user?.city || '', age: user?.age || '',
    bio: user?.bio || '', role: user?.role || 'donor',
    isAvailable: user?.isAvailable ?? true,
  });
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [field]: val }));
    if (errors[field]) setErrors(er => ({ ...er, [field]: '' }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (form.age && (Number(form.age) < 18 || Number(form.age) > 65)) errs.age = 'Age must be 18–65';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      updateProfile({ ...form, age: form.age ? Number(form.age) : null });
      toast('Profile updated! ✅', 'success');
      setEditing(false);
    } catch (err) {
      toast(err.message || 'Failed to update', 'error');
    }
  };

  const handleCancel = () => {
    setForm({ name:user?.name||'', email:user?.email||'', city:user?.city||'', age:user?.age||'', bio:user?.bio||'', role:user?.role||'donor', isAvailable:user?.isAvailable??true });
    setErrors({});
    setEditing(false);
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      '⚠️ WARNING: This will permanently delete your account and all associated data (requests, donations, responses). This action CANNOT be undone.\n\nType "DELETE" in the next prompt to confirm.'
    );
    
    if (!confirmed) return;
    
    const confirmText = prompt('Type DELETE to confirm account deletion:');
    if (confirmText !== 'DELETE') {
      toast('Account deletion cancelled', 'error');
      return;
    }
    
    try {
      await api.delete('/auth/account');
      toast('Account deleted successfully', 'success');
      logout();
      navigate('/');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to delete account', 'error');
    }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{ maxWidth:'680px', margin:'0 auto', padding:'32px 24px' }}>
      <h1 style={{ fontSize:'28px', fontWeight:800, color:'var(--label)', letterSpacing:'-0.035em', marginBottom:'22px' }}>My Profile</h1>

      {/* Header card */}
      <Card padding="26px" style={{ marginBottom:'16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'18px', flexWrap:'wrap' }}>
          <div style={{ width:'72px', height:'72px', borderRadius:'20px', background:'linear-gradient(145deg,#FF453A,#FF3B30)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'26px', fontWeight:800, boxShadow:'0 6px 20px rgba(255,59,48,0.3)', flexShrink:0 }}>
            {initials}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'7px', flexWrap:'wrap' }}>
              <h2 style={{ fontSize:'20px', fontWeight:800, color:'var(--label)', letterSpacing:'-0.025em' }}>{user?.name}</h2>
              <BloodTypeBadge type={user?.bloodType} size="md" />
              <span style={{ fontSize:'11px', fontWeight:600, background:user?.isAvailable?'rgba(52,199,89,0.1)':'rgba(120,120,128,0.1)', color:user?.isAvailable?'#1A7F37':'var(--label-4)', border:`1px solid ${user?.isAvailable?'rgba(52,199,89,0.2)':'rgba(120,120,128,0.2)'}`, borderRadius:'var(--r-full)', padding:'2px 9px' }}>
                {user?.isAvailable ? '● Available' : '○ Unavailable'}
              </span>
            </div>
            <div style={{ display:'flex', gap:'14px', flexWrap:'wrap' }}>
              <span style={{ fontSize:'13px', color:'var(--label-3)', display:'flex', alignItems:'center', gap:'4px' }}><Phone size={12} /> {user?.phone}</span>
              {user?.city && <span style={{ fontSize:'13px', color:'var(--label-3)', display:'flex', alignItems:'center', gap:'4px' }}><MapPin size={12} /> {user.city}</span>}
              {user?.age && <span style={{ fontSize:'13px', color:'var(--label-3)', display:'flex', alignItems:'center', gap:'4px' }}><Calendar size={12} /> {user.age} yrs</span>}
            </div>
          </div>
          {!editing && <Button variant="ghost" size="sm" onClick={() => setEditing(true)} icon={<Edit3 size={14} />}>Edit</Button>}
        </div>
        {user?.bio && !editing && (
          <div style={{ marginTop:'14px', paddingTop:'14px', borderTop:'1px solid var(--sep)' }}>
            <p style={{ fontSize:'14px', color:'var(--label-3)', lineHeight:1.6 }}>{user.bio}</p>
          </div>
        )}
      </Card>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px', marginBottom:'16px' }}>
        {[
          { icon:<Heart size={16} color="var(--red)" fill="var(--red)" />, value:user?.totalDonations||0, label:'Donations', bg:'rgba(255,59,48,0.08)' },
          { icon:<span style={{fontSize:'14px'}}>🩸</span>, value:user?.bloodType||'—', label:'Blood Type', bg:'rgba(175,82,222,0.08)' },
          { icon:<span style={{fontSize:'14px'}}>👤</span>, value:user?.role==='both'?'Both':user?.role==='donor'?'Donor':'Recipient', label:'Role', bg:'rgba(0,122,255,0.08)' },
        ].map((s, i) => (
          <Card key={i} padding="14px" style={{ textAlign:'center' }}>
            <div style={{ width:'32px', height:'32px', background:s.bg, borderRadius:'9px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 7px' }}>{s.icon}</div>
            <p style={{ fontSize:'17px', fontWeight:800, color:'var(--label)', letterSpacing:'-0.025em' }}>{s.value}</p>
            <p style={{ fontSize:'11px', color:'var(--label-4)' }}>{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Edit form */}
      {editing && (
        <Card padding="26px" style={{ marginBottom:'16px' }}>
          <h3 style={{ fontSize:'16px', fontWeight:700, color:'var(--label)', marginBottom:'18px' }}>Edit Profile</h3>
          <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <Input label="Full Name" value={form.name} onChange={set('name')} icon={<User size={15} />} error={errors.name} required />
            <Input label="Email (optional)" type="email" value={form.email} onChange={set('email')} placeholder="your@email.com" />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
              <Input label="City" value={form.city} onChange={set('city')} placeholder="Your city" icon={<MapPin size={15} />} />
              <Input label="Age" type="number" value={form.age} onChange={set('age')} placeholder="18–65" icon={<Calendar size={15} />} min={18} max={65} error={errors.age} />
            </div>
            <Select label="Role" value={form.role} onChange={set('role')} options={ROLES} />
            <div>
              <label style={{ fontSize:'13px', fontWeight:600, color:'var(--label-2)', display:'block', marginBottom:'5px' }}>Bio (optional)</label>
              <textarea value={form.bio} onChange={set('bio')} placeholder="Tell donors/recipients about yourself..." maxLength={200} rows={3}
                style={{ width:'100%', padding:'11px 13px', fontSize:'15px', fontFamily:'inherit', background:'rgba(118,118,128,0.08)', border:'1.5px solid transparent', borderRadius:'11px', outline:'none', resize:'vertical', color:'var(--label)', lineHeight:1.5, transition:'all .18s' }}
                onFocus={e => { e.target.style.background='#fff'; e.target.style.borderColor='var(--blue)'; e.target.style.boxShadow='0 0 0 3.5px rgba(0,122,255,0.18)'; }}
                onBlur={e => { e.target.style.background='rgba(118,118,128,0.08)'; e.target.style.borderColor='transparent'; e.target.style.boxShadow='none'; }}
              />
              <p style={{ fontSize:'11px', color:'var(--label-4)', marginTop:'3px' }}>{form.bio.length}/200</p>
            </div>

            {/* Availability toggle */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px', background:'rgba(118,118,128,0.07)', borderRadius:'12px' }}>
              <div>
                <p style={{ fontSize:'14px', fontWeight:600, color:'var(--label)' }}>Available to Donate</p>
                <p style={{ fontSize:'12px', color:'var(--label-4)' }}>Toggle off if temporarily unavailable</p>
              </div>
              <label style={{ position:'relative', display:'inline-block', width:'46px', height:'26px', cursor:'pointer' }}>
                <input type="checkbox" checked={form.isAvailable} onChange={set('isAvailable')} style={{ opacity:0, width:0, height:0 }} />
                <span style={{ position:'absolute', inset:0, background:form.isAvailable?'var(--green)':'rgba(120,120,128,0.3)', borderRadius:'13px', transition:'background .2s' }} />
                <span style={{ position:'absolute', top:'3px', left:form.isAvailable?'23px':'3px', width:'20px', height:'20px', background:'#fff', borderRadius:'50%', boxShadow:'0 1px 4px rgba(0,0,0,0.2)', transition:'left .2s' }} />
              </label>
            </div>

            <div style={{ display:'flex', gap:'10px' }}>
              <Button variant="ghost" onClick={handleCancel} style={{ flex:1 }} icon={<X size={15} />}>Cancel</Button>
              <Button type="submit" style={{ flex:2 }} icon={<Save size={15} />}>Save Changes</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Account info */}
      {!editing && (
        <>
          <Card padding="22px" style={{ marginBottom:'16px' }}>
            <h3 style={{ fontSize:'15px', fontWeight:700, color:'var(--label)', marginBottom:'14px' }}>Account Details</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {[
                { label:'Phone', value:user?.phone },
                { label:'Email', value:user?.email || 'Not set' },
                { label:'Member since', value:user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US',{year:'numeric',month:'long'}) : '—' },
                { label:'Last donated', value:user?.lastDonated ? new Date(user.lastDonated).toLocaleDateString() : 'Never' },
              ].map((item, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 13px', background:'rgba(118,118,128,0.07)', borderRadius:'10px' }}>
                  <span style={{ fontSize:'14px', color:'var(--label-3)' }}>{item.label}</span>
                  <span style={{ fontSize:'14px', fontWeight:600, color:'var(--label)' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Danger Zone */}
          <Card padding="22px" style={{ border:'1.5px solid rgba(255,59,48,0.2)', background:'rgba(255,59,48,0.02)' }}>
            <h3 style={{ fontSize:'15px', fontWeight:700, color:'var(--red)', marginBottom:'8px', display:'flex', alignItems:'center', gap:'7px' }}>
              <Trash2 size={16} /> Danger Zone
            </h3>
            <p style={{ fontSize:'13px', color:'var(--label-3)', marginBottom:'14px', lineHeight:1.5 }}>
              Once you delete your account, there is no going back. This will permanently delete your profile, all blood requests, donations, and responses.
            </p>
            <Button variant="ghost" onClick={handleDeleteAccount} style={{ color:'var(--red)', borderColor:'rgba(255,59,48,0.3)' }} icon={<Trash2 size={15} />}>
              Delete Account Permanently
            </Button>
          </Card>
        </>
      )}
    </div>
  );
}
