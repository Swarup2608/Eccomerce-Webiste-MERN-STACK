'use client';

import { useContext } from 'react';
import { AdminContext } from './AdminContext';

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminContextProvider');
  return ctx;
};
