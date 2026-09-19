'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAdmin } from '@/context/useAdmin';
import type { Coupon } from '@/lib/types';

const DEFAULT_FORM = {
  code: '', type: 'percent' as 'percent' | 'fixed', value: '', minOrderAmount: '', maxUses: '', perUserLimit: '1', expiresAt: '',
};

export default function Coupons() {
  const { backendURL, token } = useAdmin();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchCoupons = async () => {
    try {
      const response = await axios.post(backendURL + '/api/coupon/list', {}, { headers: { token } });
      if (response.data.success) setCoupons(response.data.coupons);
      else toast.error(response.data.message);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) fetchCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const resetForm = () => {
    setForm(DEFAULT_FORM);
    setEditingId(null);
  };

  const startEdit = (c: Coupon) => {
    setEditingId(c._id);
    setForm({
      code: c.code,
      type: c.type,
      value: String(c.value),
      minOrderAmount: String(c.minOrderAmount),
      maxUses: c.maxUses == null ? '' : String(c.maxUses),
      perUserLimit: String(c.perUserLimit),
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '',
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      code: form.code,
      type: form.type,
      value: form.value,
      minOrderAmount: form.minOrderAmount,
      maxUses: form.maxUses,
      perUserLimit: form.perUserLimit,
      expiresAt: form.expiresAt || null,
    };
    try {
      const response = editingId
        ? await axios.post(backendURL + '/api/coupon/update', { id: editingId, ...payload }, { headers: { token } })
        : await axios.post(backendURL + '/api/coupon/add', payload, { headers: { token } });
      if (response.data.success) {
        toast.success(response.data.message);
        resetForm();
        fetchCoupons();
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleActive = async (c: Coupon) => {
    try {
      const response = await axios.post(backendURL + '/api/coupon/update', { id: c._id, active: !c.active }, { headers: { token } });
      if (response.data.success) fetchCoupons();
      else toast.error(response.data.message);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const removeCoupon = async (id: string) => {
    try {
      const response = await axios.post(backendURL + '/api/coupon/remove', { id }, { headers: { token } });
      if (response.data.success) {
        toast.success(response.data.message);
        fetchCoupons();
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div style={{ padding: '26px 24px', maxWidth: 900 }}>
      <form onSubmit={onSubmit} className="card" style={{ padding: 20, display: 'grid', gap: 14, marginBottom: 24 }}>
        <div style={{ font: '500 11px/1 Inter', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-500)' }}>
          {editingId ? 'Edit coupon' : 'New coupon'}
        </div>
        <div className="form-grid-collapse" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          <div className="field">
            <label>Code</label>
            <input className="input" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} placeholder="WELCOME10" required disabled={!!editingId} />
          </div>
          <div className="field">
            <label>Type</label>
            <div className="seg" style={{ width: '100%' }}>
              <label className={`seg-opt ${form.type === 'percent' ? 'on' : ''}`} style={{ flex: 1, justifyContent: 'center' }}>
                <input type="radio" checked={form.type === 'percent'} onChange={() => setForm((f) => ({ ...f, type: 'percent' }))} style={{ display: 'none' }} />
                Percent
              </label>
              <label className={`seg-opt ${form.type === 'fixed' ? 'on' : ''}`} style={{ flex: 1, justifyContent: 'center' }}>
                <input type="radio" checked={form.type === 'fixed'} onChange={() => setForm((f) => ({ ...f, type: 'fixed' }))} style={{ display: 'none' }} />
                Fixed
              </label>
            </div>
          </div>
          <div className="field">
            <label>Value {form.type === 'percent' ? '(%)' : '($)'}</label>
            <input className="input" type="number" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} placeholder="10" required />
          </div>
        </div>
        <div className="form-grid-collapse" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
          <div className="field">
            <label>Min order amount</label>
            <input className="input" type="number" value={form.minOrderAmount} onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value }))} placeholder="0" />
          </div>
          <div className="field">
            <label>Max uses (blank = unlimited)</label>
            <input className="input" type="number" value={form.maxUses} onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))} placeholder="100" />
          </div>
          <div className="field">
            <label>Per-customer limit</label>
            <input className="input" type="number" value={form.perUserLimit} onChange={(e) => setForm((f) => ({ ...f, perUserLimit: e.target.value }))} placeholder="1" />
          </div>
          <div className="field">
            <label>Expires</label>
            <input className="input" type="date" value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 18px' }}>
            {editingId ? 'Save changes' : 'Create coupon'}
          </button>
          {editingId && <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      <div className="table-scroll">
      <table className="table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Value</th>
            <th>Min order</th>
            <th>Uses</th>
            <th>Expires</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((c) => (
            <tr key={c._id}>
              <td style={{ font: '500 13px/1 Inter' }}>{c.code}</td>
              <td>{c.type === 'percent' ? `${c.value}%` : `$${c.value}`}</td>
              <td style={{ color: 'var(--color-neutral-400)' }}>${c.minOrderAmount}</td>
              <td style={{ color: 'var(--color-neutral-400)' }}>{c.usedCount}{c.maxUses != null ? ` / ${c.maxUses}` : ''}</td>
              <td style={{ color: 'var(--color-neutral-400)' }}>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '—'}</td>
              <td><span className={c.active ? 'tag tag-accent' : 'tag tag-neutral'}>{c.active ? 'Active' : 'Inactive'}</span></td>
              <td style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => toggleActive(c)}>
                    {c.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button type="button" className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => startEdit(c)}>Edit</button>
                  <button type="button" className="btn btn-icon btn-ghost" onClick={() => removeCoupon(c._id)} title="Remove">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M7 7l10 10M17 7 7 17" /></svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {coupons.length === 0 && <p className="text-muted" style={{ marginTop: 20 }}>No coupons yet.</p>}
    </div>
  );
}
