'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAdmin } from '@/context/useAdmin';
import type { Category, Product, ProductSize } from '@/lib/types';

const ALL_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export interface ProductFormValues {
  name: string;
  description: string;
  price: string;
  category: string;
  subCategory: string;
  bestSeller: boolean;
  sizes: ProductSize[];
}

const DEFAULT_VALUES: ProductFormValues = {
  name: '',
  description: 'A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.',
  price: '',
  category: '',
  subCategory: '',
  bestSeller: false,
  sizes: [
    { size: 'S', stock: 0 },
    { size: 'M', stock: 0 },
    { size: 'L', stock: 0 },
    { size: 'XL', stock: 0 },
  ],
};

export default function ProductForm({
  mode,
  initial,
  existingImages,
  submitLabel,
  onSubmit,
}: {
  mode: 'add' | 'edit';
  initial?: Product;
  existingImages?: string[];
  submitLabel: string;
  onSubmit: (formData: FormData) => Promise<void>;
}) {
  const { backendURL } = useAdmin();
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<(File | null)[]>([null, null, null, null]);
  const [values, setValues] = useState<ProductFormValues>(
    initial
      ? {
          name: initial.name,
          description: initial.description,
          price: String(initial.price),
          category: initial.category,
          subCategory: initial.subCategory,
          bestSeller: !!initial.bestSeller,
          sizes: initial.sizes,
        }
      : DEFAULT_VALUES
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axios.get(backendURL + '/api/category/list').then((response) => {
      if (response.data.success) {
        setCategories(response.data.categories);
        if (!values.category && response.data.categories.length) {
          const first = response.data.categories[0];
          setValues((v) => ({ ...v, category: first.name, subCategory: first.subCategories[0] || '' }));
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedCategory = categories.find((c) => c.name === values.category);
  const subCategoryOptions = selectedCategory?.subCategories || (values.subCategory ? [values.subCategory] : []);

  const toggleSize = (s: string) => {
    setValues((v) => ({
      ...v,
      sizes: v.sizes.some((x) => x.size === s)
        ? v.sizes.filter((x) => x.size !== s)
        : [...v.sizes, { size: s, stock: 0 }],
    }));
  };

  const setStock = (s: string, stock: number) => {
    setValues((v) => ({
      ...v,
      sizes: v.sizes.map((x) => (x.size === s ? { ...x, stock: Math.max(0, stock) } : x)),
    }));
  };

  const setImageAt = (i: number, file: File | null) => {
    setImages((prev) => {
      const next = prev.slice();
      next[i] = file;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('description', values.description);
      formData.append('price', values.price);
      formData.append('category', values.category);
      formData.append('subCategory', values.subCategory);
      formData.append('sizes', JSON.stringify(values.sizes));
      formData.append('bestSeller', String(values.bestSeller));
      images.forEach((img, i) => { if (img) formData.append(`image${i + 1}`, img); });
      await onSubmit(formData);
      if (mode === 'add') {
        setValues(DEFAULT_VALUES);
        setImages([null, null, null, null]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '26px 24px', maxWidth: 820 }}>
      <div style={{ font: '500 11px/1 Inter', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: 12 }}>
        Product images
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 26 }}>
        {images.map((img, i) => {
          const preview = img ? URL.createObjectURL(img) : existingImages?.[i];
          return (
            <label key={i} className="upload-slot">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="" />
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 6v12M6 12h12" /></svg>
                  <span style={{ fontSize: 11 }}>Image {i + 1}</span>
                </>
              )}
              <input type="file" accept="image/*" hidden onChange={(e) => setImageAt(i, e.target.files?.[0] || null)} />
            </label>
          );
        })}
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        <div className="field">
          <label>Product name</label>
          <input className="input" value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} placeholder="Kōra Merino Overshirt" required />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea className="input" value={values.description} onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))} placeholder="Materials, construction, repair notes." required />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          <div className="field">
            <label>Category</label>
            <select
              className="input"
              value={values.category}
              onChange={(e) => {
                const cat = categories.find((c) => c.name === e.target.value);
                setValues((v) => ({ ...v, category: e.target.value, subCategory: cat?.subCategories[0] || '' }));
              }}
            >
              {categories.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Sub-category</label>
            <select className="input" value={values.subCategory} onChange={(e) => setValues((v) => ({ ...v, subCategory: e.target.value }))}>
              {subCategoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Price (USD)</label>
            <input className="input" type="number" value={values.price} onChange={(e) => setValues((v) => ({ ...v, price: e.target.value }))} placeholder="148" required />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 70%,transparent)', marginBottom: 7 }}>Sizes</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {ALL_SIZES.map((s) => {
              const active = values.sizes.some((x) => x.size === s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSize(s)}
                  className="btn"
                  style={{ border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-divider)'}`, color: active ? 'var(--color-accent)' : 'var(--color-text)' }}
                >
                  {s}
                </button>
              );
            })}
          </div>
          {values.sizes.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {values.sizes.map((s) => (
                <div key={s.size} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ minWidth: 36, fontSize: 13 }}>{s.size}</span>
                  <input
                    className="input"
                    type="number"
                    min={0}
                    value={s.stock}
                    onChange={(e) => setStock(s.size, Number(e.target.value))}
                    style={{ maxWidth: 110 }}
                    aria-label={`Stock for size ${s.size}`}
                  />
                  <span style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>in stock</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}>
          <span className={`check ${values.bestSeller ? 'on' : ''}`}>
            {values.bestSeller && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12.5 4.5 4.5L19 7" /></svg>}
          </span>
          <input type="checkbox" checked={values.bestSeller} onChange={() => setValues((v) => ({ ...v, bestSeller: !v.bestSeller }))} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
          Feature on the home page
        </label>
        <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '11px 18px' }} disabled={submitting}>
            {submitting ? 'Saving…' : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
