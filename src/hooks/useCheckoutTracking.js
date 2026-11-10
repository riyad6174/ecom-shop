// Abandoned-cart tracking for checkout forms.
//
// Once the form holds a valid Bangladeshi phone number, the checkout data is
// sent (debounced) to /api/checkout/track, which upserts one record per
// checkout session. Each real change to the form refreshes the record's
// lastActivityAt. Detection itself happens on the server (cron sweep over
// lastActivityAt), so it works even if the customer closes the browser. The
// browser only reports activity.
//
// Usage:
//   const checkout = useCheckoutTracking({ name, phone, ... }, { enabled });
//   // in the submit payload:   checkoutSessionId: checkout.getSessionId()
//   // after a successful order: checkout.markCompleted()
import { useCallback, useEffect, useRef } from 'react';
import { collectOrderMeta } from '@/utils/orderTracking';

const STORAGE_KEY = 'sheishop_checkout_session_v1';
const SESSION_MAX_IDLE_MS = 24 * 60 * 60 * 1000; // start a fresh session after a day
const DEBOUNCE_MS = 1500;
const ENDPOINT = '/api/checkout/track';

export function isTrackablePhone(phone) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('880')) digits = `0${digits.slice(3)}`;
  return /^01[3-9]\d{8}$/.test(digits);
}

/** Cart items → the shape stored on the checkout session (mirrors /api/submit). */
export function toTrackedItems(cartItems = []) {
  return cartItems.map((item) => ({
    id: String(item.id || ''),
    title: item.title || 'Unknown',
    price: item.price || 0,
    quantity: item.quantity || 1,
    image: item.image || '',
    variant:
      item.variant ||
      (item.selectedColor ? `Color: ${item.selectedColor}` : '') ||
      (item.selectedVariantValue ? `Type: ${item.selectedVariantValue}` : '') ||
      'Standard',
  }));
}

function newSessionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function readStoredSession() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.id || Date.now() - (parsed.ts || 0) > SESSION_MAX_IDLE_MS) return null;
    return parsed.id;
  } catch {
    return null;
  }
}

function storeSession(id) {
  try {
    if (id) window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ id, ts: Date.now() }));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage blocked: the id still lives in memory for this page view
  }
}

/**
 * @param {object} data  { name, phone, deliveryZone, address, items, totalPrice,
 *                         shippingCharge, grandTotal, couponCode }
 * @param {object} opts  { enabled = true } — when false, nothing new is scheduled
 *                       (a pending update is still flushed)
 */
export default function useCheckoutTracking(data, { enabled = true } = {}) {
  const sessionIdRef = useRef(null);
  const timerRef = useRef(null);
  const pendingRef = useRef(null); // serialized form data waiting to be sent
  const lastSentRef = useRef(null); // last serialized form data sent
  // Phone of the order just completed: tracking stays paused until the phone
  // field changes, so post-order state changes (cart cleared, form reset)
  // never open a new session for an order that was already placed.
  const completedPhoneRef = useRef(null);

  // Stable id for this checkout attempt. Persisted so a page refresh keeps
  // updating the same record instead of creating a new one.
  const getSessionId = useCallback(() => {
    if (typeof window === 'undefined') return '';
    if (!sessionIdRef.current) {
      sessionIdRef.current = readStoredSession() || newSessionId();
      storeSession(sessionIdRef.current);
    }
    return sessionIdRef.current;
  }, []);

  const send = useCallback(
    (serialized, { beacon = false } = {}) => {
      if (!serialized) return;
      lastSentRef.current = serialized;
      pendingRef.current = null;
      const sessionId = getSessionId();
      storeSession(sessionId); // refresh idle timestamp
      const meta = collectOrderMeta();
      const body = JSON.stringify({
        ...JSON.parse(serialized),
        sessionId,
        pageUrl: meta.pageUrl || '',
        trafficSource: meta.trafficSource || '',
        deviceType: meta.deviceType || '',
      });
      // sendBeacon survives page close; keepalive fetch is the fallback
      if (beacon && navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: 'application/json' }))) {
        return;
      }
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {});
    },
    [getSessionId],
  );

  const flush = useCallback(
    (opts) => {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      if (pendingRef.current) send(pendingRef.current, opts);
    },
    [send],
  );

  const serialized = JSON.stringify({
    name: data.name || '',
    phone: data.phone || '',
    deliveryZone: data.deliveryZone || '',
    address: data.address || '',
    items: data.items || [],
    totalPrice: data.totalPrice || 0,
    shippingCharge: data.shippingCharge || 0,
    grandTotal: data.grandTotal || 0,
    couponCode: data.couponCode || '',
  });
  const phone = data.phone || '';
  if (completedPhoneRef.current !== null && completedPhoneRef.current !== phone) {
    completedPhoneRef.current = null; // customer started a different checkout
  }
  const trackable =
    isTrackablePhone(phone) &&
    (data.items || []).length > 0 &&
    completedPhoneRef.current === null;

  // Debounced progressive updates: only real changes count as activity
  useEffect(() => {
    if (!trackable) {
      // No valid phone / empty cart / just ordered → nothing to track
      clearTimeout(timerRef.current);
      pendingRef.current = null;
      return;
    }
    if (!enabled) {
      flush();
      return;
    }
    if (serialized === lastSentRef.current) return;
    pendingRef.current = serialized;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => flush(), DEBOUNCE_MS);
  }, [serialized, trackable, enabled, flush]);

  // Customer leaves / switches app / closes tab → send what we have now
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') flush({ beacon: true });
    };
    const onPageHide = () => flush({ beacon: true });
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', onPageHide);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', onPageHide);
      flush({ beacon: true }); // unmount (e.g. client-side navigation)
    };
  }, [flush]);

  // Call after the order was accepted. The server already marked the
  // session completed (via checkoutSessionId on /api/submit). Here we drop
  // queued updates and retire the id so the next checkout gets a new one.
  const markCompleted = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = null;
    pendingRef.current = null;
    lastSentRef.current = serialized; // the form still shows this data
    completedPhoneRef.current = phone;
    sessionIdRef.current = null;
    storeSession(null);
  }, [serialized, phone]);

  return { getSessionId, markCompleted };
}
