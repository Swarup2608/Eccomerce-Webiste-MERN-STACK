'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAdmin } from '@/context/useAdmin';
import type { Category } from '@/lib/types';

// Draft shape while editing — filterOptions stays a free-typed comma string
// until submit, so the admin isn't fighting array state mid-keystroke.
interface SubCategoryDraft {
  name: string;
  filterLabel: string;
  filterOptionsText: string;
}

const blankSubCategory = (): SubCategoryDraft => ({ name: '', filterLabel: '', filterOptionsText: '' });

export default function Categories() {
  const { backendURL, token } = useAdmin();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [subCategories, setSubCategories] = useState<SubCategoryDraft[]>([blankSubCategory()]);
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
    setSubCategories([blankSubCategory()]);
    setEditingId(null);
  };

  const startEdit = (c: Category) => {
    setEditingId(c._id);
    setName(c.name);
    setSubCategories(
      c.subCategories.length
        ? c.subCategories.map((sc) => ({ name: sc.name, filterLabel: sc.filterLabel, filterOptionsText: sc.filterOptions.join(', ') }))
        : [blankSubCategory()]
    );
  };

  const updateSubCategory = (index: number, patch: Partial<SubCategoryDraft>) => {
    setSubCategories((prev) => prev.map((sc, i) => (i === index ? { ...sc, ...patch } : sc)));
  };

  const addSubCategoryRow = () => setSubCategories((prev) => [...prev, blankSubCategory()]);
  const removeSubCategoryRow = (index: number) => setSubCategories((prev) => prev.filter((_, i) => i !== index));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = subCategories
      .filter((sc) => sc.name.trim())
      .map((sc) => ({
        name: sc.name.trim(),
        filterLabel: sc.filterLabel.trim(),
        filterOptions: sc.filterOptionsText.split(',').map((o) => o.trim()).filter(Boolean),
      }));
    try {
      const response = editingId
        ? await axios.post(backendURL + '/api/category/update', { id: editingId, name, subCategories: payload }, { headers: { token } })
        : await axios.post(backendURL + '/api/category/add', { name, subCategories: payload }, { headers: { token } });
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
    <div style={{ padding: '26px 24px', maxWidth: 920 }}>
      <form onSubmit={onSubmit} className="card" style={{ padding: 20, display: 'grid', gap: 14, marginBottom: 24 }}>
        <div style={{ font: '500 11px/1 Inter', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-500)' }}>
          {editingId ? 'Edit category' : 'New category'}
        </div>
        <div className="field">
          <label>Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Accessories" required />
        </div>

        <div>
          <div style={{ font: '500 11px/1 Inter', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: 10 }}>
            Sub-categories &amp; filters
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--color-neutral-500)', margin: '0 0 12px' }}>
            Each sub-category needs its own filter — what shoppers can narrow products down by. E.g. Belts → filter
            &quot;Material&quot; → options &quot;Leather, Woolen, Canvas&quot;. Topwear → filter &quot;Size&quot; → options &quot;S, M, L, XL, XXL&quot;.
          </p>
          <div style={{ display: 'grid', gap: 10 }}>
            {subCategories.map((sc, i) => (
              <div key={i} className="card subcat-row-grid" style={{ padding: 14, display: 'grid', gridTemplateColumns: '1fr 1fr 1.6fr auto', gap: 10, alignItems: 'end' }}>
                <div className="field">
                  <label>Sub-category name</label>
                  <input className="input" value={sc.name} onChange={(e) => updateSubCategory(i, { name: e.target.value })} placeholder="Belts" />
                </div>
                <div className="field">
                  <label>Filter label</label>
                  <input className="input" value={sc.filterLabel} onChange={(e) => updateSubCategory(i, { filterLabel: e.target.value })} placeholder="Material" />
                </div>
                <div className="field">
                  <label>Filter options (comma separated)</label>
                  <input className="input" value={sc.filterOptionsText} onChange={(e) => updateSubCategory(i, { filterOptionsText: e.target.value })} placeholder="Leather, Woolen, Canvas" />
                </div>
                <button
                  type="button"
                  className="btn btn-icon btn-ghost"
                  onClick={() => removeSubCategoryRow(i)}
                  title="Remove sub-category"
                  disabled={subCategories.length === 1}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M7 7l10 10M17 7 7 17" /></svg>
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-ghost" style={{ marginTop: 10 }} onClick={addSubCategoryRow}>+ Add sub-category</button>
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

      <div className="table-scroll">
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
              <td style={{ color: 'var(--color-neutral-400)' }}>
                {c.subCategories.length === 0
                  ? '—'
                  : c.subCategories.map((sc) => `${sc.name} (${sc.filterLabel}: ${sc.filterOptions.join('/')})`).join(', ')}
              </td>
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
      </div>
      {categories.length === 0 && <p className="text-muted" style={{ marginTop: 20 }}>No categories yet.</p>}
    </div>
  );
}
