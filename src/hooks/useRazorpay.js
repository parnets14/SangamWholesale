import { useCallback } from 'react';
import toast from 'react-hot-toast';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

// Match the pattern used everywhere else in the codebase:
// - In production (sangamwholesale.com) → absolute URL to the live backend
// - In local dev (localhost) → relative path, proxied by vite.config.js to localhost:1083
const API_BASE =
  typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://sangamwholesale.com/api'
    : '/api';

/**
 * useRazorpay
 *
 * Returns an `openRazorpay` function. Call it with:
 * {
 *   amount,          — total in RUPEES (e.g. 499.18)
 *   orderDetails,    — the full orderPayload you'd pass to /api/orders
 *   user,            — { fullName, phone/email } from AuthContext
 *   token,           — JWT for API calls
 *   onSuccess,       — async (paymentResult) => void  — called after verified
 *   onFailure,       — (error) => void                — called on error/cancel
 * }
 */
const useRazorpay = () => {
  const openRazorpay = useCallback(async ({
    amount,
    orderDetails,
    user,
    token,
    onSuccess,
    onFailure,
  }) => {
    // ── 1. Guard: script must be loaded ──────────────────────────────────────
    if (typeof window.Razorpay === 'undefined') {
      toast.error('Payment service unavailable. Please refresh and try again.');
      onFailure && onFailure(new Error('Razorpay script not loaded'));
      return;
    }

    // ── 2. Create Razorpay order on the backend ───────────────────────────────
    let razorpayOrder;
    const loadingToast = toast.loading('Initialising payment…');
    try {
      const res = await fetch(`${API_BASE}/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ amount }), // amount in rupees; backend converts to paise
      });

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (!res.ok) {
        toast.error(data.message || 'Could not create payment order.');
        onFailure && onFailure(new Error(data.message));
        return;
      }

      razorpayOrder = data; // { order_id, amount (paise), currency }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error('Network error while creating order. Please try again.');
      onFailure && onFailure(err);
      return;
    }

    // ── 3. Open Razorpay modal ────────────────────────────────────────────────
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,          // paise, as returned by backend
      currency: razorpayOrder.currency || 'INR',
      name: 'Sangam Wholesale',
      description: 'Order Payment',
      image: '/sangamwholesale.png',
      order_id: razorpayOrder.order_id,

      // Pre-fill user details if available
      prefill: {
        name: user?.fullName || '',
        email: user?.email || '',
        contact: user?.phone || '',
      },

      theme: { color: '#702834' },

      // ── 3a. Payment success ─────────────────────────────────────────────────
      handler: async (response) => {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;

        const verifyToast = toast.loading('Verifying payment…');
        try {
          const verifyRes = await fetch(`${API_BASE}/payments/verify-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();
          toast.dismiss(verifyToast);

          if (!verifyRes.ok || !verifyData.success) {
            toast.error('Payment verification failed. Contact support.');
            onFailure && onFailure(new Error('Signature mismatch'));
            return;
          }

          toast.success('Payment successful!');
          onSuccess && onSuccess({
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
          });
        } catch (err) {
          toast.dismiss(verifyToast);
          toast.error('Error verifying payment. Contact support.');
          onFailure && onFailure(err);
        }
      },

      // ── 3b. Modal dismissed (user cancelled) ───────────────────────────────
      modal: {
        ondismiss: () => {
          toast('Payment cancelled.', { icon: 'ℹ️' });
          onFailure && onFailure(new Error('Payment modal dismissed by user'));
        },
      },
    };

    const rzp = new window.Razorpay(options);

    // ── 3c. Payment failed event ──────────────────────────────────────────────
    rzp.on('payment.failed', (response) => {
      const reason = response?.error?.description || 'Payment failed';
      toast.error(`Payment failed: ${reason}`);
      onFailure && onFailure(new Error(reason));
    });

    rzp.open();
  }, []);

  return { openRazorpay };
};

export default useRazorpay;
