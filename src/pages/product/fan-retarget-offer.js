import React, { useState, useEffect } from 'react';
import { sendGTMEvent } from '@next/third-parties/google';
import Head from 'next/head';
import Image from 'next/image';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { products } from '@/utils/products';
import { collectOrderMeta } from '@/utils/orderTracking';

const baseProduct = products.find(
  (p) => p.slug === 'portable-high-speed-cooling-fan',
);

// ─── Exclusive retarget offer: fixed discounted price, free delivery ──
const OFFER_PRICE = 1390;
const SHIPPING_CHARGE = 0;
const FREE_ZONE_LABEL = 'ফ্রি ডেলিভারি (VIP অফার)';

const productData = baseProduct
  ? { ...baseProduct, price: OFFER_PRICE }
  : null;

const REVIEW_IMGS = [
  '/assets/product/fan/review1.jpeg',
  '/assets/product/fan/review3.jpeg',
  '/assets/product/fan/review4.jpeg',
];

function CountdownToMidnight() {
  const [left, setLeft] = useState({ h: '00', m: '00', s: '00' });
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const mid = new Date(now);
      mid.setHours(24, 0, 0, 0);
      const diff = Math.max(0, Math.floor((mid - now) / 1000));
      const pad = (n) => String(n).padStart(2, '0');
      setLeft({
        h: pad(Math.floor(diff / 3600)),
        m: pad(Math.floor((diff % 3600) / 60)),
        s: pad(diff % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="rounded-xl px-4 py-3 my-4 bg-white/5 border border-amber-500/25">
      <p className="bangla text-sm font-semibold text-center text-amber-300 mb-2">
        ⏰ VIP অফার শেষ হতে বাকি
      </p>
      <div className="flex items-center justify-center gap-2">
        {[
          { v: left.h, l: 'ঘণ্টা' },
          { v: left.m, l: 'মিনিট' },
          { v: left.s, l: 'সেকেন্ড' },
        ].map((u, i) => (
          <React.Fragment key={u.l}>
            {i > 0 && <span className="text-amber-400 font-black text-2xl mb-4">:</span>}
            <div className="flex flex-col items-center">
              <span className="font-mono font-extrabold text-lg px-3 py-1.5 rounded-lg min-w-[44px] text-center text-white bg-gradient-to-br from-violet-600 to-cyan-500">
                {u.v}
              </span>
              <span className="text-[10px] text-slate-400 bangla mt-1">{u.l}</span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function scrollToForm() {
  const el = document.getElementById('vip-order-form');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

export default function FanRetargetOffer({ product }) {
  const [selectedColor, setSelectedColor] = useState(
    product?.variants?.[0]?.color || '',
  );
  const [activeImage, setActiveImage] = useState(product?.images?.[0] || '');
  const [quantity, setQuantity] = useState(1);

  const [formData, setFormData] = useState({ fullName: '', phoneNumber: '', address: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [placedOrder, setPlacedOrder] = useState(null);

  // view_item for GTM + first-touch attribution capture
  useEffect(() => {
    if (typeof window !== 'undefined' && product) {
      collectOrderMeta();
      sendGTMEvent({ ecommerce: null });
      sendGTMEvent({
        event: 'view_item',
        traffic_source: collectOrderMeta().trafficSource || 'organic',
        ecommerce: {
          currency: 'BDT',
          value: OFFER_PRICE,
          items: [
            {
              item_id: product.id || 'unknown',
              item_name: product.title || 'unknown',
              price: OFFER_PRICE,
              original_price: product.originalPrice || 0,
              item_category: 'Electronics',
              item_variant: 'VIP Retarget Offer',
            },
          ],
        },
      });
    }
  }, [product]);

  // Scroll-reveal (same pattern as hoco page)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('revealed'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); }
      }),
      { threshold: 0.12 },
    );
    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    fetch('/api/submit', { method: 'HEAD' }).catch(() => {});
  }, []);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400 bg-[#080B14]">
        <p className="text-xl font-bold">Product Not Found</p>
      </div>
    );
  }

  const discount = Math.round(
    ((product.originalPrice - OFFER_PRICE) / product.originalPrice) * 100,
  );
  const grandTotal = OFFER_PRICE * quantity;

  const validateForm = () => {
    const e = {};
    if (!formData.fullName.trim()) e.fullName = 'পুরো নাম লিখুন';
    else if (formData.fullName.trim().length < 2) e.fullName = 'নাম কমপক্ষে ২ অক্ষরের হতে হবে';
    if (!formData.phoneNumber) e.phoneNumber = 'ফোন নম্বর দিন';
    else if (!/^(\+880\d{10}|0\d{10})$/.test(formData.phoneNumber))
      e.phoneNumber = 'সঠিক বাংলাদেশী ফোন নম্বর লিখুন';
    if (!formData.address.trim()) e.address = 'ঠিকানা লিখুন';
    else if (formData.address.trim().length < 5) e.address = 'ঠিকানা কমপক্ষে ৫ অক্ষরের হতে হবে';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (isLoading || placedOrder) return;
    if (!validateForm()) return;
    setIsLoading(true);
    setSubmissionError(null);

    if (typeof window !== 'undefined') {
      const meta = collectOrderMeta();
      sendGTMEvent({ ecommerce: null });
      sendGTMEvent({
        event: 'add_to_cart',
        traffic_source: meta.trafficSource || 'organic',
        ecommerce: {
          currency: 'BDT',
          value: grandTotal,
          items: [
            {
              item_id: product.id || 'unknown',
              item_name: product.title || 'unknown',
              price: OFFER_PRICE,
              item_category: 'Electronics',
              item_variant: selectedColor || 'unknown',
              quantity,
            },
          ],
        },
      });
      sendGTMEvent({ ecommerce: null });
      sendGTMEvent({
        event: 'begin_checkout',
        traffic_source: meta.trafficSource || 'organic',
        ecommerce: { currency: 'BDT', value: grandTotal, items: [] },
      });
    }

    const phoneDigits = (formData.phoneNumber || '').replace(/\D/g, '');
    const uniqueId = `${Math.floor(10 + Math.random() * 90)}-${phoneDigits.slice(-4) || '0000'}-${Math.floor(10 + Math.random() * 90)}`;
    const bdtTime = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Dhaka', hour: 'numeric', minute: '2-digit',
      hour12: true, month: 'short', day: '2-digit', year: 'numeric',
    });

    const sheetData = {
      name: formData.fullName || '',
      phone: formData.phoneNumber || '',
      deliveryZone: FREE_ZONE_LABEL,
      address: formData.address || '',
      items: JSON.stringify([
        {
          title: `${product.title} (VIP অফার)`,
          price: OFFER_PRICE,
          quantity,
          image: activeImage || product.images[0] || '',
          variant: selectedColor ? `Color: ${selectedColor}` : 'Standard',
        },
      ]),
      totalPrice: grandTotal,
      shippingCharge: SHIPPING_CHARGE,
      grandTotal,
      orderId: uniqueId,
      orderDate: new Date().toISOString(),
      submissionTime: bdtTime,
      sheetName: 'Orders',
      ...collectOrderMeta(),
    };

    const onSuccess = (serverMeta) => {
      setPlacedOrder({ ...sheetData, orderId: uniqueId, customerType: serverMeta?.customerType });
      const meta = collectOrderMeta();
      sendGTMEvent({ ecommerce: null });
      sendGTMEvent({
        event: 'purchase',
        traffic_source: meta.trafficSource || 'organic',
        ecommerce: {
          transaction_id: uniqueId,
          value: grandTotal,
          currency: 'BDT',
          shipping: 0,
          customer: {
            customer_first_name: formData.fullName || '',
            customer_phone: formData.phoneNumber || '',
            customer_billing_city: formData.address || '',
            billing_country: 'BD',
          },
          items: [
            {
              item_id: product.id || 'unknown',
              item_name: product.title || 'unknown',
              price: OFFER_PRICE,
              quantity,
              item_variant: selectedColor || 'unknown',
              item_category: 'Electronics',
            },
          ],
        },
      });
      setIsLoading(false);
    };

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const res = await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sheetData),
        });
        if (res.ok) { onSuccess(await res.json().catch(() => ({}))); return; }
        if (res.status === 409) { onSuccess({}); return; }
        if (res.status >= 400 && res.status < 500) {
          const err = await res.json().catch(() => ({}));
          setSubmissionError(err.message || 'Failed to submit order.');
          setIsLoading(false);
          return;
        }
        if (attempt < 2) await new Promise((r) => setTimeout(r, 2000));
      } catch {
        if (attempt < 2) await new Promise((r) => setTimeout(r, 2000));
      }
    }
    setSubmissionError(
      'আপনার অর্ডারটি অনলাইনে সাবমিট করা সম্ভব হয়নি। অনুগ্রহ করে +8801814575428 নাম্বারে কল করুন অথবা WhatsApp এ মেসেজ দিন।',
    );
    setIsLoading(false);
  };

  return (
    <>
      <Head>
        <title>{`${product.title} — VIP অফার ৳${OFFER_PRICE} | Sheii Shop`}</title>
        {/* Private retargeting URL — keep out of search indexes */}
        <meta name="robots" content="noindex, nofollow" />
        <meta
          name="description"
          content={`বিশেষ VIP অফার: ${product.title} মাত্র ৳${OFFER_PRICE} টাকায়, ফ্রি ডেলিভারি সহ। শুধুমাত্র আমাদের পুরনো গ্রাহকদের জন্য।`}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org/',
              '@type': 'Product',
              name: product.title,
              image: product.images,
              description: product.description,
              sku: product.id,
              brand: { '@type': 'Brand', name: 'Sheii Shop' },
              offers: {
                '@type': 'Offer',
                priceCurrency: 'BDT',
                price: OFFER_PRICE,
                availability: 'https://schema.org/InStock',
                itemCondition: 'https://schema.org/NewCondition',
              },
            }),
          }}
        />
      </Head>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap');
        .bangla { font-family: 'Hind Siliguri', sans-serif; }
        @keyframes heroIn { from { opacity: 0; transform: translateY(18px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes heroGlow { 0%,100% { opacity: 0.45; transform: scale(1); } 50% { opacity: 0.75; transform: scale(1.06); } }
        @keyframes floatY { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes markerSweep { from { transform: translateY(-44%) skewX(-2deg) scaleX(0); opacity: 0; } to { transform: translateY(-44%) skewX(-2deg) scaleX(1); opacity: 1; } }
        .hero-animate { animation: heroIn 0.7s cubic-bezier(0.22,1,0.36,1) forwards; opacity: 0; }
        .hero-animate-2 { animation: heroIn 0.7s 0.12s cubic-bezier(0.22,1,0.36,1) forwards; opacity: 0; }
        .hero-glow { animation: heroGlow 4s ease-in-out infinite; }
        .float-img { animation: floatY 4.5s ease-in-out infinite; }
        .hero-highlight-wrap { position: relative; display: inline-block; padding: 0 8px 2px; isolation: isolate; }
        .hero-highlight-wrap::before { content: ''; position: absolute; left: -6px; right: -6px; top: 50%; height: 0.62em; background: linear-gradient(90deg, #7C3AED 0%, #8b5cf6 45%, #06B6D4 100%); border-radius: 6px; opacity: 0.96; transform: translateY(-44%) skewX(-2deg) scaleX(0); transform-origin: left center; animation: markerSweep 0.72s 0.35s cubic-bezier(0.22,1,0.36,1) forwards; }
        .hero-highlight-text { position: relative; z-index: 1; color: #fff; }
        [data-reveal] { opacity: 0; transform: translateY(26px); transition: opacity 0.65s cubic-bezier(0.22,1,0.36,1), transform 0.65s cubic-bezier(0.22,1,0.36,1); }
        [data-reveal].revealed { opacity: 1; transform: translateY(0); }
        .card-hover { transition: transform 0.35s cubic-bezier(0.22,1,0.36,1), border-color 0.35s; }
        .card-hover:hover { transform: translateY(-4px); }
        @media (prefers-reduced-motion: reduce) {
          [data-reveal], .hero-animate, .hero-animate-2, .hero-glow, .float-img { animation: none !important; transition: none !important; transform: none !important; opacity: 1 !important; }
        }
      `}</style>

      {/* Sticky top bar */}
      <div className="sticky top-0 z-30 bg-[#080B14]/95 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 lg:px-8 py-2 flex items-center justify-between">
          <span className="text-sm font-bold text-white bangla">
            🎁 VIP অফার — ৳{OFFER_PRICE} + ফ্রি ডেলিভারি
          </span>
          <button
            type="button"
            onClick={scrollToForm}
            className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs font-bold px-4 py-2 rounded-full bangla"
          >
            অর্ডার করুন
          </button>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-[#080B14] py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-r from-violet-600/20 via-cyan-500/15 to-violet-600/20 rounded-full blur-3xl hero-glow" />
        </div>
        <div className="container mx-auto px-4 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block bg-amber-400/15 border border-amber-400/25 text-amber-300 px-4 py-1.5 rounded-full text-xs font-bold mb-4 bangla hero-animate">
              শুধুমাত্র আমাদের পুরনো গ্রাহকদের জন্য বিশেষ অফার
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold bangla mb-4 leading-tight">
              <span className="hero-highlight-wrap">
                <span className="hero-highlight-text">আবারও স্বাগতম!</span>
              </span>
            </h1>
            <p className="text-[#D9E1F2] text-base md:text-lg bangla mb-6 leading-relaxed hero-animate-2">
              {product.title} — এবার পাচ্ছেন মাত্র{' '}
              <span className="text-white font-bold">৳{OFFER_PRICE} টাকায়</span>{' '}
              সাথে <span className="text-white font-bold">সম্পূর্ণ ফ্রি ডেলিভারি</span>।
              এই লিংকটি শুধু আপনার জন্য, অন্য কোথাও পাবেন না।
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-2 text-sm text-[#9BA8BF] bangla hero-animate-2">
              <span className="bg-white/10 px-3 py-1.5 rounded-full backdrop-blur">৳{OFFER_PRICE} টাকা</span>
              <span className="bg-white/10 px-3 py-1.5 rounded-full backdrop-blur">🚚 ফ্রি ডেলিভারি</span>
              <span className="bg-white/10 px-3 py-1.5 rounded-full backdrop-blur">Cash on Delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* Product card */}
      <section className="bg-gradient-to-b from-[#080B14] to-[#0B1020] py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div data-reveal className="max-w-md mx-auto">
            <div className="rounded-2xl border-2 border-transparent bg-gradient-to-br from-violet-600/20 to-cyan-500/20 shadow-[0_0_20px_rgba(124,58,237,0.25)] p-5 md:p-6">
              <div className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 bg-amber-400/15 text-amber-300 border border-amber-400/25 bangla">
                🔥 {discount}% ছাড় + ফ্রি ডেলিভারি
              </div>
              <div className="relative w-full h-48 md:h-56 mb-4 rounded-xl overflow-hidden bg-[#0B1020] border border-white/10 p-2">
                <Image
                  src={activeImage}
                  alt={product.title}
                  fill
                  className="object-contain float-img"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
              <div className="flex justify-center gap-2 mb-4">
                {product.images.slice(0, 3).map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`rounded-lg overflow-hidden transition-all ${activeImage === img ? 'ring-2 ring-cyan-400 opacity-100' : 'opacity-50 hover:opacity-90'}`}
                    style={{ width: 56, height: 56 }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
              <h3 className="text-lg font-bold text-white bangla mb-1 leading-tight">{product.title}</h3>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-2xl font-extrabold text-white">৳{OFFER_PRICE}</span>
                <span className="text-sm text-slate-400 line-through mb-0.5">৳{product.originalPrice}</span>
                <span className="text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 rounded-full bangla mb-0.5">
                  🚚 ডেলিভারি ফ্রি
                </span>
              </div>
              <div className="mb-4">
                <p className="text-sm font-semibold text-slate-300 mb-2 bangla">
                  রঙ বেছে নিন: <span className="text-cyan-300">{selectedColor}</span>
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  {product.variants.map((v) => {
                    const bg = (v.color || '').toLowerCase() === 'mistyrose' ? '#ffd9dc' : (v.color || '#888').toLowerCase();
                    const isSel = selectedColor === v.color;
                    return (
                      <button
                        key={v.color}
                        type="button"
                        title={v.color}
                        onClick={() => setSelectedColor(v.color)}
                        style={{
                          backgroundColor: bg, width: 34, height: 34, borderRadius: '50%',
                          outline: isSel ? '3px solid #22d3ee' : 'none', outlineOffset: 3,
                          transform: isSel ? 'scale(1.15)' : 'scale(1)', cursor: 'pointer',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <span className="text-sm font-bold text-white bangla">পরিমাণ</span>
                <div className="flex items-center border border-white/20 rounded-lg overflow-hidden">
                  <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-4 py-2 text-white hover:bg-white/10 font-bold text-lg">−</button>
                  <span className="px-4 py-2 font-semibold text-white min-w-[44px] text-center text-sm">{quantity}</span>
                  <button type="button" onClick={() => setQuantity((q) => Math.min(99, q + 1))} className="px-4 py-2 text-white hover:bg-white/10 font-bold text-lg">+</button>
                </div>
              </div>
              <CountdownToMidnight />
            </div>
          </div>

          {/* Order Now CTA — scrolls to the form at the bottom */}
          <div data-reveal className="max-w-md mx-auto mt-6 text-center">
            <button
              type="button"
              onClick={scrollToForm}
              className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-extrabold py-4 rounded-xl text-lg bangla hover:opacity-90 transition-opacity shadow-[0_8px_30px_rgba(124,58,237,0.35)]"
            >
              🛍️ এখনই অর্ডার করুন — ৳{grandTotal}
            </button>
            <p className="text-[#9BA8BF] text-xs bangla mt-2">
              ফ্রি ডেলিভারি 🚚 — ক্যাশ অন ডেলিভারি
            </p>
          </div>

          {/* Trust strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-8">
            {[
              { t: 'ফ্রি ডেলিভারি', d: 'কোনো চার্জ নেই' },
              { t: 'ক্যাশ অন ডেলিভারি', d: 'পণ্য হাতে পেয়ে টাকা' },
              { t: '৬ মাসের ওয়ারেন্টি', d: 'রিপ্লেসমেন্ট গ্যারান্টি' },
              { t: 'আসল পণ্য', d: 'চেক করে পাঠানো হয়' },
            ].map((c, i) => (
              <div key={i} data-reveal className="bg-white/5 rounded-xl p-4 text-center border border-white/10 card-hover">
                <h3 className="font-bold text-white text-sm bangla mb-1">{c.t}</h3>
                <p className="text-[#9BA8BF] text-xs bangla">{c.d}</p>
              </div>
            ))}
          </div>

          {/* Mini reviews */}
          <div className="max-w-4xl mx-auto mt-10">
            <h2 data-reveal className="text-xl font-extrabold text-white bangla text-center mb-4">
              গ্রাহকরা কী বলছেন?
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {REVIEW_IMGS.map((src, i) => (
                <div key={i} data-reveal className="rounded-xl overflow-hidden border border-white/10 bg-white/5">
                  <img src={src} alt={`রিভিউ ${i + 1}`} className="w-full h-40 md:h-56 object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Inline order form (no dialog, no delivery charge) ─── */}
      <section id="vip-order-form" className="bg-slate-100 py-14 scroll-mt-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-xl">
          <div data-reveal className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-xl">
            {placedOrder ? (
              <div className="text-center py-4">
                <div className="w-20 h-20 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 bangla mb-2">ধন্যবাদ! অর্ডার কনফার্ম হয়েছে 🎉</h2>
                <p className="text-slate-600 text-sm bangla mb-3">
                  আমাদের টিম শীঘ্রই কল করে কনফার্ম করবে। ডেলিভারি সম্পূর্ণ ফ্রি।
                </p>
                <div className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
                  অর্ডার ID: #{placedOrder.orderId}
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-sm space-y-1.5">
                  <p className="text-slate-600 bangla"><span className="text-slate-400">পণ্যটি:</span> {product.title} × {quantity}</p>
                  <p className="text-slate-600 bangla"><span className="text-slate-400">রঙ:</span> {selectedColor}</p>
                  <p className="text-slate-600 bangla"><span className="text-slate-400">ডেলিভারি:</span> ফ্রি 🚚</p>
                  <p className="text-slate-900 font-bold bangla pt-1 border-t border-slate-200">সর্বমোট: ৳{grandTotal}</p>
                </div>
                <p className="text-xs text-slate-500 bangla mt-4">
                  সাহায্য লাগলে: <a href="tel:+8801609596652" className="text-cyan-600 font-bold">01609-596652</a>
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-extrabold text-slate-900 bangla text-center mb-1">
                  অর্ডার করতে ফর্মটি পূরণ করুন
                </h2>
                <p className="text-slate-500 bangla text-sm text-center mb-6">
                  {product.title} × {quantity} — <span className="text-slate-900 font-bold">৳{grandTotal}</span> (ডেলিভারি ফ্রি 🚚)
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="vip-name" className="block text-sm font-medium text-slate-700 mb-1 bangla">আপনার নাম</label>
                    <input
                      id="vip-name" type="text" placeholder="পুরো নাম লিখুন"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="py-2.5 px-3 border border-slate-200 w-full rounded-lg text-base bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                    />
                    {errors.fullName && <p className="text-red-600 text-xs mt-1 bangla">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label htmlFor="vip-phone" className="block text-sm font-medium text-slate-700 mb-1 bangla">মোবাইল নম্বর</label>
                    <PhoneInput
                      id="vip-phone" defaultCountry="BD" placeholder="মোবাইল নম্বর দিন"
                      value={formData.phoneNumber}
                      onChange={(v) => setFormData({ ...formData, phoneNumber: v || '' })}
                      className="py-2.5 px-3 border border-slate-200 w-full rounded-lg text-base bg-slate-50 text-slate-900 [&_input]:bg-transparent [&_input]:outline-none [&_input]:text-slate-900"
                    />
                    {errors.phoneNumber && <p className="text-red-600 text-xs mt-1 bangla">{errors.phoneNumber}</p>}
                  </div>
                  <div>
                    <label htmlFor="vip-address" className="block text-sm font-medium text-slate-700 mb-1 bangla">ডেলিভারি ঠিকানা</label>
                    <input
                      id="vip-address" type="text" placeholder="এলাকার নাম, থানা, জেলার নাম লিখুন"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="py-2.5 px-3 border border-slate-200 w-full rounded-lg text-base bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                    />
                    {errors.address && <p className="text-red-600 text-xs mt-1 bangla">{errors.address}</p>}
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                    <div className="flex justify-between text-slate-600 mb-1.5 bangla"><span>পণ্যের দাম ({quantity}টি)</span><span>৳{grandTotal}</span></div>
                    <div className="flex justify-between text-slate-600 mb-1.5 bangla"><span>ডেলিভারি চার্জ</span><span className="text-emerald-600 font-bold">ফ্রি</span></div>
                    <div className="flex justify-between font-bold text-slate-900 text-base pt-2 border-t border-slate-200 bangla"><span>সর্বমোট</span><span>৳{grandTotal}</span></div>
                  </div>

                  {submissionError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm bangla">{submissionError}</div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-extrabold py-3.5 rounded-xl text-base tracking-wide bangla hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isLoading ? 'কনফার্ম হচ্ছে...' : `৳${grandTotal} — অর্ডার কনফার্ম করুন`}
                  </button>
                  <p className="text-center text-xs text-slate-500 bangla">ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে টাকা দিবেন</p>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Mobile sticky bottom bar */}
      {!placedOrder && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#080B14]/95 backdrop-blur-md border-t border-white/10 md:hidden">
          <div className="flex items-center justify-between px-4 py-3 gap-3">
            <div className="text-sm">
              <p className="text-white font-bold bangla">৳{grandTotal} <span className="text-[10px] font-normal text-emerald-400">+ ফ্রি ডেলিভারি</span></p>
              <p className="text-[#9BA8BF] text-xs bangla">{quantity}টি — {selectedColor}</p>
            </div>
            <button
              type="button"
              onClick={scrollToForm}
              className="flex-shrink-0 font-bold px-5 py-3 rounded-xl text-sm bangla bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg"
            >
              অর্ডার করুন →
            </button>
          </div>
        </div>
      )}
      <div className="h-16 md:hidden" />
    </>
  );
}

export async function getStaticProps() {
  if (!productData) return { notFound: true };
  return { props: { product: productData }, revalidate: 60 };
}
