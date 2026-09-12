'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useShop } from '@/context/useShop';

export default function Login() {
  const { token, setToken, backendURL } = useShop();
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (token) router.push('/');
  }, [token, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isSignup ? '/api/user/register' : '/api/user/login';
      const payload = isSignup ? { name, email, password } : { email, password };
      const response = await axios.post(backendURL + url, payload);
      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <main className="login-split" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', minHeight: '74vh' }}>
      <div style={{ padding: '74px 26px', display: 'grid', placeItems: 'center' }}>
        <form onSubmit={onSubmit} style={{ width: '100%', maxWidth: 380 }}>
          <h2 style={{ letterSpacing: '-.025em', margin: '0 0 6px' }}>{isSignup ? 'Create account' : 'Sign in'}</h2>
          <p style={{ fontSize: 14, color: 'var(--color-neutral-400)', marginBottom: 26 }}>
            {isSignup ? 'Join EcoCart to track orders and save favourites.' : 'Welcome back — sign in to continue.'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {isSignup && (
              <div className="field">
                <label>Name</label>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Priya Raman" required />
              </div>
            )}
            <div className="field">
              <label>Email</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="field">
              <label>Password</label>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, color: 'var(--color-neutral-500)' }}>
              <span>{isSignup ? 'Already have an account?' : 'New to EcoCart?'}</span>
              <button type="button" className="btn btn-ghost" onClick={() => setIsSignup((v) => !v)} style={{ fontSize: 12.5 }}>
                {isSignup ? 'Sign in' : 'Create account'}
              </button>
            </div>
            <button type="submit" className="btn btn-primary btn-block" style={{ padding: '11px 16px', fontSize: 15 }}>
              {isSignup ? 'Create account' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
      <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(200deg,#262a60,#1b1d30 70%)', display: 'grid', placeItems: 'center', padding: 40 }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.5, display: 'grid', placeItems: 'center' }}>
          <div style={{ width: 260, height: 260, border: '1px solid color-mix(in srgb,var(--color-accent) 40%,transparent)', borderRadius: '50%', animation: 'ec-float 7s ease-in-out infinite' }} />
        </div>
        <blockquote style={{ position: 'relative', margin: 0, maxWidth: '30ch', fontSize: 22, lineHeight: 1.35, letterSpacing: '-.02em' }}>
          “The cheapest thing you can own is the thing you already have.”
          <footer style={{ marginTop: 16, fontSize: 12.5, color: 'var(--color-neutral-400)' }}>EcoCart maker charter, §1</footer>
        </blockquote>
      </div>
    </main>
  );
}
