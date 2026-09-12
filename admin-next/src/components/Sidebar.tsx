'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdmin } from '@/context/useAdmin';

const NAV = [
  { href: '/add', label: 'Add items' },
  { href: '/list', label: 'List items' },
  { href: '/orders', label: 'Orders' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { setToken } = useAdmin();

  return (
    <aside className="admin-sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 6px' }}>
        <span style={{ width: 20, height: 20, border: '1.5px solid var(--color-accent)', borderRadius: 6, display: 'grid', placeItems: 'center' }}>
          <span style={{ width: 6, height: 6, background: 'var(--color-accent)', borderRadius: 2 }} />
        </span>
        <span style={{ font: '500 15px/1 Inter' }}>Admin</span>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={`admin-nav-link ${pathname === n.href ? 'active' : ''}`}>
            {n.label}
          </Link>
        ))}
      </nav>
      <button type="button" className="btn btn-secondary" onClick={() => setToken('')} style={{ marginTop: 'auto' }}>
        Log out
      </button>
    </aside>
  );
}
