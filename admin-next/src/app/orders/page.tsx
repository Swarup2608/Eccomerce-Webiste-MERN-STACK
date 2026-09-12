'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAdmin } from '@/context/useAdmin';
import { ORDER_STATUSES, type Order } from '@/lib/types';
import { downloadCSV } from '@/lib/csv';

const PAGE_SIZE = 20;

export default function AdminOrders() {
  const { backendURL, token, currency } = useAdmin();
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState('');

  const filters = { status: status || undefined, search: search || undefined, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined };

  const fetchOrders = async () => {
    if (!token) return;
    try {
      const response = await axios.post(backendURL + '/api/order/list', { page, limit: PAGE_SIZE, ...filters }, { headers: { token } });
      if (response.data.success) {
        setOrders(response.data.orders);
        setPages(response.data.pages);
        setTotal(response.data.total);
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page, status, search, dateFrom, dateTo]);

  useEffect(() => setPage(1), [status, search, dateFrom, dateTo]);

  const statusHandler = async (orderId: string, newStatus: string) => {
    try {
      const response = await axios.post(backendURL + '/api/order/statusupdate', { orderId, status: newStatus }, { headers: { token } });
      if (response.data.success) {
        toast.success(response.data.message);
        fetchOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const refund = async (orderId: string) => {
    try {
      const response = await axios.post(backendURL + '/api/order/refund', { orderId }, { headers: { token } });
      if (response.data.success) {
        toast.success(response.data.message);
        fetchOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected((prev) => (prev.size === orders.length ? new Set() : new Set(orders.map((o) => o._id))));
  };

  const applyBulkStatus = async () => {
    if (!bulkStatus || selected.size === 0) return;
    try {
      const response = await axios.post(backendURL + '/api/order/bulk-status', { orderIds: Array.from(selected), status: bulkStatus }, { headers: { token } });
      if (response.data.success) {
        toast.success(response.data.message);
        setSelected(new Set());
        setBulkStatus('');
        fetchOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const exportCSV = async () => {
    try {
      const response = await axios.post(backendURL + '/api/order/list', { page: 1, limit: 10000, ...filters }, { headers: { token } });
      if (!response.data.success) {
        toast.error(response.data.message);
        return;
      }
      const all: Order[] = response.data.orders;
      const rows: (string | number)[][] = [
        ['Order ID', 'Date', 'Customer', 'Email', 'Items', 'Amount', 'Discount', 'Payment Method', 'Paid', 'Status'],
        ...all.map((o) => [
          o._id,
          new Date(o.date).toISOString(),
          `${o.address.firstName} ${o.address.lastName}`,
          o.address.email,
          o.items.map((it) => `${it.name} x${it.quantity} (${it.size})`).join('; '),
          o.amount,
          o.discount ?? 0,
          o.paymentMethod,
          o.payment ? 'Yes' : 'No',
          o.status,
        ]),
      ];
      downloadCSV(`orders-${Date.now()}.csv`, rows);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const canRefund = (o: Order) => o.payment && o.paymentMethod !== 'COD' && o.status !== 'Refunded';

  const clearFilters = () => {
    setStatus('');
    setSearch('');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div style={{ padding: '26px 24px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 18 }}>
        <input className="input" placeholder="Search name, email, phone, or order id" value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input className="input" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ maxWidth: 160 }} />
        <span style={{ color: 'var(--color-neutral-500)', fontSize: 13 }}>to</span>
        <input className="input" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ maxWidth: 160 }} />
        <button type="button" className="btn btn-ghost" onClick={clearFilters}>Clear</button>
        <button type="button" className="btn btn-secondary" style={{ marginLeft: 'auto' }} onClick={exportCSV}>Export CSV</button>
      </div>

      {selected.size > 0 && (
        <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <span style={{ fontSize: 13 }}>{selected.size} selected</span>
          <select className="input" value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} style={{ maxWidth: 200 }}>
            <option value="">Set status to…</option>
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="button" className="btn btn-primary" onClick={applyBulkStatus} disabled={!bulkStatus}>Apply</button>
          <button type="button" className="btn btn-ghost" onClick={() => setSelected(new Set())}>Clear selection</button>
        </div>
      )}

      <table className="table">
        <thead>
          <tr>
            <th style={{ width: 30 }}>
              <span className={`check ${selected.size === orders.length && orders.length > 0 ? 'on' : ''}`} style={{ cursor: 'pointer' }} onClick={toggleSelectAll}>
                {selected.size === orders.length && orders.length > 0 && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12.5 4.5 4.5L19 7" /></svg>
                )}
              </span>
            </th>
            <th>Order</th>
            <th>Customer</th>
            <th>Payment</th>
            <th>Amount</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>
                <span className={`check ${selected.has(order._id) ? 'on' : ''}`} style={{ cursor: 'pointer' }} onClick={() => toggleSelect(order._id)}>
                  {selected.has(order._id) && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12.5 4.5 4.5L19 7" /></svg>
                  )}
                </span>
              </td>
              <td>
                <div style={{ font: '500 13px/1 Inter' }}>#{order._id.slice(-6).toUpperCase()}</div>
                <div style={{ fontSize: 11.5, color: 'var(--color-neutral-500)', marginTop: 4 }}>
                  {new Date(order.date).toLocaleDateString()} · {order.items.length} item{order.items.length === 1 ? '' : 's'}
                </div>
              </td>
              <td style={{ color: 'var(--color-neutral-400)', fontSize: 13 }}>
                {order.address.firstName} {order.address.lastName}
              </td>
              <td style={{ fontSize: 13 }}>
                {order.paymentMethod} · {order.payment ? 'Paid' : 'Pending'}
              </td>
              <td>{currency}{order.amount}</td>
              <td>
                <select className="input" value={order.status} onChange={(e) => statusHandler(order._id, e.target.value)} style={{ minWidth: 170 }}>
                  {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              <td style={{ textAlign: 'right' }}>
                {canRefund(order) && (
                  <button type="button" className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => refund(order._id)}>Refund</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 && <p className="text-muted" style={{ marginTop: 20 }}>No orders match these filters.</p>}

      {pages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18 }}>
          <button type="button" className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
          <span style={{ fontSize: 13, color: 'var(--color-neutral-500)' }}>Page {page} of {pages} · {total} orders</span>
          <button type="button" className="btn btn-secondary" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
