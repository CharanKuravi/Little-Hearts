import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const STARTERS = [
  'Which blood types are compatible with O+?',
  'How do I find a donor in my city?',
  'What is the 60-day donation rule?',
];

const SESSION_KEY = 'lh_chat_history';

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '[]'); } catch { return []; }
  });
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(history));
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { role: 'user', text: msg };
    const newHistory = [...history, userMsg];
    setHistory(newHistory);
    setLoading(true);

    try {
      const res = await api.post('/chat/message', {
        message: msg,
        history: newHistory.slice(-10).map(h => ({ role: h.role, text: h.text })),
      });
      setHistory(prev => [...prev, { role: 'model', text: res.data.response }]);
    } catch (err) {
      setHistory(prev => [...prev, { role: 'model', text: 'Something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000,
          width: '52px', height: '52px', borderRadius: '16px',
          background: 'linear-gradient(145deg, #FF453A, #FF3B30)',
          border: 'none', cursor: 'pointer', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(255,59,48,0.4)',
          transition: 'all .2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        title="AI Assistant"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '88px', right: '24px', zIndex: 999,
          width: '360px', maxHeight: '520px',
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(32px) saturate(200%)',
          WebkitBackdropFilter: 'blur(32px) saturate(200%)',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
          display: 'flex', flexDirection: 'column',
          animation: 'scaleIn .2s cubic-bezier(.16,1,.3,1)',
          transformOrigin: 'bottom right',
        }}>
          {/* Header */}
          <div style={{ padding: '16px 18px 14px', borderBottom: '1px solid rgba(60,60,67,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', background: 'linear-gradient(145deg,#FF453A,#FF3B30)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={16} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--label)' }}>Little Hearts AI</p>
              <p style={{ fontSize: '11px', color: 'var(--label-4)' }}>Blood donation assistant</p>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '200px', maxHeight: '340px' }}>
            {history.length === 0 ? (
              <div>
                <p style={{ fontSize: '13px', color: 'var(--label-3)', marginBottom: '12px', textAlign: 'center' }}>
                  Ask me anything about blood donation
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {STARTERS.map((q, i) => (
                    <button key={i} onClick={() => send(q)} style={{
                      padding: '9px 12px', background: 'rgba(0,122,255,0.07)', border: '1px solid rgba(0,122,255,0.15)',
                      borderRadius: '10px', cursor: 'pointer', fontSize: '13px', color: 'var(--blue)',
                      fontFamily: 'inherit', textAlign: 'left', transition: 'all .15s', fontWeight: 500,
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,122,255,0.12)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,122,255,0.07)'}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              history.map((msg, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: msg.role === 'user' ? 'linear-gradient(145deg,#FF453A,#FF3B30)' : 'rgba(0,122,255,0.1)' }}>
                    {msg.role === 'user' ? <User size={13} color="#fff" /> : <Bot size={13} color="var(--blue)" />}
                  </div>
                  <div style={{
                    maxWidth: '80%', padding: '9px 12px', borderRadius: msg.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                    background: msg.role === 'user' ? 'linear-gradient(145deg,#FF453A,#FF3B30)' : 'rgba(118,118,128,0.08)',
                    fontSize: '13px', lineHeight: 1.5,
                    color: msg.role === 'user' ? '#fff' : 'var(--label)',
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'rgba(0,122,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={13} color="var(--blue)" />
                </div>
                <div style={{ padding: '10px 14px', background: 'rgba(118,118,128,0.08)', borderRadius: '4px 14px 14px 14px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--label-4)', animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Disclaimer */}
          <p style={{ fontSize: '11px', color: 'var(--label-4)', textAlign: 'center', padding: '6px 14px 0', borderTop: '1px solid rgba(60,60,67,0.06)' }}>
            AI responses are for guidance only. Always verify with a medical professional.
          </p>

          {/* Input */}
          {user ? (
            <div style={{ padding: '10px 14px 14px', display: 'flex', gap: '8px' }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Ask about blood donation..."
                maxLength={1000}
                style={{
                  flex: 1, padding: '10px 13px', fontSize: '13px', fontFamily: 'inherit',
                  background: 'rgba(118,118,128,0.08)', border: '1.5px solid transparent',
                  borderRadius: '11px', outline: 'none', color: 'var(--label)',
                  transition: 'all .18s',
                }}
                onFocus={e => { e.target.style.background = '#fff'; e.target.style.borderColor = 'var(--blue)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,122,255,0.15)'; }}
                onBlur={e => { e.target.style.background = 'rgba(118,118,128,0.08)'; e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; }}
              />
              <button onClick={() => send()} disabled={!input.trim() || loading} style={{
                width: '38px', height: '38px', borderRadius: '11px', border: 'none', cursor: 'pointer',
                background: input.trim() && !loading ? 'linear-gradient(145deg,#FF453A,#FF3B30)' : 'rgba(118,118,128,0.12)',
                color: input.trim() && !loading ? '#fff' : 'var(--label-4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s',
              }}>
                <Send size={15} />
              </button>
            </div>
          ) : (
            <div style={{ padding: '12px 14px 14px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: 'var(--label-3)' }}>
                <a href="/login" style={{ color: 'var(--red)', fontWeight: 600, textDecoration: 'none' }}>Sign in</a> to use the AI assistant
              </p>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </>
  );
}
