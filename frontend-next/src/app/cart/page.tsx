'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useShop } from '@/context/useShop';
import ProductThumb from '@/components/ProductThumb';

export default function Cart() {
  const { products, currency, cartItems, updateQuantity, getCartAmount, delivery_fee } = useShop();
  const router = useRouter();

  const rows = useMemo(() => {
    const out: { product: (typeof products)[number]; size: string; qty: number }[] = [];
    for (const id in cartItems) {
      const product = products.find((p) => p._id === id);
      if (!product) continue;
      for (const size in cartItems[id]) {
        if (cartItems[id][size] > 0) out.push({ product, size, qty: cartItems[id][size] });
      }
    }
    return out;
  }, [cartItems, products]);

  const amount = getCartAmount();
  const total = amount === 0 ? 0 : amount + delivery_fee;

  return (
    <main className="container" style={{ padding: '44px 26px 80px' }}>
      <h2 style={{ letterSpacing: '-.025em', margin: '0 0 28px' }}>Your cart</h2>

      {rows.length === 0 ? (
        <div className="card" style={{ padding: '70px 34px', maxWidth: 560 }}>
          <div style={{ width: 46, height: 46, border: '1px solid var(--color-divider)', borderRadius: 12, display: 'grid', placeItems: 'center', color: 'var(--color-neutral-500)', marginBottom: 18 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 5h2.4l2.2 9.4h9.1L20 8H7" /><circle cx="10" cy="19" r="1.5" /><circle cx="17.5" cy="19" r="1.5" />
            </svg>
          </div>
          <div style={{ font: '500 22px/1.2 Inter', marginBottom: 8 }}>Nothing in here yet</div>
          <p style={{ fontSize: 14, color: 'var(--color-neutral-400)', maxWidth: '40ch' }}>
            Your cart keeps items for 30 days, so you can sit on a decision without losing it.
          </p>
          <Link href="/collections" className="btn btn-primary">Start with best sellers</Link>
        </div>
      ) : (
        <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)', gap: 34, alignItems: 'start' }}>
          <div>
            {rows.map((r) => (
              <div key={`${r.product._id}-${r.size}`} style={{ display: 'grid', gridTemplateColumns: '96px minmax(0,1fr) auto', gap: 18, alignItems: 'center', padding: '18px 0', boxShadow: '0 1px 0 var(--color-divider)' }}>
                <ProductThumb image={r.product.image?.[0]} name={r.product.name} />
                <div>
                  <div style={{ font: '500 16px/1.25 Inter' }}>{r.product.name}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--color-neutral-500)', marginTop: 4 }}>Size {r.size} · {currency}{r.product.price}</div>
                  <button
                    type="button"
                    onClick={() => updateQuantity(r.product._id, r.size, 0)}
                    style={{ marginTop: 8, background: 'none', border: 0, padding: 0, cursor: 'pointer', fontSize: 12.5, color: 'var(--color-neutral-400)', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 7h16M9 7V4.8h6V7M6.5 7l1 12.2h9L18 7" /></svg>
                    Remove
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <button type="button" className="btn btn-icon" onClick={() => updateQuantity(r.product._id, r.size, Math.max(1, r.qty - 1))} style={{ borderRadius: 0, width: 30, height: 30 }}>–</button>
                    <span style={{ minWidth: 28, textAlign: 'center', font: '500 13px/1 Inter' }}>{r.qty}</span>
                    <button type="button" className="btn btn-icon" onClick={() => updateQuantity(r.product._id, r.size, r.qty + 1)} style={{ borderRadius: 0, width: 30, height: 30 }}>+</button>
                  </div>
                  <span style={{ font: '500 16px/1 Inter', minWidth: 70, textAlign: 'right' }}>{currency}{r.product.price * r.qty}</span>
                </div>
              </div>
            ))}
          </div>
          <aside className="card" style={{ padding: 22 }}>
            <div style={{ font: '500 11px/1 Inter', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: 16 }}>
              Order summary
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '7px 0', color: 'var(--color-neutral-300)' }}>
              <span>Subtotal</span><span>{currency}{amount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '7px 0', color: 'var(--color-neutral-300)' }}>
              <span>Shipping</span><span>{currency}{delivery_fee}</span>
            </div>
            <div className="hr" style={{ margin: '14px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
              <span style={{ fontSize: 14 }}>Total</span>
              <span style={{ font: '500 26px/1 Inter', letterSpacing: '-.02em' }}>{currency}{total}</span>
            </div>
            <button type="button" className="btn btn-primary btn-block" onClick={() => router.push('/place-order')} style={{ padding: '11px 16px', fontSize: 15 }}>
              Proceed to checkout
            </button>
            <p style={{ fontSize: 12, color: 'var(--color-neutral-500)', margin: '14px 0 0' }}>
              Carbon-neutral delivery included. Returns open for 60 days.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}
