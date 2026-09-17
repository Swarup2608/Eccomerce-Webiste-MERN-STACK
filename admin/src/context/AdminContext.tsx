'use client';

import { createContext, useEffect, useState, ReactNode } from 'react';

interface AdminContextValue {
  token: string;
  setToken: (v: string) => void;
  backendURL: string;
  currency: string;
  ready: boolean;
}

export const AdminContext = createContext<AdminContextValue | null>(null);

export const AdminContextProvider = ({ children }: { children: ReactNode }) => {
  const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  const currency = '$';
  const [token, setTokenState] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (stored) setTokenState(stored);
    setReady(true);
  }, []);

  const setToken = (v: string) => {
    setTokenState(v);
    if (v) localStorage.setItem('token', v);
    else localStorage.removeItem('token');
  };

  return (
    <AdminContext.Provider value={{ token, setToken, backendURL, currency, ready }}>
      {children}
    </AdminContext.Provider>
  );
};
