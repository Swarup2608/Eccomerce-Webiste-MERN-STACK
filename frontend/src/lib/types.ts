export interface SubCategory {
  name: string;
  filterKey: string;
  filterLabel: string;
  filterOptions: string[];
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  subCategories: SubCategory[];
  sortOrder: number;
  active: boolean;
}

export interface ProductVariant {
  value: string;
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
  filterKey: string;
  filterLabel: string;
  variants: ProductVariant[];
  bestSeller?: boolean;
  date?: number;
}

export interface CartItems {
  [productId: string]: {
    [variant: string]: number;
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
  variant: string;
  variantLabel: string;
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
