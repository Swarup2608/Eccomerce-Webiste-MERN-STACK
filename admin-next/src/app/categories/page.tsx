'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAdmin } from '@/context/useAdmin';
import type { Category } from '@/lib/types';

export default function Categories() {
  const { backendURL, token } = useAdmin();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [subCategoriesText, setSubCategoriesText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const response = await axios.post(backendURL + '/api/category/admin-list', {}, { headers: { token } });
      if (response.data.success) setCategories(response.data.categories);
      else toast.error(response.data.message);
    } catch (error: any) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const resetForm = () => {
    setName('');
    setSubCategoriesText('');
    setEditingId(null);
  };

  const startEdit = (c: Category) => {
    setEditingId(c._id);
    setName(c.name);
    setSubCategoriesText(c.subCategories.join(', '));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const subCategories = subCategoriesText.split(',').map((s) => s.trim()).filter(Boolean);
    try {
      const response = editingId
        ? await axios.post(backendURL + '/api/category/update', { id: editingId, name, subCategories }, { headers: { token } })
        : await axios.post(backendURL + '/api/category/add', { name, subCategories }, { headers: { token } });
      if (response.data.success) {
        toast.success(response.data.message);
        resetForm();
        fetchCategories();
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const toggleActive = async (c: Category) => {
    try {
      const response = await axios.post(backendURL + '/api/category/update', { id: c._id, active: !c.active }, { headers: { token } });
      if (response.data.success) {
        fetchCategories();
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const removeCategory = async (id: string) => {
    try {
      const response = await axios.post(backendURL + '/api/category/remove', { id }, { headers: { token } });
      if (response.data.success) {
        toast.success(response.data.message);
        fetchCategories();
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div style={{ padding: '26px 24px', maxWidth: 820 }}>
      <form onSubmit={onSubmit} className="card" style={{ padding: 20, display: 'grid', gap: 14, marginBottom: 24 }}>
        <div style={{ font: '500 11px/1 Inter', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-500)' }}>
          {editingId ? 'Edit category' : 'New category'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 }}>
          <div className="field">
            <label>Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Accessories" required />
          </div>
          <div className="field">
            <label>Sub-categories (comma separated)</label>
            <input className="input" value={subCategoriesText} onChange={(e) => setSubCategoriesText(e.target.value)} placeholder="Bags, Belts, Jewellery" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 18px' }}>
            {editingId ? 'Save changes' : 'Add category'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>
          )}
        </div>
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Sub-categories</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c._id}>
              <td>{c.name}</td>
              <td style={{ color: 'var(--color-neutral-400)' }}>{c.subCategories.join(', ') || '—'}</td>
              <td>
                <span className={c.active ? 'tag tag-accent' : 'tag tag-neutral'}>{c.active ? 'Active' : 'Inactive'}</span>
              </td>
              <td style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => toggleActive(c)}>
                    {c.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button type="button" className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => startEdit(c)}>Edit</button>
                  <button type="button" className="btn btn-icon btn-ghost" onClick={() => removeCategory(c._id)} title="Remove">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M7 7l10 10M17 7 7 17" /></svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {categories.length === 0 && <p className="text-muted" style={{ marginTop: 20 }}>No categories yet.</p>}
    </div>
  );
}
