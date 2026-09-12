'use client';

import { usePathname } from 'next/navigation';

const TITLES: Record<string, [string, string]> = {
  '/add': ['Add items', 'Publish a new product to the store'],
  '/list': ['List items', 'Every product currently live'],
  '/orders': ['Orders', 'Track and update fulfilment status'],
};

export default function Topbar() {
  const pathname = usePathname();
  const [title, sub] = TITLES[pathname] || ['Admin', ''];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 24px', boxShadow: '0 1px 0 var(--color-divider)' }}>
      <div style={{ font: '500 16px/1 Inter' }}>{title}</div>
      <span style={{ fontSize: 12.5, color: 'var(--color-neutral-500)' }}>{sub}</span>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: 'var(--color-neutral-400)' }}>
        <span style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--color-accent-800)', display: 'grid', placeItems: 'center', fontSize: 11, color: 'var(--color-accent-100)' }}>
          AD
        </span>
        Admin
      </div>
    </div>
  );
}
