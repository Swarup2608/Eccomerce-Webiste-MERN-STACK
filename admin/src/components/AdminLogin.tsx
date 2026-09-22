'use client';

import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getErrorMessage } from '@/lib/errors';
import { useAdmin } from '@/context/useAdmin';

export default function AdminLogin() {
  const { setToken, backendURL } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(backendURL + '/api/user/admin', { email, password });
      if (response.data.success) {
        setToken(response.data.token);
        setError(false);
      } else {
        setError(true);
        toast.error(response.data.message);
      }
    } catch (err) {
      setError(true);
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '60px 26px', background: 'radial-gradient(90% 70% at 50% 0%,#20233a,#161826 70%)' }}>
      <form onSubmit={onSubmit} className="card reveal" style={{ width: '100%', maxWidth: 390, padding: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 22 }}>
          <span style={{ width: 22, height: 22, border: '1.5px solid var(--color-accent)', borderRadius: 7, display: 'grid', placeItems: 'center' }}>
            <span style={{ width: 7, height: 7, background: 'var(--color-accent)', borderRadius: 2 }} />
          </span>
          <span style={{ font: '500 16px/1 Inter' }}>EcoCart <span style={{ color: 'var(--color-neutral-500)' }}>Admin</span></span>
        </div>
        <h3 style={{ margin: '0 0 6px' }}>Sign in to the panel</h3>
        <p style={{ fontSize: 13, color: 'var(--color-neutral-500)', marginBottom: 22 }}>Staff accounts only. Sessions expire after 12 hours.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field">
            <label>Work email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@ecocart.co" required />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--color-accent-2-900)', fontSize: 12.5, color: 'var(--color-accent-2-200)' }}>
              Those credentials did not match. Check your email and password.
            </div>
          )}
          <button type="submit" className="btn btn-primary btn-block" style={{ padding: '11px 16px', fontSize: 15 }}>Sign in</button>
        </div>
      </form>
    </main>
  );
}
