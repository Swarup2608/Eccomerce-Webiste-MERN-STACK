'use client';

import Link from 'next/link';
import { useShop } from '@/context/useShop';
import type { Product } from '@/lib/types';
import ProductThumb from './ProductThumb';
import Reveal from './Reveal';
import { useTilt } from '@/hooks/useTilt';

export default function ProductCard({ product }: { product: Product }) {
  const { currency, addToCart } = useShop();
  const { ref, onMouseMove, onMouseLeave } = useTilt();
  const soldOut = product.variants.every((v) => v.stock <= 0);

  return (
    <Reveal>
      <div
        ref={ref}
        data-tilt=""
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="card"
        style={{ position: 'relative' }}
      >
        <Link href={`/product/${product._id}`} style={{ display: 'block', color: 'var(--color-text)' }}>
          <div style={{ position: 'relative' }}>
            <ProductThumb image={product.image?.[0]} name={product.name} />
            {soldOut && (
              <span className="tag tag-neutral" style={{ position: 'absolute', top: 12, right: 12 }}>
                Out of stock
              </span>
            )}
          </div>
          <div style={{ padding: '14px 16px 6px' }}>
            <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-neutral-500)' }}>
              {product.category}
            </div>
            <div style={{ font: '500 16px/1.25 Inter', margin: '6px 0 4px' }}>{product.name}</div>
            <div style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>{product.subCategory}</div>
          </div>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px 16px' }}>
          <span style={{ font: '500 16px/1 Inter' }}>{currency}{product.price}</span>
          <button
            type="button"
            className="btn btn-primary"
            disabled={soldOut}
            style={{ fontSize: 13 }}
            onClick={() => addToCart(product._id, product.variants.find((v) => v.stock > 0)?.value ?? '')}
          >
            Add
          </button>
        </div>
      </div>
    </Reveal>
  );
}
