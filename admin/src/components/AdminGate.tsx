'use client';

import { ReactNode } from 'react';
import { useAdmin } from '@/context/useAdmin';
import AdminLogin from './AdminLogin';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AdminGate({ children }: { children: ReactNode }) {
  const { token, ready } = useAdmin();

  if (!ready) return null;
  if (!token) return <AdminLogin />;

  return (
    <div className="admin-shell">
      <Sidebar />
      <div>
        <Topbar />
        {children}
      </div>
    </div>
  );
}
