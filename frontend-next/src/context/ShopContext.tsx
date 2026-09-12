'use client';

import { createContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';
import type { CartItems, Product } from '@/lib/types';

interface ShopContextValue {
  products: Product[];
  currency: string;
  delivery_fee: number;
  search: string;
  setSearch: (v: string) => void;
  showSearch: boolean;
  setShowSearch: (v: boolean) => void;
  cartItems: CartItems;
  setCartItems: (v: CartItems) => void;
  addToCart: (itemId: string, size: string) => Promise<void>;
  getCartCount: () => number;
  updateQuantity: (itemId: string, size: string, quantity: number) => Promise<void>;
  getCartAmount: () => number;
  backendURL: string;
  token: string;
  setToken: (v: string) => void;
  logout: () => void;
}

export const ShopContext = createContext<ShopContextValue | null>(null);

export const ShopContextProvider = ({ children }: { children: ReactNode }) => {
  const currency = '$';
  const delivery_fee = 10;
  const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState<CartItems>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [token, setToken] = useState('');
  const router = useRouter();

  const addToCart = async (itemId: string, size: string) => {
    if (!size) {
      toast.error('Select product size!!!');
      return;
    }
    const cartData: CartItems = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;
    } else {
      cartData[itemId] = { [size]: 1 };
    }
    setCartItems(cartData);
    if (token) {
      try {
        await axios.post(backendURL + '/api/cart/add', { itemId, size }, { headers: { token } });
      } catch (error: any) {
        console.log(error);
        toast.error(error.message);
      }
    } else {
      toast.error('Please login to add items to cart!');
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        if (cartItems[items][item] > 0) totalCount += cartItems[items][item];
      }
    }
    return totalCount;
  };

  const getUserCart = async (tok: string) => {
    try {
      const response = await axios.post(backendURL + '/api/cart/get', {}, { headers: { token: tok } });
      if (response.data.success) {
        setCartItems(response.data.cartData);
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const updateQuantity = async (itemId: string, size: string, quantity: number) => {
    const cartData: CartItems = structuredClone(cartItems);
    cartData[itemId][size] = quantity;
    setCartItems(cartData);
    if (token) {
      try {
        await axios.post(backendURL + '/api/cart/update', { itemId, size, quantity }, { headers: { token } });
      } catch (error: any) {
        console.log(error);
        toast.error(error.message);
      }
    } else {
      toast.error('Please login to add items to cart!');
    }
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      const iteminfo = products.find((product) => product._id === items);
      for (const item in cartItems[items]) {
        if (cartItems[items][item] > 0 && iteminfo) {
          totalAmount += iteminfo.price * cartItems[items][item];
        }
      }
    }
    return totalAmount;
  };

  const getProductData = async () => {
    try {
      const response = await axios.get(backendURL + '/api/product/list');
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const logout = () => {
    setToken('');
    localStorage.removeItem('token');
    setCartItems({});
    router.push('/login');
  };

  useEffect(() => {
    getProductData();
    const stored = localStorage.getItem('token');
    if (!token && stored) {
      setToken(stored);
      getUserCart(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: ShopContextValue = {
    products, currency, delivery_fee,
    search, setSearch, showSearch, setShowSearch,
    cartItems, setCartItems, addToCart, getCartCount, updateQuantity,
    getCartAmount, backendURL, token, setToken, logout,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};
