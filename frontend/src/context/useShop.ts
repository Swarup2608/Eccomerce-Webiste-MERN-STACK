'use client';

import { useContext } from 'react';
import { ShopContext } from './ShopContext';

export const useShop = () => {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used within ShopContextProvider');
  return ctx;
};
