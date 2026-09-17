'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/context/useAdmin';

export default function AdminHome() {
  const router = useRouter();
  const { token, ready } = useAdmin();

  useEffect(() => {
    if (ready && token) router.replace('/dashboard');
  }, [ready, token, router]);

  return null;
}
