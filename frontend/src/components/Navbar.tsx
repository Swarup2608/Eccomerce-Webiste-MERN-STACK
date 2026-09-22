'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useShop } from '@/context/useShop';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/collections', label: 'Collections' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { search, setSearch, getCartCount, token, logout } = useShop();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header
      style={{
        position: 'sticky', top: 0, zIndex: 40,
        display: 'flex', alignItems: 'center', gap: 26,
        padding: '16px 26px', background: 'rgba(22,24,38,.86)',
        backdropFilter: 'blur(16px)', boxShadow: '0 1px 0 var(--color-divider)', flexWrap: 'wrap',
      }}
    >
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, color: 'var(--color-text)' }}>
        <span style={{ width: 22, height: 22, border: '1.5px solid var(--color-accent)', borderRadius: 7, display: 'grid', placeItems: 'center' }}>
          <span style={{ width: 7, height: 7, background: 'var(--color-accent)', borderRadius: 2 }} />
        </span>
        <span style={{ font: '500 19px/1 Inter', letterSpacing: '-.02em' }}>EcoCart</span>
      </Link>

      <nav style={{ display: 'flex', gap: 20, fontSize: 14 }} className="navbar-links">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            style={{ color: pathname === n.href ? 'var(--color-accent)' : 'var(--color-text)' }}
          >
            {n.label}
          </Link>
        ))}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 10px', background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 8, minWidth: 160 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ color: 'var(--color-neutral-500)', flex: 'none' }}>
            <circle cx="11" cy="11" r="7" /><path d="m20 20-3.6-3.6" />
          </svg>
          <input
            className="input"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (pathname !== '/collections') router.push('/collections');
            }}
            placeholder="Search the store"
            style={{ border: 0, background: 'none', minHeight: 20, padding: 0, fontSize: 13 }}
          />
        </div>
        {token ? (
          <button type="button" className="btn btn-secondary" onClick={logout} style={{ gap: 7 }}>
            Log out
          </button>
        ) : (
          <Link href="/login" className="btn btn-secondary" style={{ gap: 7 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="8" r="3.6" /><path d="M5 20c1.4-3.6 4-5.2 7-5.2s5.6 1.6 7 5.2" />
            </svg>
            Log in
          </Link>
        )}
        <Link href="/cart" className="btn btn-primary" style={{ gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 5h2.4l2.2 9.4h9.1L20 8H7" /><circle cx="10" cy="19" r="1.5" /><circle cx="17.5" cy="19" r="1.5" />
          </svg>
          Cart
          <span style={{ minWidth: 19, height: 19, display: 'grid', placeItems: 'center', fontSize: 11, borderRadius: 6, background: 'var(--color-accent-800)', color: 'var(--color-accent-100)' }}>
            {getCartCount()}
          </span>
        </Link>
      </div>
    </header>
  );
}
