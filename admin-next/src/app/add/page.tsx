'use client';

import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAdmin } from '@/context/useAdmin';

const CATEGORIES = ['Men', 'Women', 'Kids'];
const SUBCATEGORIES = ['Topwear', 'Bottomwear', 'Winterwear'];
const ALL_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export default function AddProduct() {
  const { backendURL, token } = useAdmin();
  const [images, setImages] = useState<(File | null)[]>([null, null, null, null]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState(
    'A lightweight, usually knitted, pullover shirt, close-fitting and with a round neckline and short sleeves, worn as an undershirt or outer garment.'
  );
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Men');
  const [subCategory, setSubCategory] = useState('Topwear');
  const [bestSeller, setBestSeller] = useState(false);
  const [sizes, setSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);

  const toggleSize = (s: string) => {
    setSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const setImageAt = (i: number, file: File | null) => {
    setImages((prev) => {
      const next = prev.slice();
      next[i] = file;
      return next;
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('subCategory', subCategory);
      formData.append('sizes', JSON.stringify(sizes));
      formData.append('bestSeller', String(bestSeller));
      images.forEach((img, i) => { if (img) formData.append(`image${i + 1}`, img); });

      const response = await axios.post(backendURL + '/api/product/add', formData, { headers: { token } });
      if (response.data.success) {
        toast.success(response.data.message);
        setName('');
        setPrice('');
        setSizes(['S', 'M', 'L', 'XL']);
        setBestSeller(false);
        setImages([null, null, null, null]);
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ padding: '26px 24px', maxWidth: 820 }}>
      <div style={{ font: '500 11px/1 Inter', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: 12 }}>
        Product images
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 26 }}>
        {images.map((img, i) => (
          <label key={i} className="upload-slot">
            {img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={URL.createObjectURL(img)} alt="" />
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 6v12M6 12h12" /></svg>
                <span style={{ fontSize: 11 }}>Image {i + 1}</span>
              </>
            )}
            <input type="file" accept="image/*" hidden onChange={(e) => setImageAt(i, e.target.files?.[0] || null)} />
          </label>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        <div className="field">
          <label>Product name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Kōra Merino Overshirt" required />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Materials, construction, repair notes." required />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          <div className="field">
            <label>Category</label>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Sub-category</label>
            <select className="input" value={subCategory} onChange={(e) => setSubCategory(e.target.value)}>
              {SUBCATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Price (USD)</label>
            <input className="input" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="148" required />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'color-mix(in srgb,var(--color-text) 70%,transparent)', marginBottom: 7 }}>Sizes</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {ALL_SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSize(s)}
                className="btn"
                style={{ border: `1px solid ${sizes.includes(s) ? 'var(--color-accent)' : 'var(--color-divider)'}`, color: sizes.includes(s) ? 'var(--color-accent)' : 'var(--color-text)' }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}>
          <span className={`check ${bestSeller ? 'on' : ''}`}>
            {bestSeller && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12.5 4.5 4.5L19 7" /></svg>}
          </span>
          <input type="checkbox" checked={bestSeller} onChange={() => setBestSeller((v) => !v)} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
          Feature on the home page
        </label>
        <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '11px 18px' }}>Add product</button>
        </div>
      </div>
    </form>
  );
}
