'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAdmin } from '@/context/useAdmin';
import type { Customer, Order } from '@/lib/types';

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { backendURL, token, currency } = useAdmin();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState({ orderCount: 0, totalSpend: 0 });
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    try {
      const response = await axios.post(backendURL + '/api/user/admin/detail', { userId: id }, { headers: { token } });
      if (response.data.success) {
        setCustomer(response.data.user);
        setOrders(response.data.orders);
        setSummary(response.data.summary);
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, id]);

  const toggleBlock = async () => {
    if (!customer) return;
    try {
      const response = await axios.post(backendURL + '/api/user/admin/block', { userId: customer._id, isBlocked: !customer.isBlocked }, { headers: { token } });
      if (response.data.success) {
        toast.success(response.data.message);
        fetchDetail();
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) return null;
  if (!customer) return <div style={{ padding: '26px 24px' }}>Customer not found.</div>;

  return (
    <div style={{ padding: '26px 24px', maxWidth: 900 }}>
      <button type="button" className="btn btn-ghost" onClick={() => router.push('/customers')} style={{ marginBottom: 16 }}>← Back to customers</button>

      <div className="card" style={{ padding: 22, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ font: '500 20px/1.2 Inter', marginBottom: 6 }}>{customer.name}</div>
          <div style={{ fontSize: 13, color: 'var(--color-neutral-400)' }}>{customer.email}</div>
          <div style={{ fontSize: 12, color: 'var(--color-neutral-500)', marginTop: 6 }}>
            Joined {new Date(customer.joinedAt).toLocaleDateString()}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ font: '500 22px/1 Inter' }}>{currency}{summary.totalSpend}</div>
            <div style={{ fontSize: 12, color: 'var(--color-neutral-500)', marginTop: 4 }}>{summary.orderCount} order{summary.orderCount === 1 ? '' : 's'}</div>
          </div>
          <span className={customer.isBlocked ? 'tag tag-neutral' : 'tag tag-accent'}>{customer.isBlocked ? 'Blocked' : 'Active'}</span>
          <button type="button" className="btn btn-secondary" onClick={toggleBlock}>
            {customer.isBlocked ? 'Unblock' : 'Block'}
          </button>
        </div>
      </div>

      <div style={{ font: '500 11px/1 Inter', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: 12 }}>
        Order history
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {orders.map((o) => (
          <div key={o._id} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ font: '500 13px/1 Inter', minWidth: 80 }}>#{o._id.slice(-6).toUpperCase()}</span>
            <span style={{ fontSize: 12.5, color: 'var(--color-neutral-500)', minWidth: 100 }}>{new Date(o.date).toLocaleDateString()}</span>
            <span style={{ fontSize: 13, color: 'var(--color-neutral-300)', flex: 1 }}>
              {o.items.map((it) => `${it.name} x${it.quantity}`).join(', ')}
            </span>
            <span className="tag tag-neutral">{o.status}</span>
            <span style={{ font: '500 14px/1 Inter', minWidth: 60, textAlign: 'right' }}>{currency}{o.amount}</span>
          </div>
        ))}
        {orders.length === 0 && <p className="text-muted">No orders yet.</p>}
      </div>
    </div>
  );
}
