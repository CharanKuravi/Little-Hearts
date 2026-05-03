import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Phone, Lock, MapPin, Heart, Eye, EyeOff, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

const BLOOD_TYPES = ['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => ({ value: t, label: t }));
const ROLES = [
  { value: 'donor',     label: '🩸 Donor — I want to donate blood' },
  { value: 'recipient', label: '🏥 Recipient — I need blood' },
  { value: 'both',      label: '💪 Both — Donor & Recipient' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', username: '', phone: '', aadhar: '', password: '', confirmPassword: '',
    bloodType: '', role: 'donor', city: '', age: '',
  });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors(er => ({ ...er, [field]: '' }));
  };

  const handleNext = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.username.trim()) errs.username = 'Username is required';
    if (form.username && (form.username.length < 3 || form.username.length > 20)) {
      errs.username = 'Username must be 3-20 characters';
    }
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    if (!form.aadhar.trim()) errs.aadhar = 'Aadhar number is required';
    if (form.aadhar && (form.aadhar.length !== 12 || !/^\d{12}$/.test(form.aadhar))) {
      errs.aadhar = 'Aadhar must be exactly 12 digits';
    }
    if (!form.password || form.password.length < 6) errs.password = 'Min. 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep(2);
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.bloodType) errs.bloodType = 'Blood type is required';
    if (form.age && (Number(form.age) < 18 || Number(form.age) > 65)) errs.age = 'Age must be 18–65';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await register({
        name: form.name, username: form.username, phone: form.phone, aadhar: form.aadhar, password: form.password,
        bloodType: form.bloodType, role: form.role,
        city: form.city, age: form.age ? Number(form.age) : null,
      });
      toast('Welcome to LifeLink', 'success');
      navigate('/dashboard');
    } catch (err) {
      toast(err.response?.data?.message || err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '40px 24px',
      background: 'linear-gradient(160deg, #fff 0%, #FFF0EF 100%)',
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '52px', height: '52px',
            background: 'linear-gradient(145deg, #FF453A, #FF3B30)',
            borderRadius: '15px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 14px',
            boxShadow: '0 6px 20px rgba(255,59,48,0.32)',
          }}>
            <Heart size={26} color="#fff" fill="#fff" />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--label)', letterSpacing: '-0.035em', marginBottom: '6px' }}>
            Join LifeLink
          </h1>
          <p style={{ color: 'var(--label-3)', fontSize: '15px' }}>Create your free account in 2 minutes</p>
        </div>

        {/* Step bar */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
          {[1, 2].map(s => (
            <div key={s} style={{
              flex: 1, height: '3px', borderRadius: '2px',
              background: s <= step ? 'linear-gradient(90deg, #FF3B30, #FF6B6B)' : 'rgba(120,120,128,0.15)',
              transition: 'background .3s',
            }} />
          ))}
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '20px', padding: '28px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)',
        }}>
          {step === 1 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--label)', marginBottom: '2px' }}>Personal Info</p>
                <p style={{ fontSize: '12px', color: 'var(--label-4)' }}>Step 1 of 2</p>
              </div>
              <Input label="Full Name" value={form.name} onChange={set('name')} placeholder="Your full name" icon={<User size={15} />} error={errors.name} required />
              <Input label="Username" type="text" value={form.username} onChange={set('username')} placeholder="your_username" icon={<User size={15} />} error={errors.username} hint="3-20 characters, used for login" required />
              <Input label="Phone Number" type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" icon={<Phone size={15} />} error={errors.phone} required />
              <Input label="Aadhar Number" type="text" value={form.aadhar} onChange={set('aadhar')} placeholder="123456789012" maxLength={12} error={errors.aadhar} hint="12-digit Aadhar number" required />
              <div style={{ position: 'relative' }}>
                <Input label="Password" type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Min. 6 characters" icon={<Lock size={15} />} error={errors.password} required />
                <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: '13px', top: '34px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--label-4)', display: 'flex' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <Input label="Confirm Password" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat password" icon={<Lock size={15} />} error={errors.confirmPassword} required />
              <Button size="full" onClick={handleNext} style={{ marginTop: '4px' }}>Continue →</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--label)', marginBottom: '2px' }}>Blood Profile</p>
                <p style={{ fontSize: '12px', color: 'var(--label-4)' }}>Step 2 of 2</p>
              </div>
              <Select label="Blood Type" value={form.bloodType} onChange={set('bloodType')} options={BLOOD_TYPES} placeholder="Select your blood type" error={errors.bloodType} required />
              <Select label="I want to be a..." value={form.role} onChange={set('role')} options={ROLES} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Input label="City" value={form.city} onChange={set('city')} placeholder="e.g. New York" icon={<MapPin size={15} />} />
                <Input label="Age" type="number" value={form.age} onChange={set('age')} placeholder="18–65" icon={<Calendar size={15} />} min={18} max={65} error={errors.age} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <Button variant="ghost" onClick={() => setStep(1)} style={{ flex: 1 }} disabled={loading}>← Back</Button>
                <Button type="submit" style={{ flex: 2 }} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Account'}
                </Button>
              </div>
            </form>
          )}

          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--sep)', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: 'var(--label-3)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--red)', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
