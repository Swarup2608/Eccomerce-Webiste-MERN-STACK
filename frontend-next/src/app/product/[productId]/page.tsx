'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useShop } from '@/context/useShop';
import ProductCard from '@/components/ProductCard';
import { assets } from '@/lib/assets';
import { useTilt } from '@/hooks/useTilt';

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const { products, currency, addToCart } = useShop();
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');
  const [sizeError, setSizeError] = useState(false);
  const [qty, setQty] = useState(1);
  const { ref: tiltRef, onMouseMove, onMouseLeave } = useTilt(5);

  const product = useMemo(() => products.find((p) => p._id === productId), [products, productId]);

  useEffect(() => {
    if (product) setImage(product.image?.[0] || '');
  }, [product]);

  const related = useMemo(() => {
    if (!product) return [];
    return products.filter((p) => p._id !== product._id && p.category === product.category).slice(0, 4);
  }, [products, product]);

  if (!product) return <main className="container" style={{ padding: '80px 26px' }} />;

  const soldOut = product.sizes.every((s) => s.stock <= 0);

  const handleAdd = () => {
    if (!size) {
      setSizeError(true);
      return;
    }
    for (let i = 0; i < qty; i++) addToCart(product._id, size);
  };

  return (
    <main className="container" style={{ padding: '34px 26px 80px' }}>
      <div style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--color-neutral-500)', marginBottom: 24 }}>
        <Link href="/collections" style={{ color: 'var(--color-accent)', fontSize: 12 }}>Collections</Link>
        <span>/</span><span>{product.category}</span><span>/</span>
        <span style={{ color: 'var(--color-neutral-300)' }}>{product.name}</span>
      </div>

      <div className="product-detail-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,1fr)', gap: 46, alignItems: 'start' }}>
        <div>
          <div ref={tiltRef} data-tilt="" onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} className="plate" style={{ aspectRatio: '1 / 1' }}>
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ font: '500 15px/1 Inter', color: 'var(--color-neutral-600)' }}>{product.name}</span>
            )}
          </div>
          {product.image?.length > 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginTop: 10 }}>
              {product.image.map((im, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setImage(im)}
                  className="plate"
                  style={{ aspectRatio: '1 / 1', border: im === image ? '1.5px solid var(--color-accent)' : '1px solid transparent', padding: 0, cursor: 'pointer' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={im} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span className="tag tag-outline">{product.category}</span>
            {soldOut && <span className="tag tag-neutral">Out of stock</span>}
          </div>
          <h2 style={{ fontSize: 32, letterSpacing: '-.03em', margin: '0 0 10px' }}>{product.name}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{ display: 'flex', gap: 2, color: 'var(--color-accent)' }}>
              {[0, 1, 2, 3, 4].map((i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={i < 4 ? assets.starIcon : assets.starDullIcon} style={{ width: 14, height: 14 }} alt="" />
              ))}
            </div>
            <span style={{ fontSize: 13, color: 'var(--color-neutral-500)' }}>122 reviews</span>
          </div>
          <div style={{ font: '500 30px/1 Inter', letterSpacing: '-.02em', marginBottom: 16 }}>{currency}{product.price}</div>
          <p style={{ fontSize: 14, color: 'var(--color-neutral-300)', maxWidth: '50ch' }}>{product.description}</p>

          <div style={{ margin: '26px 0 18px' }}>
            <div style={{ font: '500 11px/1 Inter', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: 10 }}>
              Select size
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {product.sizes.map((s) => {
                const outOfStock = s.stock <= 0;
                return (
                  <button
                    key={s.size}
                    type="button"
                    disabled={outOfStock}
                    onClick={() => { setSize(s.size); setSizeError(false); }}
                    className="btn"
                    title={outOfStock ? 'Out of stock' : `${s.stock} left`}
                    style={{
                      border: `1px solid ${size === s.size ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                      color: size === s.size ? 'var(--color-accent)' : 'var(--color-text)',
                      minWidth: 44,
                      textDecoration: outOfStock ? 'line-through' : 'none',
                    }}
                  >
                    {s.size}
                  </button>
                );
              })}
            </div>
            {sizeError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 10, fontSize: 12.5, color: 'var(--color-accent-2-300)' }}>
                Pick a size before adding to the cart.
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <button type="button" className="btn btn-icon" onClick={() => setQty((q) => Math.max(1, q - 1))} style={{ borderRadius: 0 }}>–</button>
              <span style={{ minWidth: 34, textAlign: 'center', font: '500 14px/1 Inter' }}>{qty}</span>
              <button type="button" className="btn btn-icon" onClick={() => setQty((q) => q + 1)} style={{ borderRadius: 0 }}>+</button>
            </div>
            <button type="button" className="btn btn-primary" disabled={soldOut} onClick={handleAdd} style={{ padding: '11px 20px', fontSize: 15 }}>
              {soldOut ? 'Out of stock' : 'Add to cart'}
            </button>
            <Link href="/cart" className="btn btn-secondary" style={{ padding: '11px 16px' }}>View cart</Link>
          </div>

          <div className="hr" style={{ margin: '28px 0' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 26px' }}>
            {[
              ['Category', product.category],
              ['Sub-category', product.subCategory],
              ['Sizes', product.sizes.map((s) => s.size).join(', ') || '—'],
              ['Delivery', 'Cash on delivery available'],
              ['Returns', 'Easy return & exchange within 7 days'],
              ['Origin', 'Audited maker network'],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: 4 }}>{k}</div>
                <div style={{ fontSize: 14 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div style={{ marginTop: 72 }}>
          <h4 style={{ marginBottom: 16 }}>Others from {product.category}</h4>
          <div className="grid-auto-fill">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </main>
  );
}
