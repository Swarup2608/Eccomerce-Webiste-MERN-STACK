'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useShop } from '@/context/useShop';
import ProductCard from '@/components/ProductCard';

const SORTS = [
  { key: 'relevant', label: 'Relevant' },
  { key: 'low-high', label: 'Price: low to high' },
  { key: 'high-low', label: 'Price: high to low' },
];

function CollectionsInner() {
  const { products, categories, search, setSearch } = useShop();
  const params = useSearchParams();
  const [category, setCategory] = useState<string[]>([]);
  const [subCategory, setSubCategory] = useState<string[]>([]);
  // Keyed by filterKey (e.g. "size", "material", "color") so a value picked
  // under one filter (Size: M) never collides with the same-named value
  // under another (e.g. a "Black" colorway vs. some unrelated size label).
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string[]>>({});
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortType, setSortType] = useState('relevant');

  const categoryNames = useMemo(() => categories.map((c) => c.name), [categories]);

  // Sub-categories belonging to the categories currently checked (or all,
  // if none are) — so checking "Men" doesn't leave "Belts" sitting in the
  // Type list as an option that can never match anything.
  const subCategoriesInScope = useMemo(() => {
    const scoped = category.length ? categories.filter((c) => category.includes(c.name)) : categories;
    return scoped.flatMap((c) => c.subCategories);
  }, [categories, category]);

  const subCategoryOptions = useMemo(() => {
    const set = new Set<string>();
    subCategoriesInScope.forEach((sc) => set.add(sc.name));
    return Array.from(set);
  }, [subCategoriesInScope]);

  // The filter sections to render: one per distinct filterKey among the
  // sub-categories currently in scope (narrowed further by which Type
  // checkboxes are on), each with the union of its declared filter
  // options — Belts contributes a "Material" section, Topwear a "Size"
  // section, and so on, entirely driven by the category/sub-category
  // configuration rather than hardcoded field names.
  const facetGroups = useMemo(() => {
    const scoped = subCategory.length
      ? subCategoriesInScope.filter((sc) => subCategory.includes(sc.name))
      : subCategoriesInScope;
    const groups = new Map<string, { filterLabel: string; options: Set<string> }>();
    scoped.forEach((sc) => {
      const group = groups.get(sc.filterKey) || { filterLabel: sc.filterLabel, options: new Set<string>() };
      sc.filterOptions.forEach((o) => group.options.add(o));
      groups.set(sc.filterKey, group);
    });
    return Array.from(groups.entries()).map(([filterKey, g]) => ({
      filterKey,
      filterLabel: g.filterLabel,
      options: Array.from(g.options),
    }));
  }, [subCategoriesInScope, subCategory]);

  // Drop any picked variant value whose filter section has scrolled out of
  // scope (e.g. category changed from Accessories to Men), so leftover
  // state can't silently zero out the results with no visible way to see why.
  useEffect(() => {
    setSelectedVariants((prev) => {
      const validKeys = new Set(facetGroups.map((g) => g.filterKey));
      const next: Record<string, string[]> = {};
      let changed = false;
      for (const key of Object.keys(prev)) {
        if (validKeys.has(key)) next[key] = prev[key];
        else changed = true;
      }
      return changed ? next : prev;
    });
  }, [facetGroups]);

  useEffect(() => {
    const fromUrl = params.get('category');
    if (fromUrl) setCategory([fromUrl]);
  }, [params]);

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const toggleVariant = (filterKey: string, value: string) => {
    setSelectedVariants((prev) => {
      const current = prev[filterKey] || [];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      return { ...prev, [filterKey]: next };
    });
  };

  const activeFilterKeys = useMemo(
    () => Object.keys(selectedVariants).filter((k) => selectedVariants[k].length > 0),
    [selectedVariants]
  );

  const shown = useMemo(() => {
    let out = products.slice();
    if (search) out = out.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (category.length) out = out.filter((p) => category.includes(p.category));
    if (subCategory.length) out = out.filter((p) => subCategory.includes(p.subCategory));
    if (activeFilterKeys.length) {
      out = out.filter((p) =>
        activeFilterKeys.every(
          (key) => p.filterKey === key && p.variants.some((v) => selectedVariants[key].includes(v.value))
        )
      );
    }
    if (inStockOnly) out = out.filter((p) => p.variants.some((v) => v.stock > 0));
    if (sortType === 'low-high') out.sort((a, b) => a.price - b.price);
    if (sortType === 'high-low') out.sort((a, b) => b.price - a.price);
    return out;
  }, [products, search, category, subCategory, activeFilterKeys, selectedVariants, inStockOnly, sortType]);

  const clearFilters = () => {
    setCategory([]);
    setSubCategory([]);
    setSelectedVariants({});
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
            {categoryNames.map((c) => (
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
            {subCategoryOptions.map((s) => (
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

          {facetGroups.map((group) => (
            <div key={group.filterKey}>
              <div className="hr" style={{ margin: '0 0 20px' }} />
              <div style={{ font: '500 11px/1 Inter', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: 12 }}>
                {group.filterLabel}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24 }}>
                {group.options.map((opt) => {
                  const checked = (selectedVariants[group.filterKey] || []).includes(opt);
                  return (
                    <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, cursor: 'pointer' }}>
                      <span className={`check ${checked ? 'on' : ''}`}>
                        {checked && (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12.5 4.5 4.5L19 7" /></svg>
                        )}
                      </span>
                      <input type="checkbox" checked={checked} onChange={() => toggleVariant(group.filterKey, opt)} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

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
                &quot;{search}&quot; <button type="button" onClick={() => setSearch('')} style={{ background: 'none', border: 0, color: 'inherit', cursor: 'pointer', marginLeft: 6, padding: 0 }}>✕</button>
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
