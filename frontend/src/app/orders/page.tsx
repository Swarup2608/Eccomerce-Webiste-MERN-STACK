'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useShop } from '@/context/useShop';
import ProductThumb from '@/components/ProductThumb';
import Reveal from '@/components/Reveal';
import type { Order } from '@/lib/types';

export default function Orders() {
  const { backendURL, token, currency } = useShop();
  const [orders, setOrders] = useState<Order[]>([]);

  const loadOrders = async () => {
    if (!token) return;
    try {
      const response = await axios.post(backendURL + '/api/order/userorders', {}, { headers: { token } });
      if (response.data.success) {
        setOrders(response.data.orders.slice().reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const tagClass = (status: string) => (status === 'Delivered' ? 'tag tag-accent' : 'tag tag-neutral');

  return (
    <main className="container" style={{ padding: '44px 26px 80px' }}>
      <h2 style={{ letterSpacing: '-.025em', margin: '0 0 28px' }}>Your orders</h2>

      {orders.length === 0 ? (
        <div className="card" style={{ padding: '70px 34px', maxWidth: 560 }}>
          <div style={{ font: '500 22px/1.2 Inter', marginBottom: 8 }}>No orders yet</div>
          <p style={{ fontSize: 14, color: 'var(--color-neutral-400)', maxWidth: '42ch' }}>
            Once you place an order it will show up here with live tracking and its repair history.
          </p>
          <Link href="/collections" className="btn btn-primary">Browse the shelves</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {orders.map((o) => (
            <Reveal key={o._id}>
            <div className="card" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <span style={{ font: '500 15px/1 Inter' }}>#{o._id.slice(-6).toUpperCase()}</span>
                <span style={{ fontSize: 12.5, color: 'var(--color-neutral-500)' }}>
                  {new Date(o.date).toDateString()} · {o.paymentMethod}
                </span>
                <span className={tagClass(o.status)} style={{ marginLeft: 'auto' }}>{o.status}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
                {o.items.map((it, i) => (
                  <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'center' }}>
                    <div style={{ width: 40 }}><ProductThumb image={it.image?.[0]} name={it.name} /></div>
                    <div>
                      <div style={{ fontSize: 13.5 }}>{it.name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--color-neutral-500)' }}>{it.variantLabel} {it.variant} × {it.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hr" style={{ margin: '16px 0 14px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <span style={{ font: '500 16px/1 Inter' }}>{currency}{o.amount}</span>
                <span style={{ fontSize: 12.5, color: 'var(--color-neutral-500)' }}>{o.payment ? 'Paid' : 'Payment pending'}</span>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  <button type="button" className="btn btn-secondary" onClick={loadOrders} style={{ fontSize: 13 }}>Track</button>
                </div>
              </div>
            </div>
            </Reveal>
          ))}
        </div>
      )}
    </main>
  );
}
