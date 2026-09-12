export interface Coupon {
  _id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxUses: number | null;
  usedCount: number;
  perUserLimit: number;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  isBlocked: boolean;
  joinedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  subCategories: string[];
  sortOrder: number;
  active: boolean;
}

export interface ProductSize {
  size: string;
  stock: number;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string[];
  category: string;
  subCategory: string;
  sizes: ProductSize[];
  bestSeller?: boolean;
  date?: number;
}

export interface OrderAddress {
  firstName: string;
  lastName: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  phone: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  size: string;
}

export interface PaymentRef {
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  gatewaySessionId?: string;
}

export const ORDER_STATUSES = [
  'Order Placed', 'Packing', 'Shipped', 'Out for Delivery', 'Delivered',
  'Cancelled', 'Refunded', 'Payment Failed', 'Stock Issue - Under Review',
] as const;

export interface Order {
  _id: string;
  items: OrderItem[];
  itemsAmount?: number;
  discount?: number;
  couponCode?: string;
  deliveryFee?: number;
  amount: number;
  address: OrderAddress;
  status: string;
  paymentMethod: string;
  payment: boolean;
  paymentRef?: PaymentRef;
  date: number;
}
