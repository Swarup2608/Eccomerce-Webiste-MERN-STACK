'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAdmin } from '@/context/useAdmin';
import type { Category, Product, ProductVariant, SubCategory } from '@/lib/types';

export interface ProductFormValues {
  name: string;
  description: string;
  price: string;
  category: string;
  subCategory: string;
  bestSeller: boolean;
  variants: ProductVariant[];
}

const DEFAULT_VALUES: ProductFormValues = {
  name: '',
  description: 'A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.',
  price: '',
  category: '',
  subCategory: '',
  bestSeller: false,
  variants: [],
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
          variants: initial.variants,
        }
      : DEFAULT_VALUES
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axios.get(backendURL + '/api/category/list').then((response) => {
      if (response.data.success) {
        setCategories(response.data.categories);
        if (!values.category && response.data.categories.length) {
          const first: Category = response.data.categories[0];
          const firstSub: SubCategory | undefined = first.subCategories[0];
          setValues((v) => ({ ...v, category: first.name, subCategory: firstSub?.name || '' }));
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedCategory = categories.find((c) => c.name === values.category);
  const subCategoryOptions = selectedCategory?.subCategories || [];
  const selectedSubCategory = subCategoryOptions.find((sc) => sc.name === values.subCategory);
  // Falls back to a generic "Options" filter for a sub-category the admin
  // hasn't loaded yet (e.g. editing a product whose category was removed).
  const filterLabel = selectedSubCategory?.filterLabel || 'Options';
  const filterOptions = selectedSubCategory?.filterOptions || [];

  const onCategoryChange = (categoryName: string) => {
    const cat = categories.find((c) => c.name === categoryName);
    const firstSub = cat?.subCategories[0];
    setValues((v) => ({ ...v, category: categoryName, subCategory: firstSub?.name || '', variants: [] }));
  };

  const onSubCategoryChange = (subCategoryName: string) => {
    // Variant values are only meaningful within one filter definition, so
    // switching sub-category (and therefore filter) clears prior picks.
    setValues((v) => ({ ...v, subCategory: subCategoryName, variants: [] }));
  };

  const toggleVariant = (value: string) => {
    setValues((v) => ({
      ...v,
      variants: v.variants.some((x) => x.value === value)
        ? v.variants.filter((x) => x.value !== value)
        : [...v.variants, { value, stock: 0 }],
    }));
  };

  const setStock = (value: string, stock: number) => {
    setValues((v) => ({
      ...v,
      variants: v.variants.map((x) => (x.value === value ? { ...x, stock: Math.max(0, stock) } : x)),
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
      formData.append('variants', JSON.stringify(values.variants));
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
        <div className="form-grid-collapse" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          <div className="field">
            <label>Category</label>
            <select className="input" value={values.category} onChange={(e) => onCategoryChange(e.target.value)}>
              {categories.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Sub-category</label>
            <select className="input" value={values.subCategory} onChange={(e) => onSubCategoryChange(e.target.value)}>
              {subCategoryOptions.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Price (USD)</label>
            <input className="input" type="number" value={values.price} onChange={(e) => setValues((v) => ({ ...v, price: e.target.value }))} placeholder="148" required />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 70%,transparent)', marginBottom: 7 }}>
            {filterLabel}
          </div>
          {filterOptions.length === 0 ? (
            <p style={{ fontSize: 12.5, color: 'var(--color-neutral-500)' }}>
              Pick a category and sub-category to see its {filterLabel.toLowerCase()} options.
            </p>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                {filterOptions.map((opt) => {
                  const active = values.variants.some((x) => x.value === opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleVariant(opt)}
                      className="btn"
                      style={{ border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-divider)'}`, color: active ? 'var(--color-accent)' : 'var(--color-text)' }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {values.variants.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {values.variants.map((x) => (
                    <div key={x.value} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ minWidth: 90, fontSize: 13 }}>{x.value}</span>
                      <input
                        className="input"
                        type="number"
                        min={0}
                        value={x.stock}
                        onChange={(e) => setStock(x.value, Number(e.target.value))}
                        style={{ maxWidth: 110 }}
                        aria-label={`Stock for ${filterLabel} ${x.value}`}
                      />
                      <span style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>in stock</span>
                    </div>
                  ))}
                </div>
              )}
            </>
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
          <button type="submit" className="btn btn-primary" style={{ padding: '11px 18px' }} disabled={submitting || values.variants.length === 0}>
            {submitting ? 'Saving…' : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
