'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Product } from '@/lib/types';
import ProductThumb from './ProductThumb';

export default function HeroCarousel({ products }: { products: Product[] }) {
  const slides = useMemo(() => {
    if (products.length >= 3) return products.slice(0, 3);
    if (products.length > 0) return [products[0], products[0], products[0]];
    return [null, null, null];
  }, [products]);

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 4500);
    return () => clearInterval(id);
  }, [slides.length]);

  const offsetStyle = (offset: number): React.CSSProperties => {
    if (offset === 0) {
      return { transform: 'translate(0,0) scale(1)', opacity: 1, zIndex: 3 };
    }
    if (offset === 1) {
      return { transform: 'translate(20px,16px) scale(0.94)', opacity: 0.55, zIndex: 2 };
    }
    return { transform: 'translate(40px,32px) scale(0.88)', opacity: 0.3, zIndex: 1 };
  };

  return (
    <div style={{ perspective: 1200 }}>
      <div style={{ position: 'relative', height: 420 }}>
        {slides.map((p, i) => {
          const offset = (i - current + slides.length) % slides.length;
          return (
            <div
              key={i}
              className="card"
              style={{
                position: 'absolute', inset: 0,
                transition: 'transform .6s cubic-bezier(.22,1,.36,1), opacity .6s ease',
                ...offsetStyle(offset),
              }}
            >
              <ProductThumb image={p?.image?.[0]} name={p?.name || 'EcoCart'} aspect="16 / 10" />
              <div style={{ padding: '18px 20px 20px' }}>
                <div className="card-kicker" style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
                  {p?.category || 'Featured'}
                </div>
                <div style={{ font: '500 22px/1.15 Inter', letterSpacing: '-.02em', margin: '6px 0 4px' }}>
                  {p?.name || 'A shelf worth trusting'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-neutral-400)' }}>{p?.subCategory || 'Curated by EcoCart'}</div>
              </div>
            </div>
          );
        })}

        <div style={{ position: 'absolute', bottom: -34, left: 0, display: 'flex', gap: 7, zIndex: 5 }}>
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: i === current ? 22 : 7, height: 7, borderRadius: 4, border: 0, cursor: 'pointer',
                background: i === current ? 'var(--color-accent)' : 'var(--color-divider)',
                transition: 'width .3s ease, background .3s ease',
              }}
            />
          ))}
        </div>
        <button
          type="button"
          className="btn btn-icon btn-secondary"
          onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)}
          style={{ position: 'absolute', bottom: -42, right: 44, zIndex: 5, background: 'var(--color-surface)' }}
          aria-label="Previous slide"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M14.5 5.5 8 12l6.5 6.5" /></svg>
        </button>
        <button
          type="button"
          className="btn btn-icon btn-secondary"
          onClick={() => setCurrent((c) => (c + 1) % slides.length)}
          style={{ position: 'absolute', bottom: -42, right: 0, zIndex: 5, background: 'var(--color-surface)' }}
          aria-label="Next slide"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M9.5 5.5 16 12l-6.5 6.5" /></svg>
        </button>
      </div>
    </div>
  );
}
