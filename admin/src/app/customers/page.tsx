'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAdmin } from '@/context/useAdmin';
import type { Customer } from '@/lib/types';

const PAGE_SIZE = 20;

export default function Customers() {
  const { backendURL, token } = useAdmin();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchCustomers = async () => {
    if (!token) return;
    try {
      const response = await axios.post(backendURL + '/api/user/admin/list', { page, limit: PAGE_SIZE, search: search || undefined }, { headers: { token } });
      if (response.data.success) {
        setCustomers(response.data.users);
        setPages(response.data.pages);
        setTotal(response.data.total);
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page, search]);

  useEffect(() => setPage(1), [search]);

  const toggleBlock = async (c: Customer) => {
    try {
      const response = await axios.post(backendURL + '/api/user/admin/block', { userId: c._id, isBlocked: !c.isBlocked }, { headers: { token } });
      if (response.data.success) {
        toast.success(response.data.message);
        fetchCustomers();
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div style={{ padding: '26px 24px' }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        <input className="input" placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 320 }} />
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Joined</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c._id}>
              <td>{c.name}</td>
              <td style={{ color: 'var(--color-neutral-400)' }}>{c.email}</td>
              <td style={{ color: 'var(--color-neutral-400)' }}>{new Date(c.joinedAt).toLocaleDateString()}</td>
              <td><span className={c.isBlocked ? 'tag tag-neutral' : 'tag tag-accent'}>{c.isBlocked ? 'Blocked' : 'Active'}</span></td>
              <td style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <Link href={`/customers/${c._id}`} className="btn btn-ghost" style={{ fontSize: 13 }}>View</Link>
                  <button type="button" className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => toggleBlock(c)}>
                    {c.isBlocked ? 'Unblock' : 'Block'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {customers.length === 0 && <p className="text-muted" style={{ marginTop: 20 }}>No customers yet.</p>}

      {pages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18 }}>
          <button type="button" className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
          <span style={{ fontSize: 13, color: 'var(--color-neutral-500)' }}>Page {page} of {pages} · {total} customers</span>
          <button type="button" className="btn btn-secondary" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
