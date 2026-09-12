'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useShop } from '@/context/useShop';
import ProductThumb from '@/components/ProductThumb';
import { assets } from '@/lib/assets';
import type { OrderAddress } from '@/lib/types';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const FIELDS: { name: keyof OrderAddress; label: string; placeholder: string; half?: boolean }[] = [
  { name: 'firstName', label: 'First name', placeholder: 'Priya', half: true },
  { name: 'lastName', label: 'Last name', placeholder: 'Raman', half: true },
  { name: 'email', label: 'Email', placeholder: 'you@example.com' },
  { name: 'street', label: 'Street', placeholder: '54709 Willims Station' },
  { name: 'city', label: 'City', placeholder: 'Bengaluru', half: true },
  { name: 'state', label: 'State', placeholder: 'Karnataka', half: true },
  { name: 'zipcode', label: 'Zip code', placeholder: '560095', half: true },
  { name: 'country', label: 'Country', placeholder: 'India', half: true },
  { name: 'phone', label: 'Phone', placeholder: '+91 90000 00000' },
];

export default function PlaceOrder() {
  const router = useRouter();
  const { products, currency, backendURL, token, cartItems, setCartItems, delivery_fee, getCartAmount } = useShop();
  const [method, setMethod] = useState<'cod' | 'stripe' | 'razorpay'>('cod');
  const [formData, setFormData] = useState<OrderAddress>({
    firstName: '', lastName: '', email: '', street: '', city: '', state: '', zipcode: '', country: '', phone: '',
  });
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const rows = useMemo(() => {
    const out: { product: (typeof products)[number]; size: string; qty: number }[] = [];
    for (const id in cartItems) {
      const product = products.find((p) => p._id === id);
      if (!product) continue;
      for (const size in cartItems[id]) {
        if (cartItems[id][size] > 0) out.push({ product, size, qty: cartItems[id][size] });
      }
    }
    return out;
  }, [cartItems, products]);

  const amount = getCartAmount();
  const discount = appliedCoupon?.discount ?? 0;
  const total = amount === 0 ? 0 : amount - discount + delivery_fee;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((d) => ({ ...d, [e.target.name]: e.target.value }));
  };

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    try {
      const { data } = await axios.post(
        backendURL + '/api/coupon/validate',
        { code: couponInput.trim(), itemsAmount: amount },
        { headers: { token } }
      );
      if (data.success) {
        setAppliedCoupon({ code: data.code, discount: data.discount });
        toast.success(`Coupon applied — you saved ${currency}${data.discount}`);
      } else {
        setAppliedCoupon(null);
        toast.error(data.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
  };

  const initPay = (order: any) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Order Payment',
      description: 'Order Payment',
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response: any) => {
        try {
          const { data } = await axios.post(backendURL + '/api/order/verifyRazorPay', response, { headers: { token } });
          if (data.success) {
            setCartItems({});
            router.push('/orders');
            toast.success(data.message);
          } else {
            toast.error(data.message);
          }
        } catch (error: any) {
          toast.error(error.message);
        }
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const orderItems = rows.map((r) => ({ productId: r.product._id, size: r.size, quantity: r.qty }));
      const orderData = {
        address: formData,
        items: orderItems,
        couponCode: appliedCoupon?.code,
      };

      if (method === 'cod') {
        const response = await axios.post(backendURL + '/api/order/place', orderData, { headers: { token } });
        if (response.data.success) {
          setCartItems({});
          toast.success(response.data.message);
          router.push('/orders');
        } else {
          toast.error(response.data.message);
        }
      } else if (method === 'stripe') {
        const stripe = await axios.post(backendURL + '/api/order/stripe', orderData, { headers: { token } });
        if (stripe.data.success) {
          window.location.replace(stripe.data.url);
        } else {
          toast.error(stripe.data.message);
        }
      } else if (method === 'razorpay') {
        const razorpay = await axios.post(backendURL + '/api/order/razorpay', orderData, { headers: { token } });
        if (razorpay.data.success) {
          initPay(razorpay.data.order);
        } else {
          toast.error(razorpay.data.message);
        }
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <main className="container" style={{ padding: '44px 26px 80px' }}>
        <h2 style={{ letterSpacing: '-.025em', margin: '0 0 28px' }}>Checkout</h2>
        <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.35fr) minmax(0,1fr)', gap: 40, alignItems: 'start' }}>
          <div>
            <div style={{ font: '500 11px/1 Inter', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: 16 }}>
              Delivery information
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {FIELDS.map((f) => (
                <div className="field" key={f.name} style={{ gridColumn: f.half ? undefined : '1 / -1' }}>
                  <label>{f.label}</label>
                  <input
                    className="input"
                    name={f.name}
                    required
                    value={formData[f.name]}
                    onChange={onChange}
                    placeholder={f.placeholder}
                    type={f.name === 'email' ? 'email' : f.name === 'phone' ? 'tel' : 'text'}
                  />
                </div>
              ))}
            </div>

            <div style={{ margin: '30px 0 14px', font: '500 11px/1 Inter', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-500)' }}>
              Payment method
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label className={`radio-pay ${method === 'stripe' ? 'on' : ''}`}>
                <input type="radio" name="pay" checked={method === 'stripe'} onChange={() => setMethod('stripe')} style={{ display: 'none' }} />
                <span className="radio-dot" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={assets.stripeLogo} alt="Stripe" style={{ height: 20 }} />
              </label>
              <label className={`radio-pay ${method === 'razorpay' ? 'on' : ''}`}>
                <input type="radio" name="pay" checked={method === 'razorpay'} onChange={() => setMethod('razorpay')} style={{ display: 'none' }} />
                <span className="radio-dot" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={assets.razorpayLogo} alt="Razorpay" style={{ height: 20 }} />
              </label>
              <label className={`radio-pay ${method === 'cod' ? 'on' : ''}`}>
                <input type="radio" name="pay" checked={method === 'cod'} onChange={() => setMethod('cod')} style={{ display: 'none' }} />
                <span className="radio-dot" />
                <span>
                  <span style={{ display: 'block', font: '500 15px/1.2 Inter' }}>Cash on delivery</span>
                  <span style={{ display: 'block', fontSize: 12.5, color: 'var(--color-neutral-500)', marginTop: 3 }}>Pay when your order arrives</span>
                </span>
              </label>
            </div>
          </div>

          <aside className="card" style={{ padding: 22, position: 'sticky', top: 96 }}>
            <div style={{ font: '500 11px/1 Inter', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: 16 }}>
              {rows.length} item{rows.length === 1 ? '' : 's'}
            </div>
            {rows.map((r) => (
              <div key={`${r.product._id}-${r.size}`} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '9px 0' }}>
                <div style={{ width: 44 }}><ProductThumb image={r.product.image?.[0]} name={r.product.name} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.product.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--color-neutral-500)' }}>Size {r.size} × {r.qty}</div>
                </div>
                <span style={{ fontSize: 13.5 }}>{currency}{r.product.price * r.qty}</span>
              </div>
            ))}
            <div className="hr" style={{ margin: '14px 0' }} />

            {appliedCoupon ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span className="tag tag-accent">{appliedCoupon.code} applied</span>
                <button type="button" onClick={removeCoupon} style={{ background: 'none', border: 0, color: 'var(--color-neutral-500)', cursor: 'pointer', fontSize: 12.5 }}>
                  Remove
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <input
                  className="input"
                  placeholder="Coupon code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="button" className="btn btn-secondary" onClick={applyCoupon} disabled={applyingCoupon}>
                  {applyingCoupon ? 'Checking…' : 'Apply'}
                </button>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '6px 0', color: 'var(--color-neutral-300)' }}>
              <span>Subtotal</span><span>{currency}{amount}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '6px 0', color: 'var(--color-accent-300)' }}>
                <span>Discount</span><span>-{currency}{discount}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '6px 0', color: 'var(--color-neutral-300)' }}>
              <span>Shipping</span><span>{currency}{delivery_fee}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '14px 0 18px' }}>
              <span style={{ fontSize: 14 }}>Total</span>
              <span style={{ font: '500 26px/1 Inter', letterSpacing: '-.02em' }}>{currency}{total}</span>
            </div>
            <button type="submit" className="btn btn-primary btn-block" style={{ padding: '11px 16px', fontSize: 15 }}>
              Place order
            </button>
          </aside>
        </div>
      </main>
    </form>
  );
}
