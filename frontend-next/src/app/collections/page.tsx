'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useShop } from '@/context/useShop';
import ProductCard from '@/components/ProductCard';

const CATEGORIES = ['Men', 'Women', 'Kids'];
const SUBCATEGORIES = ['Topwear', 'Bottomwear', 'Winterwear'];
const SORTS = [
  { key: 'relevant', label: 'Relevant' },
  { key: 'low-high', label: 'Price: low to high' },
  { key: 'high-low', label: 'Price: high to low' },
];

function CollectionsInner() {
  const { products, search, setSearch } = useShop();
  const params = useSearchParams();
  const [category, setCategory] = useState<string[]>([]);
  const [subCategory, setSubCategory] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortType, setSortType] = useState('relevant');

  useEffect(() => {
    const fromUrl = params.get('category');
    if (fromUrl) setCategory([fromUrl]);
  }, [params]);

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const shown = useMemo(() => {
    let out = products.slice();
    if (search) out = out.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (category.length) out = out.filter((p) => category.includes(p.category));
    if (subCategory.length) out = out.filter((p) => subCategory.includes(p.subCategory));
    if (inStockOnly) out = out.filter((p) => p.sizes.length > 0);
    if (sortType === 'low-high') out.sort((a, b) => a.price - b.price);
    if (sortType === 'high-low') out.sort((a, b) => b.price - a.price);
    return out;
  }, [products, search, category, subCategory, inStockOnly, sortType]);

  const clearFilters = () => {
    setCategory([]);
    setSubCategory([]);
    setInStockOnly(false);
    setSearch('');
  };

  return (
    <main className="container" style={{ padding: '44px 26px 80px' }}>
      <div style={{ marginBottom: 30 }}>
        <h6 style={{ color: 'var(--color-accent-300)', marginBottom: 10 }}>Collection</h6>
        <h2 style={{ letterSpacing: '-.025em', margin: '0 0 6px' }}>All products</h2>
        <p style={{ fontSize: 14, color: 'var(--color-neutral-500)', margin: 0 }}>{shown.length} results</p>
      </div>
      <div className="collections-grid" style={{ display: 'grid', gridTemplateColumns: '222px minmax(0,1fr)', gap: 34, alignItems: 'start' }}>
        <aside>
          <div style={{ font: '500 11px/1 Inter', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: 12 }}>
            Category
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24 }}>
            {CATEGORIES.map((c) => (
              <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, cursor: 'pointer' }}>
                <span className={`check ${category.includes(c) ? 'on' : ''}`}>
                  {category.includes(c) && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12.5 4.5 4.5L19 7" /></svg>
                  )}
                </span>
                <input type="checkbox" checked={category.includes(c)} onChange={() => toggle(category, setCategory, c)} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
                <span>{c}</span>
              </label>
            ))}
          </div>
          <div className="hr" style={{ margin: '0 0 20px' }} />
          <div style={{ font: '500 11px/1 Inter', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: 12 }}>
            Type
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24 }}>
            {SUBCATEGORIES.map((s) => (
              <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, cursor: 'pointer' }}>
                <span className={`check ${subCategory.includes(s) ? 'on' : ''}`}>
                  {subCategory.includes(s) && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12.5 4.5 4.5L19 7" /></svg>
                  )}
                </span>
                <input type="checkbox" checked={subCategory.includes(s)} onChange={() => toggle(subCategory, setSubCategory, s)} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
                <span>{s}</span>
              </label>
            ))}
          </div>
          <div className="hr" style={{ margin: '0 0 20px' }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, cursor: 'pointer', marginBottom: 24 }}>
            <span className={`check ${inStockOnly ? 'on' : ''}`}>
              {inStockOnly && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12.5 4.5 4.5L19 7" /></svg>}
            </span>
            <input type="checkbox" checked={inStockOnly} onChange={() => setInStockOnly((v) => !v)} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
            <span>In stock only</span>
          </label>
          <button type="button" className="btn btn-ghost" onClick={clearFilters}>Clear all filters</button>
        </aside>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
            <div className="seg">
              {SORTS.map((s) => (
                <label key={s.key} className={`seg-opt ${sortType === s.key ? 'on' : ''}`} style={{ whiteSpace: 'nowrap' }}>
                  <input type="radio" name="sort" checked={sortType === s.key} onChange={() => setSortType(s.key)} style={{ display: 'none' }} />
                  {s.label}
                </label>
              ))}
            </div>
            {search && (
              <span className="tag tag-accent">
                “{search}” <button type="button" onClick={() => setSearch('')} style={{ background: 'none', border: 0, color: 'inherit', cursor: 'pointer', marginLeft: 6, padding: 0 }}>✕</button>
              </span>
            )}
          </div>

          {shown.length === 0 ? (
            <div className="card" style={{ padding: '80px 30px', textAlign: 'left' }}>
              <div style={{ font: '500 22px/1.2 Inter', marginBottom: 8 }}>Nothing matched that</div>
              <p style={{ fontSize: 14, color: 'var(--color-neutral-400)', maxWidth: '42ch' }}>
                Try a broader category, or clear the search and browse the shelves.
              </p>
              <button type="button" className="btn btn-primary" onClick={clearFilters}>Reset filters</button>
            </div>
          ) : (
            <div className="grid-auto-fill">
              {shown.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function Collections() {
  return (
    <Suspense fallback={null}>
      <CollectionsInner />
    </Suspense>
  );
}
