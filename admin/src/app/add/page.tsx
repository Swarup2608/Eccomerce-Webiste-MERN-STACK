'use client';

import axios from 'axios';
import { toast } from 'react-toastify';
import { useAdmin } from '@/context/useAdmin';
import ProductForm from '@/components/ProductForm';

export default function AddProduct() {
  const { backendURL, token } = useAdmin();

  const onSubmit = async (formData: FormData) => {
    try {
      const response = await axios.post(backendURL + '/api/product/add', formData, { headers: { token } });
      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return <ProductForm mode="add" submitLabel="Add product" onSubmit={onSubmit} />;
}
