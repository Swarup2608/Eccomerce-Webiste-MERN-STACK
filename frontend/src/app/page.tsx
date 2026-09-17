'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useShop } from '@/context/useShop';
import ProductCard from '@/components/ProductCard';
import Reveal from '@/components/Reveal';
import AmbientGrid from '@/components/AmbientGrid';
import HeroCarousel from '@/components/HeroCarousel';
import Marquee from '@/components/Marquee';
import { useTilt } from '@/hooks/useTilt';

const PROMISES = [
  { t: 'Repair-rated', d: 'Every listing carries a repairability score and the parts to back it up.' },
  { t: 'Carbon-labelled', d: 'We publish the footprint of making and shipping each item, not just the price.' },
  { t: 'Maker-audited', d: 'We visit the workshop before we list the product. No exceptions.' },
];

function CategoryCard({ label, count, mark }: { label: string; count: number; mark: string }) {
  const { ref, onMouseMove, onMouseLeave } = useTilt();
  return (
    <Reveal>
      <Link
        href={`/collections?category=${label}`}
        ref={ref as any}
        data-tilt=""
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="card"
        style={{ display: 'block', textAlign: 'left', color: 'var(--color-text)' }}
      >
        <div className="plate" style={{ aspectRatio: '4 / 3' }}>
          <span style={{ font: '500 84px/1 Inter', color: 'color-mix(in srgb,var(--color-neutral-100) 8%,transparent)' }}>{mark}</span>
        </div>
        <div style={{ padding: '14px 16px 16px' }}>
          <div style={{ font: '500 17px/1.2 Inter' }}>{label}</div>
          <div style={{ fontSize: 12, color: 'var(--color-neutral-500)', marginTop: 4 }}>{count} items</div>
        </div>
      </Link>
    </Reveal>
  );
}

export default function Home() {
  const { products, categories } = useShop();

  const featured = useMemo(() => {
    const bestSellers = products.filter((p) => p.bestSeller);
    return (bestSellers.length ? bestSellers : products).slice(0, 8);
  }, [products]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of products) counts[p.category] = (counts[p.category] || 0) + 1;
    return counts;
  }, [products]);

  return (
    <main>
      <section style={{ position: 'relative', overflow: 'hidden', padding: '78px 26px 64px' }}>
        <AmbientGrid />
        <div className="container" style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'minmax(0,1.05fr) minmax(0,1fr)', gap: 44, alignItems: 'center' }}>
          <div className="reveal">
            <div className="tag tag-outline" style={{ marginBottom: 18, whiteSpace: 'nowrap' }}>1,200+ audited makers</div>
            <h1 style={{ fontSize: 60, lineHeight: 1.02, letterSpacing: '-.03em', margin: '0 0 18px', maxWidth: '15ch' }}>
              Buy less. Buy things that stay.
            </h1>
            <p style={{ fontSize: 17, maxWidth: '46ch', color: 'var(--color-neutral-300)', marginBottom: 26 }}>
              EcoCart is a marketplace for apparel, home goods, skincare, electronics and print — every listing carries its materials, repairability and footprint on the label.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link href="/collections" className="btn btn-primary" style={{ padding: '11px 18px', fontSize: 15 }}>Shop all collections</Link>
              <Link href="/about" className="btn btn-secondary" style={{ padding: '11px 18px', fontSize: 15 }}>How we vet makers</Link>
            </div>
            <div style={{ display: 'flex', gap: 34, marginTop: 38, flexWrap: 'wrap' }}>
              {[['1,200+', 'audited makers'], ['9.1 / 10', 'avg. repair rating'], ['60 days', 'return window']].map(([n, l]) => (
                <div key={l}>
                  <div style={{ font: '500 26px/1 Inter', letterSpacing: '-.02em', color: 'var(--color-accent-300)' }}>{n}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-neutral-500)', marginTop: 5 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <HeroCarousel products={products} />
        </div>
      </section>

      <Marquee />

      <section className="container" style={{ padding: '70px 0 20px' }}>
        <Reveal>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 26, flexWrap: 'wrap' }}>
            <div>
              <h6 style={{ color: 'var(--color-accent-300)', marginBottom: 10 }}>Categories</h6>
              <h2 style={{ letterSpacing: '-.025em', margin: 0 }}>Every shelf, one standard</h2>
            </div>
            <Link href="/collections" className="btn btn-ghost">Browse everything →</Link>
          </div>
        </Reveal>
        <div className="grid-auto-fit">
          {categories.map((c) => (
            <CategoryCard key={c._id} label={c.name} count={categoryCounts[c.name] || 0} mark={c.name[0]} />
          ))}
        </div>
      </section>

      <section className="container" style={{ padding: '20px 0 80px' }}>
        <Reveal>
          <div style={{ marginBottom: 26 }}>
            <h6 style={{ color: 'var(--color-accent-300)', marginBottom: 10 }}>Best sellers</h6>
            <h2 style={{ letterSpacing: '-.025em', margin: 0 }}>Repaired more often than replaced</h2>
          </div>
        </Reveal>
        <div className="grid-auto-fill">
          {featured.length === 0
            ? <p className="text-muted">No products available yet.</p>
            : featured.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>

      <section className="container" style={{ padding: '0 0 90px' }}>
        <Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 1, background: 'var(--color-divider)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            {PROMISES.map((pr) => (
              <div key={pr.t} style={{ background: 'var(--color-bg)', padding: '26px 24px' }}>
                <div style={{ width: 34, height: 34, border: '1px solid var(--color-accent)', borderRadius: 9, display: 'grid', placeItems: 'center', color: 'var(--color-accent)', marginBottom: 14 }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="m5 12.5 4.5 4.5L19 7" /></svg>
                </div>
                <div style={{ font: '500 17px/1.2 Inter', marginBottom: 7 }}>{pr.t}</div>
                <p style={{ fontSize: 13, color: 'var(--color-neutral-400)', margin: 0 }}>{pr.d}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>
    </main>
  );
}
