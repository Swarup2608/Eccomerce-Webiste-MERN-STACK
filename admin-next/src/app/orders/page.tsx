'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAdmin } from '@/context/useAdmin';
import type { Order } from '@/lib/types';

const STATUS_OPTS = ['Order Placed', 'Packing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const { backendURL, token, currency } = useAdmin();
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchAllOrders = async () => {
    if (!token) return;
    try {
      const response = await axios.post(backendURL + '/api/order/list', {}, { headers: { token } });
      if (response.data.success) setOrders(response.data.orders.slice().reverse());
      else toast.error(response.data.message);
    } catch (error: any) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const statusHandler = async (event: React.ChangeEvent<HTMLSelectElement>, orderId: string) => {
    try {
      const status = event.target.value;
      const response = await axios.post(backendURL + '/api/order/statusupdate', { orderId, status }, { headers: { token } });
      if (response.data.success) {
        await fetchAllOrders();
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchAllOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div style={{ padding: '26px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {orders.map((order) => (
        <div key={order._id} className="card" style={{ padding: '18px 20px', display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr) auto', gap: 22, alignItems: 'start' }}>
          <div>
            <div style={{ font: '500 14px/1 Inter', marginBottom: 9 }}>#{order._id.slice(-6).toUpperCase()}</div>
            {order.items.map((item, i) => (
              <div key={i} style={{ fontSize: 13, color: 'var(--color-neutral-300)' }}>
                {item.name} × {item.quantity} <span>{item.size}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-neutral-400)', lineHeight: 1.6 }}>
            <div style={{ color: 'var(--color-text)' }}>{order.address.firstName} {order.address.lastName}</div>
            <div>{order.address.street},</div>
            <div>{order.address.city}, {order.address.state},</div>
            <div>{order.address.country} - {order.address.zipcode}</div>
            <div>{order.address.phone}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, alignItems: 'flex-end' }}>
            <span style={{ font: '500 16px/1 Inter' }}>{currency}{order.amount}</span>
            <span style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>{order.paymentMethod} · {order.payment ? 'Paid' : 'Pending'}</span>
            <div className="field" style={{ minWidth: 170 }}>
              <select className="input" value={order.status} onChange={(e) => statusHandler(e, order._id)}>
                {STATUS_OPTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
      ))}
      {orders.length === 0 && <p className="text-muted">No orders yet.</p>}
    </div>
  );
}
