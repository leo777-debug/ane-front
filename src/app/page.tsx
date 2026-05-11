
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SUPABASE_URL = 'https://bjymbbrdiqakbetanmso.supabase.co';
const SUPABASE_KEY = 'sb_publishable_nPDfS0UbQ4Ho0tot1fLvyQ_dIlCXqW3';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ email: email.trim(), name: name.trim(), created_at: new Date().toISOString() }),
      });

      if (res.status === 201 || res.ok) {
        setStatus('success');
      } else {
        const err = await res.json();
        if (err?.code === '23505') {
          setStatus('success');
        } else {
          throw new Error(err?.message || 'Something went wrong');
        }
      }
    } catch (e: any) {
      setStatus('error');
      setErrorMsg(e.message || 'Failed to join waitlist');
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#0a0b0f', color: '#e8eaf0', fontFamily: 'inherit' }}>
      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #1e2230', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-2px', background: 'linear-gradient(135deg,#00d4ff,#00ff88)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          ANE.ai
        </div>
        <button
          onClick={() => router.push('/simulate')}
          style={{ background: 'transparent', border: '1px solid #1e2230', borderRadius: 6, color: '#5a6080', fontFamily: 'inherit', fontSize: 12, padding: '8px 16px', cursor: 'pointer', letterSpacing: 1 }}
        >
          DEMO →
        </button>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '80px 24px 40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: '#00d4ff18', border: '1px solid #00d4ff44', borderRadius: 20, padding: '4px 14px', fontSize: 11, color: '#00d4ff', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 28 }}>
          Early Access
        </div>

        <h1 style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.1, letterSpacing: '-3px', marginBottom: 20 }}>
          See how the world<br />
          <span style={{ background: 'linear-gradient(135deg,#00d4ff,#00ff88)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            reacts to your content
          </span>
        </h1>

        <p style={{ fontSize: 18, color: '#8890a8', lineHeight: 1.7, marginBottom: 48, maxWidth: 560, margin: '0 auto 48px' }}>
          ANE simulates thousands of AI agents — each with unique demographics, personality, and media habits — reacting to your content before you post it.
        </p>

        {/* Features */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 64 }}>
          {[
            { icon: '🧬', title: 'OCEAN Agents', desc: 'Big Five personality profiles from Gen Z to Boomers, MENA to Global' },
            { icon: '🕸️', title: 'GraphRAG Brain', desc: 'Knowledge graph extraction finds hidden content patterns and triggers' },
            { icon: '⚡', title: 'Viral Prediction', desc: 'Get engagement, shareability and controversy scores before you post' },
          ].map((f) => (
            <div key={f.title} style={{ background: '#12141a', border: '1px solid #1e2230', borderRadius: 10, padding: 20, textAlign: 'left' }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e8eaf0', marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 11, color: '#5a6080', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Waitlist form */}
        <div style={{ background: '#12141a', border: '1px solid #1e2230', borderRadius: 12, padding: 36, maxWidth: 480, margin: '0 auto' }}>
          {status === 'success' ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🎉</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#00ff88', marginBottom: 8 }}>You're on the list!</div>
              <div style={{ fontSize: 13, color: '#5a6080', marginBottom: 24 }}>We'll email you when your access is ready.</div>
              <button
                onClick={() => router.push('/simulate')}
                style={{ background: 'linear-gradient(135deg,#00d4ff,#006688)', border: 'none', borderRadius: 6, color: '#000', fontFamily: 'inherit', fontWeight: 700, fontSize: 13, padding: '12px 24px', cursor: 'pointer', letterSpacing: 1 }}
              >
                TRY DEMO NOW →
              </button>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Join the waitlist</div>
              <div style={{ fontSize: 12, color: '#5a6080', marginBottom: 24 }}>Be first to access ANE when we launch publicly.</div>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', background: '#070809', border: '1px solid #1e2230', borderRadius: 6, color: '#e8eaf0', fontFamily: 'inherit', fontSize: 13, padding: '11px 14px', boxSizing: 'border-box', outline: 'none', marginBottom: 10 }}
                />
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ width: '100%', background: '#070809', border: '1px solid #1e2230', borderRadius: 6, color: '#e8eaf0', fontFamily: 'inherit', fontSize: 13, padding: '11px 14px', boxSizing: 'border-box', outline: 'none', marginBottom: 14 }}
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  style={{ width: '100%', background: status === 'loading' ? '#1e2230' : 'linear-gradient(135deg,#00d4ff,#006688)', border: 'none', borderRadius: 6, color: status === 'loading' ? '#5a6080' : '#000', fontFamily: 'inherit', fontWeight: 700, fontSize: 13, padding: '12px 24px', cursor: status === 'loading' ? 'not-allowed' : 'pointer', letterSpacing: 1 }}
                >
                  {status === 'loading' ? 'JOINING...' : 'GET EARLY ACCESS →'}
                </button>
                {status === 'error' && (
                  <div style={{ marginTop: 10, fontSize: 12, color: '#ff3355' }}>❌ {errorMsg}</div>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
