'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAdmin } from '@/context/useAdmin';
import type { Category, Product } from '@/lib/types';

const PAGE_SIZE = 20;
const SORTS = [
  { key: 'date', label: 'Newest' },
  { key: 'price', label: 'Price' },
  { key: 'name', label: 'Name' },
];

export default function ListProducts() {
  const { backendURL, token, currency } = useAdmin();
  const [list, setList] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchList = async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE), sortBy });
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      const response = await axios.get(backendURL + '/api/product/list?' + params.toString());
      if (response.data.success) {
        setList(response.data.products);
        setPages(response.data.pages || 1);
        setTotal(response.data.total ?? response.data.products.length);
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, category, sortBy]);

  useEffect(() => setPage(1), [search, category, sortBy]);

  useEffect(() => {
    axios.get(backendURL + '/api/category/list').then((response) => {
      if (response.data.success) setCategories(response.data.categories);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeProduct = async (id: string) => {
    try {
      const response = await axios.post(backendURL + '/api/product/remove', { id }, { headers: { token } });
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <div style={{ padding: '26px 24px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 18 }}>
        <input className="input" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 260 }} />
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
        </select>
        <div className="seg">
          {SORTS.map((s) => (
            <label key={s.key} className={`seg-opt ${sortBy === s.key ? 'on' : ''}`}>
              <input type="radio" checked={sortBy === s.key} onChange={() => setSortBy(s.key)} style={{ display: 'none' }} />
              {s.label}
            </label>
          ))}
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th style={{ textAlign: 'right' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {list.map((item) => (
            <tr key={item._id}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="plate" style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', flex: 'none' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image?.[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <span>{item.name}</span>
                </div>
              </td>
              <td style={{ color: 'var(--color-neutral-400)' }}>{item.category}</td>
              <td>{currency}{item.price}</td>
              <td>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {item.variants.length === 0 && <span className="tag tag-neutral">No variants</span>}
                  {item.variants.map((v) => (
                    <span key={v.value} className={v.stock > 0 ? 'tag tag-accent' : 'tag tag-neutral'}>
                      {v.value}:{v.stock}
                    </span>
                  ))}
                </div>
              </td>
              <td style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <Link href={`/edit/${item._id}`} className="btn btn-icon btn-ghost" title="Edit">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 20h4L18.5 9.5a1.5 1.5 0 0 0-4-4L4 16v4Z" /></svg>
                  </Link>
                  <button type="button" className="btn btn-icon btn-ghost" onClick={() => removeProduct(item._id)} title="Remove">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M7 7l10 10M17 7 7 17" /></svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {list.length === 0 && <p className="text-muted" style={{ marginTop: 20 }}>No products match these filters.</p>}

      {pages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18 }}>
          <button type="button" className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
          <span style={{ fontSize: 13, color: 'var(--color-neutral-500)' }}>Page {page} of {pages} · {total} products</span>
          <button type="button" className="btn btn-secondary" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
