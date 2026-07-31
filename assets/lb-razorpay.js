/**
 * lb-razorpay.js — Legendary Branding Razorpay cart checkout integration
 *
 * Flow:
 *   1. Click → fetch /cart.js for line items
 *   2. POST GCP_BASE/create-order → Razorpay order_id
 *   3. Open Razorpay Standard Checkout modal (Razorpay collects customer info)
 *   4. On success → POST GCP_BASE/verify-payment → redirect to order status URL
 *   5. On failure → show inline error, re-enable button
 *
 * Config is injected via window.LB_RZP_CONFIG by cart-summary.liquid.
 */

(function () {
  'use strict';

  const cfg     = window.LB_RZP_CONFIG || {};
  const GCP_BASE = (cfg.gcpBase || '').replace(/\/$/, '');
  const RZP_KEY  = cfg.rzpKey  || '';

  if (!GCP_BASE || !RZP_KEY) return;

  const btn     = document.getElementById('lb-razorpay-upi-btn');
  const wrapper = document.getElementById('lb-razorpay-upi-wrapper');
  if (!btn || !wrapper) return;

  const errEl = document.createElement('p');
  errEl.id = 'lb-rzp-error';
  errEl.style.cssText = 'color:#c0392b;font-size:0.85rem;margin:6px 0 0;display:none;';
  wrapper.appendChild(errEl);

  function showError(msg) {
    console.error('[lb-razorpay]', msg);
    errEl.textContent = msg;
    errEl.style.display = 'block';
    if (!document.contains(errEl)) {
      errEl.style.cssText += 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:99999;background:#fff;padding:12px 20px;border-radius:6px;box-shadow:0 2px 12px rgba(0,0,0,.2);';
      document.body.appendChild(errEl);
    }
  }

  function clearError() {
    errEl.style.display = 'none';
    errEl.textContent   = '';
  }

  function setLoading(loading) {
    try {
      btn.disabled = loading;
      const span = btn.querySelector('span') || btn;
      span.textContent = loading ? 'Processing…' : cfg.btnLabel || 'Pay with Razorpay / UPI';
    } catch (e) { /* best-effort */ }
  }

  function loadRazorpayScript() {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) { resolve(); return; }
      const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
      if (existing) {
        const check = setInterval(() => { if (window.Razorpay) { clearInterval(check); resolve(); } }, 100);
        setTimeout(() => { clearInterval(check); reject(new Error('Razorpay checkout timed out')); }, 10000);
        return;
      }
      const s = document.createElement('script');
      s.src    = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = () => { if (window.Razorpay) resolve(); else reject(new Error('Razorpay checkout.js loaded but window.Razorpay not defined')); };
      s.onerror = () => reject(new Error('Failed to load Razorpay checkout — check theme CSP settings'));
      document.head.appendChild(s);
    });
  }

  async function fetchCart() {
    const resp = await fetch('/cart.js');
    if (!resp.ok) throw new Error('Could not read cart');
    return resp.json();
  }

  // Use logged-in customer's saved address if available; otherwise empty —
  // Razorpay collects contact details in its own modal.
  function getCustomerAddress() {
    const ca = window.Shopify && window.Shopify.customerAddress;
    if (ca && ca.address1) {
      return {
        first_name: ca.first_name || '',
        last_name:  ca.last_name  || '',
        address1:   ca.address1   || '',
        city:       ca.city       || '',
        province:   ca.province   || '',
        zip:        ca.zip        || '',
        country:    ca.country    || 'India',
        phone:      ca.phone      || ''
      };
    }
    return {};
  }

  // Preload Razorpay SDK in the background so it's ready before the customer clicks
  loadRazorpayScript().catch(function () { /* silent — will retry on click */ });

  btn.addEventListener('click', async () => {
    clearError();
    setLoading(true);

    try {
      // Fetch cart and ensure Razorpay SDK is loaded in parallel
      const [cart] = await Promise.all([fetchCart(), loadRazorpayScript()]);
      const cartItems = cart.items.map(item => ({
        variant_id: item.variant_id,
        quantity:   item.quantity,
        price:      item.price
      }));
      if (!cartItems.length) {
        showError('Your cart is empty.');
        setLoading(false);
        return;
      }

      const customerEmail    = btn.dataset.customerEmail || '';
      const customerName     = btn.dataset.customerName  || '';
      const cartTotal        = parseInt(btn.dataset.cartTotal, 10) || cart.total_price;
      const cartCurrency     = btn.dataset.cartCurrency || 'INR';
      const shippingAddress  = getCustomerAddress();

      const orderResp = await fetch(`${GCP_BASE}/create-order`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount:           cartTotal,
          currency:         cartCurrency,
          customer_email:   customerEmail,
          customer_name:    customerName,
          cart_items:       cartItems,
          shipping_address: shippingAddress
        })
      });

      if (!orderResp.ok) {
        const err = await orderResp.json().catch(() => ({}));
        throw new Error(err.error || 'Could not create payment order. Please try again.');
      }

      const order = await orderResp.json();
      const draftOrderId = order.draft_order_id || null;

      await loadRazorpayScript();

      const options = {
        key:         RZP_KEY,
        order_id:    order.id,
        amount:      order.amount,
        currency:    order.currency || 'INR',
        name:        'Legendary Branding',
        description: 'Order Payment',
        prefill: {
          email: customerEmail,
          name:  customerName
        },
        theme: { color: '#072654' },
        modal: {
          ondismiss: () => { setLoading(false); }
        },
        handler: async function (response) {
          try {
            const verifyResp = await fetch(`${GCP_BASE}/verify-payment`, {
              method:  'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_signature:  response.razorpay_signature,
                cart_items:          cartItems,
                customer_email:      customerEmail,
                customer_name:       customerName,
                shipping_address:    shippingAddress,
                draft_order_id:      draftOrderId
              })
            });

            const result = await verifyResp.json();

            if (result.success && result.order_status_url) {
              window.location.href = result.order_status_url;
            } else {
              throw new Error(result.error || 'Order confirmation failed. Please contact support.');
            }
          } catch (verifyErr) {
            showError(verifyErr.message || 'Payment received but order confirmation failed. Contact support with payment ID: ' + response.razorpay_payment_id);
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        showError((response.error && response.error.description) || 'Payment failed. Please try again.');
        setLoading(false);
      });
      rzp.open();

    } catch (err) {
      console.error('[lb-razorpay] checkout error:', err);
      showError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  });

})();
