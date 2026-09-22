'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getErrorMessage } from '@/lib/errors';
import { useShop } from '@/context/useShop';

function VerifyInner() {
  const router = useRouter();
  const { token, setCartItems, backendURL } = useShop();
  const params = useSearchParams();
  const [state, setState] = useState<'pending' | 'ok' | 'fail'>('pending');

  const success = params.get('success');
  const orderId = params.get('orderId');

  useEffect(() => {
    const verify = async () => {
      if (!token) return;
      try {
        const response = await axios.post(backendURL + '/api/order/verifyStripe', { success, orderId }, { headers: { token } });
        if (response.data.success) {
          setState('ok');
          setCartItems({});
          toast.success(response.data.message);
        } else {
          setState('fail');
          toast.error(response.data.message);
        }
      } catch (error) {
        setState('fail');
        toast.error(getErrorMessage(error));
      }
    };
    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <main style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', padding: '80px 26px' }}>
      <div style={{ maxWidth: 520, width: '100%' }}>
        {state === 'pending' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 18 }}>
            <div style={{ width: 46, height: 46, border: '2px solid var(--color-accent-900)', borderTopColor: 'var(--color-accent)', borderRadius: '50%', animation: 'ec-spin .9s linear infinite' }} />
            <h3 style={{ margin: 0 }}>Verifying your payment</h3>
            <p style={{ fontSize: 14, color: 'var(--color-neutral-400)', margin: 0 }}>
              Do not close this window. We are waiting on confirmation from the payment provider.
            </p>
          </div>
        )}
        {state === 'ok' && (
          <div className="reveal">
            <div style={{ width: 50, height: 50, border: '1px solid var(--color-accent)', borderRadius: 14, display: 'grid', placeItems: 'center', color: 'var(--color-accent)', marginBottom: 20, boxShadow: '0 0 30px color-mix(in srgb,var(--color-accent) 30%,transparent)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m5 12.5 4.5 4.5L19 7" /></svg>
            </div>
            <h3 style={{ margin: '0 0 8px' }}>Payment confirmed</h3>
            <p style={{ fontSize: 14, color: 'var(--color-neutral-400)' }}>Your order is paid and queued for packing. A receipt is on its way to your inbox.</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button type="button" className="btn btn-primary" onClick={() => router.push('/orders')}>Track this order</button>
              <button type="button" className="btn btn-secondary" onClick={() => router.push('/collections')}>Keep shopping</button>
            </div>
          </div>
        )}
        {state === 'fail' && (
          <div className="reveal">
            <div style={{ width: 50, height: 50, border: '1px solid var(--color-accent-2)', borderRadius: 14, display: 'grid', placeItems: 'center', color: 'var(--color-accent-2-300)', marginBottom: 20 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M7 7l10 10M17 7 7 17" /></svg>
            </div>
            <h3 style={{ margin: '0 0 8px' }}>Payment could not be verified</h3>
            <p style={{ fontSize: 14, color: 'var(--color-neutral-400)' }}>Nothing was taken. Your cart is untouched — try another method or use cash on delivery.</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button type="button" className="btn btn-primary" onClick={() => router.push('/place-order')}>Try again</button>
              <button type="button" className="btn btn-secondary" onClick={() => router.push('/contact')}>Contact support</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function Verify() {
  return (
    <Suspense fallback={null}>
      <VerifyInner />
    </Suspense>
  );
}
