'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAdmin } from '@/context/useAdmin';
import type { Product } from '@/lib/types';

export default function ListProducts() {
  const { backendURL, token, currency } = useAdmin();
  const [list, setList] = useState<Product[]>([]);

  const fetchList = async () => {
    try {
      const response = await axios.get(backendURL + '/api/product/list');
      if (response.data.success) setList(response.data.products);
      else toast.error(response.data.message);
    } catch (error: any) {
      console.log(error);
      toast.error(error.message);
    }
  };

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

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: '26px 24px' }}>
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
              <td><span className={item.sizes.length ? 'tag tag-accent' : 'tag tag-neutral'}>{item.sizes.length ? 'In stock' : 'Out of stock'}</span></td>
              <td style={{ textAlign: 'right' }}>
                <button type="button" className="btn btn-icon btn-ghost" onClick={() => removeProduct(item._id)} title="Remove">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M7 7l10 10M17 7 7 17" /></svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {list.length === 0 && <p className="text-muted" style={{ marginTop: 20 }}>No products yet.</p>}
    </div>
  );
}
