'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getErrorMessage } from '@/lib/errors';
import { useAdmin } from '@/context/useAdmin';
import ProductForm from '@/components/ProductForm';
import type { Product } from '@/lib/types';

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { backendURL, token } = useAdmin();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.post(backendURL + '/api/product/single', { productId: id }).then((response) => {
      if (response.data.success) {
        setProduct(response.data.product);
      } else {
        toast.error(response.data.message);
      }
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSubmit = async (formData: FormData) => {
    formData.append('id', id);
    try {
      const response = await axios.post(backendURL + '/api/product/update', formData, { headers: { token } });
      if (response.data.success) {
        toast.success(response.data.message);
        router.push('/list');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(getErrorMessage(error));
    }
  };

  if (loading) return null;
  if (!product) return <div style={{ padding: '26px 24px' }}>Product not found.</div>;

  return (
    <ProductForm
      mode="edit"
      initial={product}
      existingImages={product.image}
      submitLabel="Save changes"
      onSubmit={onSubmit}
    />
  );
}
