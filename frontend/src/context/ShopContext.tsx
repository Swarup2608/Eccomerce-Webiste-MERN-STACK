'use client';

import { createContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getErrorMessage } from '@/lib/errors';
import type { CartItems, Category, Product } from '@/lib/types';

interface ShopContextValue {
  products: Product[];
  categories: Category[];
  currency: string;
  delivery_fee: number;
  search: string;
  setSearch: (v: string) => void;
  showSearch: boolean;
  setShowSearch: (v: boolean) => void;
  cartItems: CartItems;
  setCartItems: (v: CartItems) => void;
  addToCart: (itemId: string, variant: string) => Promise<void>;
  getCartCount: () => number;
  updateQuantity: (itemId: string, variant: string, quantity: number) => Promise<void>;
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [token, setToken] = useState('');
  const router = useRouter();

  const addToCart = async (itemId: string, variant: string) => {
    if (!variant) {
      const filterLabel = products.find((p) => p._id === itemId)?.filterLabel || 'option';
      toast.error(`Select a ${filterLabel.toLowerCase()}!`);
      return;
    }
    const cartData: CartItems = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId][variant] = (cartData[itemId][variant] || 0) + 1;
    } else {
      cartData[itemId] = { [variant]: 1 };
    }
    setCartItems(cartData);
    if (token) {
      try {
        await axios.post(backendURL + '/api/cart/add', { itemId, variant }, { headers: { token } });
      } catch (error) {
        console.log(error);
        toast.error(getErrorMessage(error));
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
    } catch (error) {
      console.log(error);
      toast.error(getErrorMessage(error));
    }
  };

  const updateQuantity = async (itemId: string, variant: string, quantity: number) => {
    const cartData: CartItems = structuredClone(cartItems);
    cartData[itemId][variant] = quantity;
    setCartItems(cartData);
    if (token) {
      try {
        await axios.post(backendURL + '/api/cart/update', { itemId, variant, quantity }, { headers: { token } });
      } catch (error) {
        console.log(error);
        toast.error(getErrorMessage(error));
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
    } catch (error) {
      console.log(error);
      toast.error(getErrorMessage(error));
    }
  };

  const getCategoryData = async () => {
    try {
      const response = await axios.get(backendURL + '/api/category/list');
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.log(error);
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
    getCategoryData();
    const stored = localStorage.getItem('token');
    if (!token && stored) {
      setToken(stored);
      getUserCart(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: ShopContextValue = {
    products, categories, currency, delivery_fee,
    search, setSearch, showSearch, setShowSearch,
    cartItems, setCartItems, addToCart, getCartCount, updateQuantity,
    getCartAmount, backendURL, token, setToken, logout,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};
