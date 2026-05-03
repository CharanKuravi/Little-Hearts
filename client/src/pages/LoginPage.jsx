import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Heart, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors(er => ({ ...er, [field]: '' }));
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.username.trim()) errs.username = 'Username is required';
    if (!form.password) errs.password = 'Password is required';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await login(form.username, form.password);
      toast('Welcome back', 'success');
      navigate('/dashboard');
    } catch (err) {
      toast(err.response?.data?.message || err.message || 'Login failed', 'error');
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
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
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
            Welcome back
          </h1>
          <p style={{ color: 'var(--label-3)', fontSize: '15px' }}>Sign in to your LifeLink account</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '20px', padding: '28px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Username" type="text"
              value={form.username} onChange={set('username')}
              placeholder="your_username"
              icon={<User size={15} />} error={errors.username} required
            />
            <div style={{ position: 'relative' }}>
              <Input
                label="Password"
                type={showPass ? 'text' : 'password'}
                value={form.password} onChange={set('password')}
                placeholder="Your password"
                icon={<Lock size={15} />} error={errors.password} required
              />
              <button type="button" onClick={() => setShowPass(s => !s)} style={{
                position: 'absolute', right: '13px', top: '34px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--label-4)', display: 'flex', alignItems: 'center',
              }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <Button type="submit" size="full" style={{ marginTop: '4px' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--sep)', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: 'var(--label-3)' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--red)', fontWeight: 600, textDecoration: 'none' }}>Join LifeLink</Link>
            </p>
          </div>
        </div>

        {/* Demo hint */}
        <div style={{
          marginTop: '14px', padding: '12px 16px',
          background: 'rgba(0,122,255,0.07)', borderRadius: '12px',
          border: '1px solid rgba(0,122,255,0.15)',
          fontSize: '13px', color: '#0055CC', textAlign: 'center',
        }}>
          Demo: Try username <strong>rahul</strong> with password <strong>password123</strong>
        </div>
      </div>
    </div>
  );
}
