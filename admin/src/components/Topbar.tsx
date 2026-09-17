'use client';

import { usePathname } from 'next/navigation';

const TITLES: Record<string, [string, string]> = {
  '/dashboard': ['Dashboard', 'Revenue, orders and best sellers at a glance'],
  '/add': ['Add items', 'Publish a new product to the store'],
  '/list': ['List items', 'Every product currently live'],
  '/categories': ['Categories', 'Manage the categories and sub-categories shoppers filter by'],
  '/orders': ['Orders', 'Track and update fulfilment status'],
  '/customers': ['Customers', 'Every registered shopper'],
  '/coupons': ['Coupons', 'Discount codes shoppers can redeem at checkout'],
};

function titleFor(pathname: string): [string, string] {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith('/customers/')) return ['Customer', 'Profile and order history'];
  if (pathname.startsWith('/edit/')) return ['Edit product', 'Update details, images and stock'];
  return ['Admin', ''];
}

export default function Topbar() {
  const pathname = usePathname();
  const [title, sub] = titleFor(pathname);

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
