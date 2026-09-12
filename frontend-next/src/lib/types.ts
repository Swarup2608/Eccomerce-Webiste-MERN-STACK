export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string[];
  category: string;
  subCategory: string;
  sizes: string[];
  bestSeller?: boolean;
  date?: number;
}

export interface CartItems {
  [productId: string]: {
    [size: string]: number;
  };
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

export interface OrderItem extends Product {
  size: string;
  quantity: number;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  amount: number;
  address: OrderAddress;
  status: string;
  paymentMethod: string;
  payment: boolean;
  date: number;
}
