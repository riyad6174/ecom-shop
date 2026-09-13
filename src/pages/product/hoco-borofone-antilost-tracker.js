import React, { useState, useEffect, useRef } from 'react';
import { sendGTMEvent } from '@next/third-parties/google';
import { useDispatch } from 'react-redux';
import Navbar from '@/components/common/Navbar';
import { products } from '@/utils/products';
import { addToCart, clearCart } from '@/store/cartSlice';
import Footer from '@/components/common/Footer';
import Head from 'next/head';
import Image from 'next/image';
import OrderDialog from '@/components/checkout/OrderDialog';
import Link from 'next/link';
import {
  FaMotorcycle,
  FaBicycle,
  FaCar,
  FaTaxi,
  FaTools,
  FaBox,
  FaCheckCircle,
  FaCheck,
  FaTimes,
  FaInfoCircle,
  FaPhoneAlt,
  FaSearch,
  FaShieldAlt,
  FaComments,
  FaAward,
  FaStar,
  FaHandshake,
} from 'react-icons/fa';

const productData = products.find(
  (p) => p.slug === 'hoco-borofone-antilost-tracker',
);

const BOROFONE_IMG = '/assets/product/tracker/borofone-bc110-product-dark-floating.png';
const HOCO_IMG = '/assets/product/tracker/hoco-e103-product-dark-floating.png';

const useCases = [
  { Icon: FaMotorcycle, title: 'বাইক চুরি', desc: 'রাতে গ্যারেজ থেকে সরিয়ে নিলে ফোনে শেষ লোকেশন দেখুন' },
  { Icon: FaBicycle, title: 'বাইসাইকেল হারালে', desc: 'কলেজ/বাজার থেকে হারিয়ে গেলে ম্যাপে খুঁজে নিন' },
  { Icon: FaCar, title: 'সিএনজি চুরি', desc: 'ভাড়ায় গিয়ে ফেরত না এলে বা চুরি হলে লোকেশন ট্র্যাক' },
  { Icon: FaTaxi, title: 'অটো হারালে', desc: 'স্ট্যান্ড বা রাস্তায় হারিয়ে গেলে Ring বাজিয়ে খুঁজুন' },
  { Icon: FaTools, title: 'লুকানো ডিজাইন', desc: 'সিটের নিচে/টুলবক্সে — চোর সহজে খুঁজে পাবে না' },
  { Icon: FaBox, title: 'হারালে খুঁজুন', desc: 'হেলমেট, ব্যাগ বা কাগজপত্র হারালেও কাজে আসবে' },
];

const resetSteps = [
  'Tracker-টি phone app থেকে remove/unpair করুন।',
  'Battery খুলে ৩০–৬০ সেকেন্ড অপেক্ষা করুন।',
  'Battery পুনরায় insert করুন এবং sound/indicator confirm করুন।',
  'App বন্ধ করে আবার খুলে নতুন করে add করুন।',
  'অন্য ফোনে আগে paired থাকলে সেই account/device থেকে remove হয়েছে কিনা নিশ্চিত করুন।',
];

const initialReviews = [
  { name: 'রাহিম', initials: 'র', badge: 'বাইক - চুরি থেকে বাঁচল', quote: 'গলি থেকে বাইক সরিয়ে নিয়েছিল, ফোনে লোকেশন দেখে ২ ঘণ্টায় খুঁজে পেয়েছি। ৯৯৯ টাকায় বড় বাঁচা।' },
  { name: 'সাবরিনা', initials: 'স', badge: 'সিএনজি মালিক', quote: 'ড্রাইভার রাতে সিএনজি নিয়ে কোথায় যায় টেনশন হতো, এখন ম্যাপে দেখি — চুরির ভয় অনেক কম।' },
  { name: 'তানভীর', initials: 'ত', badge: 'অটো চালক', quote: 'স্ট্যান্ডে অটো হারিয়ে গিয়েছিল, Ring বাজাতেই পাশের গলিতে পেয়ে গেলাম।' },
  { name: 'নাজমুল', initials: 'ন', badge: 'বাইসাইকেল', quote: 'কলেজ থেকে সাইকেল চুরি হয়েছিল ভেবেছিলাম, শেষ লোকেশন দেখে দারোয়ানের কাছে পেলাম।' },
  { name: 'ফারহানা', initials: 'ফ', badge: 'Support', quote: 'ভাইয়া বুঝিয়ে দিলেন সিটের নিচে কীভাবে লুকাতে হয় যাতে চোর না পায়।' },
  { name: 'ইমরান', initials: 'ই', badge: 'Value', quote: 'বাইক আর অটোর জন্য দুটি নিলাম ১৯৯৮ টাকায় — একটা চুরি ঠেকাতে পারলেই উসুল।' },
];

const faqData = [
  {
    q: 'চুরি হলে কীভাবে খুঁজে পাব?',
    a: 'গাড়িতে লুকানো ট্র্যাকার Apple Find My / Google Find Hub নেটওয়ার্কে শেষ লোকেশন পাঠায়। চুরি হলে ফোনে ম্যাপে লোকেশন দেখে পুলিশকে দেখাতে পারবেন। কাছে গেলে Ring বাজিয়ে সঠিক জায়গা চিহ্নিত করুন।',
  },
  {
    q: 'চোর ট্র্যাকার খুলে ফেললে?',
    a: 'এটা ছোট ও লুকানো ডিজাইন — সিটের নিচে, টুলবক্স বা ড্যাশবোর্ডের ভেতরে রাখলে চোর সহজে খুঁজে পায় না। HOCO E103-এ সিলিকন কভার থাকায় আরও টেকসই ও গোপন থাকে।',
  },
  {
    q: 'বাইক/সিএনজি/অটোতে কোথায় লুকিয়ে রাখব?',
    a: 'বাইকের সিটের নিচে, টুলবক্সে বা হেলমেট বক্সে; সিএনজি/অটোর ড্যাশবোর্ড, সিটের ফাঁকে বা ব্যাটারি বক্সের পাশে—যেখানে ধুলা-পানি কম লাগে।',
  },
  {
    q: 'হারিয়ে গেলে বা ভুলে রাখলে কী হবে?',
    a: 'হারালে বা পার্কিংয়ে ভুলে গেলে ফোনে “Play Sound” দিলে কাছাকাছি থাকলে Ring বাজবে, দূরে থাকলে ম্যাপে শেষ লোকেশন দেখাবে।',
  },
];

function ProductCard({ variant, isSelected, onToggle }) {
  const isBorofone = variant.type.includes('Borofone');
  const badgeText = isBorofone ? 'Borofone BC110' : 'HOCO E103';
  const badgeClass = 'bg-white/10 text-white border border-white/20';
  const imgSrc = isBorofone ? BOROFONE_IMG : HOCO_IMG;

  return (
    <div
      onClick={onToggle}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
      className={`relative rounded-2xl border-2 p-3 md:p-5 cursor-pointer transition-all duration-300 card-hover ${
        isSelected
          ? 'border-transparent bg-gradient-to-br from-violet-600/20 to-cyan-500/20 shadow-[0_0_20px_rgba(124,58,237,0.25)]'
          : 'border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/20 hover:bg-white/[0.07]'
      }`}
      style={
        isSelected
          ? { borderImage: 'linear-gradient(135deg, #7C3AED, #06B6D4) 1', borderColor: 'transparent' }
          : undefined
      }
    >
      {isSelected && (
        <div className="absolute top-3 right-3 w-7 h-7 bg-gradient-to-r from-violet-600 to-cyan-500 rounded-full flex items-center justify-center shadow-lg pop-check">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      <div className={`inline-block px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold mb-2 md:mb-3 ${badgeClass}`}>
        {badgeText}
      </div>
      <div className="relative w-full h-32 md:h-48 mb-3 md:mb-4 rounded-xl overflow-hidden bg-[#0B1020] border border-white/10 p-2">
        <Image src={imgSrc} alt={variant.type} fill className="object-contain float-img" sizes="(max-width: 768px) 100vw, 50vw" style={{ animationDelay: isBorofone ? '0s' : '0.9s' }} />
      </div>
      <h3 className="text-sm md:text-lg font-bold text-white bangla mb-1 leading-tight">{variant.type}</h3>
      <p className="text-xs md:text-sm text-[#D9E1F2] bangla mb-2 md:mb-3 line-clamp-2">
        {isBorofone
          ? 'বাইক/সাইকেলের সিটের নিচে লুকিয়ে রাখুন — চোর টের পাবে না'
          : 'অটো/সিএনজির ড্যাশবোর্ডে লুকিয়ে রাখুন — চুরি হলে লোকেশন দেখুন'}
      </p>
      <ul className="space-y-1 mb-3 md:mb-4 hidden md:block">
        <li className="text-xs text-[#9BA8BF] bangla">• চুরি/হারালে ফোনে লোকেশন ট্র্যাক</li>
        <li className="text-xs text-[#9BA8BF] bangla">• কাছে থাকলে Ring বাজিয়ে খুঁজুন</li>
        <li className="text-xs text-[#9BA8BF] bangla">• Apple Find My + Google Find Hub — উভয় ফোনে চলে</li>
      </ul>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 pt-2 md:pt-3 border-t border-white/10">
        <span className="text-base md:text-lg font-extrabold text-white">৳৯৯৯ <span className="text-xs md:text-sm font-normal text-[#9BA8BF]">টাকা</span></span>
        {isSelected ? (
          <span className="inline-flex items-center justify-center gap-1 text-[11px] md:text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-cyan-500 px-2 md:px-3 py-1 md:py-1.5 rounded-full bangla">
            ✓ নির্বাচিত
          </span>
        ) : (
          <span className="inline-flex justify-center text-[11px] md:text-xs font-bold text-[#9BA8BF] border border-white/20 px-2 md:px-3 py-1 md:py-1.5 rounded-full bangla">নির্বাচন করুন</span>
        )}
      </div>
    </div>
  );
}

function QuantityPanel({ selectedItems, onQtyChange, onRemove, onCheckout, checkoutDisabled }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg border border-white/10 p-6 animate-[fadeIn_0.3s_ease-out]">
      <h3 className="text-xl font-bold text-white bangla mb-4">আপনার selection</h3>
      <div className="space-y-4 mb-6">
        {selectedItems.map((item) => (
          <div key={item.variantKey} className="flex items-center gap-3 p-3 bg-white rounded-xl flex-wrap sm:flex-nowrap">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0 border border-gray-100">
              <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate bangla">{item.name}</p>
              <p className="text-xs text-gray-500">৳{item.price} টাকা</p>
            </div>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden flex-shrink-0">
              <button
                type="button"
                onClick={() => onQtyChange(item.variantKey, 'decrement')}
                aria-label="Decrease quantity"
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 font-bold text-lg leading-none"
              >
                −
              </button>
              <span className="px-3 py-2 font-semibold text-gray-800 min-w-[36px] text-center text-sm">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => onQtyChange(item.variantKey, 'increment')}
                aria-label="Increase quantity"
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 font-bold text-lg leading-none"
              >
                +
              </button>
            </div>
            <p className="font-bold text-gray-900 text-sm min-w-[60px] text-right hidden sm:block">
              ৳{(item.price * item.quantity).toFixed(0)}
            </p>
            <button
              type="button"
              onClick={() => onRemove(item.variantKey)}
              className="text-red-400 hover:text-red-600 text-xs sm:text-sm flex-shrink-0"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onCheckout}
        disabled={checkoutDisabled}
        className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold py-3.5 rounded-xl text-sm tracking-wide transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed bangla"
      >
        Quantity নিশ্চিত করে checkout-এ যান
      </button>
      <p className="text-center text-xs text-[#9BA8BF] mt-2 bangla">
        পরের ধাপে আপনার delivery details নেওয়া হবে।
      </p>
    </div>
  );
}

const SetupSection = () => {
  const [tab, setTab] = useState('HOCO');

  const videoConfig = {
    HOCO: {
      id: 'H6m1ESYHupc',
      title: 'HOCO E103 — Android Connect',
      label: 'HOCO E103',
    },
    Borofone: {
      id: 'O3aIk3nChgA',
      title: 'Borofone BC110 — Android Connect',
      label: 'Borofone BC110',
    },
  };

  const stepsMap = {
    HOCO: [
      'Tracker-এর battery tab খুলে device activate করুন।',
      'Android-এ Google Find Hub / Find My Device চালু করুন।',
      'Add device → Compatible tracker / Hoco E103 নির্বাচন করুন।',
      'স্ক্রিনে Hoco E103 select করে pairing confirm করুন।',
      'নাম দিন যেমন "আমার বাইক" বা "আমার অটো"।',
      'গাড়িতে লুকিয়ে রেখে Ring / last-known-location test করুন।',
    ],
    Borofone: [
      'Tracker-এর battery tab খুলে device activate করুন।',
      'Android-এ Google Find Hub / Find My Device চালু করুন।',
      'Add device → Borofone BC110 নির্বাচন করুন।',
      'স্ক্রিনে Borofone BC110 select করে pairing confirm করুন।',
      'নাম দিন যেমন "আমার বাইক" বা "আমার সিএনজি"।',
      'গাড়িতে লুকিয়ে রেখে Ring / last-known-location test করুন।',
    ],
  };

  const steps = stepsMap[tab];
  const current = videoConfig[tab];

  return (
    <section className="bg-[#0B1020] py-16">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <div className="text-center mb-8">
          <h2 data-reveal className="text-2xl md:text-3xl font-extrabold text-white bangla mb-2">
            বাইক/অটোতে লাগিয়ে ফোনে connect করবেন কীভাবে?
          </h2>
          <p data-reveal data-reveal-delay="1" className="text-[#D9E1F2] bangla text-sm">
            Android দিয়ে HOCO / Borofone — ভিডিও দেখে ১ মিনিটেই pair করুন
          </p>
        </div>
        <div data-reveal data-reveal-delay="2" className="flex justify-center gap-2 mb-6">
          {Object.keys(videoConfig).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all bangla ${
                tab === key
                  ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg'
                  : 'bg-white/10 text-[#9BA8BF] hover:bg-white/20 border border-white/10'
              }`}
            >
              {videoConfig[key].label}
            </button>
          ))}
        </div>
        <div data-reveal="scale" className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/10">
          <div className="aspect-video bg-black relative border-b border-white/10">
            <iframe
              key={current.id}
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${current.id}?rel=0&modestbranding=1`}
              title={current.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
          <div className="p-6">
            <p className="text-sm font-bold text-white bangla mb-4 text-center">
              {current.title} — Android setup (১ মিনিট)
            </p>
            <ol className="space-y-3">
              {steps.map((step, i) => (
                <li key={i} data-reveal data-reveal-delay={String((i % 3) + 1)} className="flex gap-3 text-sm text-[#D9E1F2] bangla">
                  <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <p className="text-xs text-[#9BA8BF] bangla mt-4 bg-[#080B14] p-3 rounded-lg border border-white/10">টিপস: গাড়ির নাম দিন “আমার বাইক” / “আমার অটো” — পরে খুঁজতে সুবিধা হবে</p>
            <div className="flex justify-center mt-4">
              <a
                href={`https://youtu.be/${current.id}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-cyan-400 hover:text-cyan-300 underline bangla"
              >
                YouTube-এ খুলুন →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ResetSection = () => {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <section className="bg-[#080B14] py-16">
      <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
        <h2 data-reveal className="text-2xl font-extrabold text-white bangla text-center mb-8">
          গাড়িতে রেখে connect না হলে reset কীভাবে?
        </h2>
        <div className="space-y-3">
          {resetSteps.map((step, i) => (
            <div
              key={i}
              data-reveal
              data-reveal-delay={String((i % 3) + 1)}
              className="border border-white/10 rounded-xl overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="text-sm font-semibold text-white bangla flex items-center gap-2">
                  <span className="w-6 h-6 bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  {step}
                </span>
                <span className={`text-[#9BA8BF] transition-transform text-xl leading-none ${openIdx === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              {openIdx === i && (
                <div className="px-5 py-3 text-sm text-[#D9E1F2] bangla bg-white/[0.03]">
                  নির্দেশনা অনুসরণ করুন। সমস্যা থাকলে নিচের support নম্বরে যোগাযোগ করুন।
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-white/5 border border-violet-500/20 rounded-xl text-center">
          <p className="text-sm text-[#D9E1F2] bangla font-medium mb-2">
            তবুও কাজ না করলে নিজে বারবার reset না করে আমাদের WhatsApp-এ model name ও সমস্যার ছোট ভিডিও পাঠান।
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a href="https://wa.me/8801814575428" target="_blank" rel="noreferrer" className="text-green-400 font-bold hover:text-green-300">
              WhatsApp: +880 1814-575428
            </a>
            <a href="tel:8801609596652" className="text-cyan-400 font-bold hover:text-cyan-300">
              Phone: +880 1609-596652
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

const reviewImages = [
  'WhatsApp Image 2026-09-12 at 2.59.28 AM.jpeg',
  'WhatsApp Image 2026-09-12 at 2.59.29 AM.jpeg',
  'WhatsApp Image 2026-09-12 at 2.59.29 AM (1).jpeg',
  'WhatsApp Image 2026-09-12 at 2.59.30 AM.jpeg',
  'WhatsApp Image 2026-09-12 at 2.59.30 AM (2).jpeg',
  'WhatsApp Image 2026-09-12 at 2.59.30 AM (3).jpeg',
  'WhatsApp Image 2026-09-12 at 2.59.31 AM.jpeg',
  'WhatsApp Image 2026-09-12 at 2.59.31 AM (1).jpeg',
  'WhatsApp Image 2026-09-12 at 2.59.31 AM (2).jpeg',
  'WhatsApp Image 2026-09-12 at 2.59.32 AM.jpeg',
  'WhatsApp Image 2026-09-12 at 2.59.32 AM (1).jpeg',
  'WhatsApp Image 2026-09-12 at 2.59.32 AM (2).jpeg',
];

const ReviewsSection = () => {
  const [showAll, setShowAll] = useState(false);
  const reviews = showAll ? initialReviews : initialReviews.slice(0, 3);
  const base = '/assets/product/tracker/reviews';

  return (
    <section id="reviews" className="bg-[#0B1020] py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <h2 data-reveal className="text-2xl font-extrabold text-white bangla text-center mb-2">
          যারা ব্যবহার করেছেন, তারা কী বলছেন?
        </h2>
        <p data-reveal data-reveal-delay="1" className="text-[#9BA8BF] bangla text-sm text-center mb-8">বাস্তব কাস্টমারদের WhatsApp রিভিউ — চুরি/হারানো থেকে কীভাবে বাঁচছে</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {reviews.map((r, i) => (
            <div key={i} data-reveal data-reveal-delay={String((i % 3) + 1)} className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 card-hover">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white flex items-center justify-center font-bold text-sm">
                  {r.initials}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm bangla">{r.name}</p>
                  <span className="inline-block px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/20 text-[10px] rounded-full font-medium bangla">
                    {r.badge}
                  </span>
                </div>
              </div>
              <p className="text-[#D9E1F2] text-sm leading-relaxed bangla">{`"${r.quote}"`}</p>
            </div>
          ))}
        </div>
        <div className="text-center mb-4">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-cyan-400 font-bold text-sm bangla hover:text-cyan-300 hover:underline"
          >
            {showAll ? 'কম রিভিউ দেখুন' : 'আরও রিভিউ টেক্সট দেখুন'}
          </button>
        </div>
        <div className="columns-2 md:columns-3 gap-4 space-y-4">
          {reviewImages.map((file, i) => (
            <div key={i} className="break-inside-avoid rounded-2xl overflow-hidden border border-white/10 bg-white/5 card-hover" style={{ contentVisibility: 'auto', containIntrinsicSize: '300px 400px' }}>
              <Image
                src={`${base}/${encodeURIComponent(file)}`}
                alt={`Customer review ${i + 1}`}
                width={400}
                height={650}
                sizes="(max-width: 768px) 50vw, 33vw"
                quality={70}
                loading={i < 2 ? 'eager' : 'lazy'}
                decoding="async"
                style={{ width: '100%', height: 'auto', display: 'block' }}
                priority={i < 2}
              />
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-[#9BA8BF] bangla mt-3">সব {reviewImages.length}টি রিভিউ ছবি লোড করা হয়েছে — স্ক্রল করলে lazy-load হবে</p>
        <div className="text-center mt-6 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('product-selection');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold px-8 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity bangla"
          >
            অন্যরা ব্যবহার করছেন—এবার আপনার প্রয়োজনের tracker বেছে নিন
          </button>
        </div>
      </div>
    </section>
  );
};

const ReturnPolicySection = () => (
  <section className="bg-[#080B14] py-16">
    <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
      <h2 data-reveal className="text-2xl font-extrabold text-white bangla text-center mb-8">
        কোনো সমস্যা হলে কী হবে?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { title: 'Delivery-এর সময় check করুন', desc: 'পণ্য হাতে পেয়ে প্যাকেজিং অক্ষত আছে কিনা এবং মডেল সঠিক কিনা যাচাই করুন।' },
          { title: 'Issue document করুন', desc: 'সমস্যা হলে unboxing ভিডিও, order ID এবং সমস্যার ছবি/ভিডিও সংরক্ষণ করুন।' },
          { title: 'Support-এ যোগাযোগ করুন', desc: '৪৮ ঘণ্টার মধ্যে WhatsApp বা ফোনে আমাদের support টিমকে জানান।' },
        ].map((card, i) => (
          <div key={i} data-reveal data-reveal-delay={String(i + 1)} className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 card-hover">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold mb-3">{i + 1}</div>
            <h3 className="font-bold text-white bangla mb-2 text-sm">{card.title}</h3>
            <p className="text-[#D9E1F2] text-sm leading-relaxed bangla">{card.desc}</p>
          </div>
        ))}
      </div>
      <div className="text-center">
        <Link
          href="/return-policy"
          className="inline-block text-cyan-400 font-bold text-sm bangla hover:text-cyan-300 hover:underline"
        >
          Return policy বিস্তারিত দেখুন →
        </Link>
      </div>
    </div>
  </section>
);

const FAQSection = () => {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <section className="bg-[#0B1020] py-16">
      <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
        <h2 data-reveal className="text-2xl font-extrabold text-white bangla text-center mb-8">
          প্রায়শই জিজ্ঞাসিত প্রশ্নাবলী (FAQ)
        </h2>
        <div className="space-y-3">
          {faqData.map((item, i) => (
            <div key={i} data-reveal data-reveal-delay={String((i % 3) + 1)} className="border border-white/10 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="text-sm font-semibold text-white bangla">{item.q}</span>
                <span className={`text-[#9BA8BF] transition-transform text-xl leading-none ${openIdx === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              {openIdx === i && (
                <div className="px-5 py-3 text-sm text-[#D9E1F2] bangla bg-white/[0.03]">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const GuaranteeSection = () => (
  <section className="bg-[#080B14] py-8">
    <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
      <div
        data-reveal="scale"
        className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.06] backdrop-blur-xl p-6 md:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-cyan-500/20 pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-violet-600 via-violet-500 to-cyan-500 flex flex-col items-center justify-center shadow-xl shadow-violet-600/25 border border-white/15">
              <FaAward className="text-3xl md:text-4xl text-white mb-1 drop-shadow" />
              <span className="text-white font-black text-sm md:text-base leading-none bangla">৬ মাস</span>
              <span className="text-white/80 text-[10px] font-bold tracking-widest">GUARANTEE</span>
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-extrabold text-white bangla mb-2">৬ মাসের গ্যারান্টি</h3>
            <p className="text-[#D9E1F2] bangla text-sm md:text-[15px] leading-relaxed">
              নিশ্চিন্তে ব্যবহার করুন — ডেলিভারির পর <span className="text-white font-bold">৬ মাসের মধ্যে</span> কোনো টেকনিক্যাল ত্রুটি হলে রিপ্লেসমেন্ট পাবেন। গ্লাস-ফিনিশড প্যাকেজিং, চেক করে ডেলিভারি।
            </p>
            <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/10 text-[#D9E1F2] px-3 py-1.5 rounded-full bangla"><FaShieldAlt className="text-cyan-400" /> আসল প্রোডাক্ট</span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/10 text-[#D9E1F2] px-3 py-1.5 rounded-full bangla"><FaHandshake className="text-violet-300" /> সাপোর্ট সহ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const AtAGlanceSection = () => (
  <section className="bg-[#0B1020] py-10">
    <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
      <div
        data-reveal="scale"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-xl p-6 md:p-8 shadow-xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-cyan-500/10 pointer-events-none" />
        <div className="relative">
          <h3 data-reveal className="text-xl md:text-2xl font-extrabold text-white bangla text-center mb-6">
            এক নজরে দেখে নিন
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {[
              { text: 'সীমকার্ড লাগবে না', ok: false },
              { text: 'কোন মাসিক চার্জ লাগবে না', ok: false },
              { text: 'তার কাটাকাটির প্রয়োজন নাই', ok: false },
              { text: 'ফোন থেকেই লোকেশন ট্রাক করতে পারবেন', ok: true },
              { text: 'ব্যাটারি রিপ্লেস করে নিতে পারবেন', ok: true },
              { text: 'ডেডিকেটেড সাপোর্ট টিম', ok: true },
            ].map((item, i) => (
              <div
                key={i}
                data-reveal
                data-reveal-delay={String((i % 3) + 1)}
                className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
              >
                <span
                  className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                    item.ok
                      ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                      : 'bg-red-500/15 border border-red-500/25 text-red-400'
                  }`}
                >
                  {item.ok ? <FaCheck className="text-[11px]" /> : <FaTimes className="text-[11px]" />}
                </span>
                <span className="text-sm font-medium text-white bangla leading-snug">{item.text}</span>
              </div>
            ))}
          </div>
          <div data-reveal className="text-center">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('product-selection');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-extrabold px-8 py-3.5 rounded-xl text-sm hover:opacity-90 transition-opacity bangla shadow-lg shadow-violet-600/20"
            >
              অর্ডার করুন এখনি
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const LiveLocationNoteSection = () => (
  <section className="bg-[#080B14] py-10">
    <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
      <div
        data-reveal
        className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.07] to-orange-500/[0.04] backdrop-blur-xl p-6 md:p-8 shadow-xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-start gap-3 mb-4">
            <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/25 flex items-center justify-center text-amber-400 mt-0.5">
              <FaInfoCircle className="text-base" />
            </span>
            <div>
              <h3 className="text-lg md:text-xl font-extrabold text-white bangla leading-snug">
                গুরুত্বপূর্ণ — সৎ তথ্য জেনে নিন
              </h3>
              <p className="text-amber-200/70 text-xs bangla mt-1">ক্রয়ের আগে সত্যটা জানা জরুরি, তাই স্পষ্ট করে বলছি</p>
            </div>
          </div>
          <div className="bg-[#0B1020]/70 border border-amber-500/15 rounded-2xl p-5 mb-5">
            <p className="text-[#D9E1F2] bangla text-sm md:text-[15px] leading-relaxed">
              এটি আপনাকে <span className="text-white font-bold">লাইভ লোকেশন আপডেট দিতে পারবে না</span>, ডিভাইসটি আপনাকে <span className="text-white font-bold">লাস্ট লোকেশন আর টাইম জানাবে</span>। মার্কেটে অনেকেই আপনাকে হয়তো লাইভ লোকেশন এর কথা বলে বিক্রির চেষ্টা করবে।
            </p>
            <p className="text-[#9BA8BF] bangla text-sm leading-relaxed mt-3">
              ডিভাইসটি কিভাবে কাজ করে জানতে আমাদের কল করতে পারবেন — আমরা বুঝিয়ে দেব লাইভ vs লাস্ট লোকেশন এর পার্থক্য।
            </p>
          </div>
          <div className="text-center">
            <a
              href="tel:+8801609596652"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold px-8 py-3.5 rounded-xl text-sm hover:opacity-90 transition-opacity bangla shadow-lg shadow-amber-500/20"
            >
              <FaPhoneAlt className="text-xs" />
              বিস্তারিত জানতে কল করুন
            </a>
            <p className="text-[#9BA8BF] text-xs bangla mt-2">01609-596652 — সকাল ৯টা থেকে রাত ১০টা</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const AuthenticSection = () => (
  <section className="bg-[#0B1020] py-10">
    <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
      <div
        data-reveal
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.03] backdrop-blur-xl p-6 md:p-8 shadow-xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-cyan-500/10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-400/15 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="relative text-center">
          <div className="inline-flex items-center gap-2 bg-amber-400/15 border border-amber-400/25 text-amber-300 px-3 py-1.5 rounded-full text-xs font-bold mb-4 bangla">
            <FaStar className="text-amber-400" /> হাজারো কাস্টমারের ভরসা
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-white bangla mb-4 leading-tight">ভাবছেন প্রোডাক্ট কি আসলেই কাজ করে?</h3>
          <p className="text-[#D9E1F2] bangla text-sm md:text-[15px] leading-relaxed mb-3">
            চিন্তার কারণ নেই। আমাদের অথেনটিক প্রোডাক্ট অবশ্যই কাজ করবে। <span className="text-white font-semibold">৭ দিন ব্যবহার করে</span> আপনার যদি মনে হয় কাজ করছে না — আপনি <span className="text-white font-semibold">কোনো কন্ডিশন ছাড়াই</span> প্রোডাক্ট রিটার্ন করে দিতে পারবেন।
          </p>
          <p className="text-[#9BA8BF] bangla text-sm leading-relaxed mb-6">
            হাজার হাজার ব্যবহারকারীরা এই ডিভাইসগুলো থেকে উপকৃত হয়েছেন — আপনিও হবেন ইনশাআল্লাহ।
          </p>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('reviews');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity bangla shadow-lg shadow-violet-600/20"
          >
            প্রয়োজনে রিভিউ দেখুন <span aria-hidden>↓</span>
          </button>
        </div>
      </div>
    </div>
  </section>
);

export default function TrackerLandingPage({ product }) {
  const dispatch = useDispatch();
  const [selectedVariants, setSelectedVariants] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [showQuantityPanel, setShowQuantityPanel] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const quantityPanelRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && product) {
      sendGTMEvent({ ecommerce: null });
      sendGTMEvent({
        event: 'view_item',
        ecommerce: {
          currency: 'BDT',
          value: product.price || 0,
          items: [
            {
              item_id: product.id || 'unknown',
              item_name: product.title || 'unknown',
              price: product.price || 0,
              original_price: product.originalPrice || 0,
              item_category: 'Trackers',
              item_variant: 'Hoco E103 + Borofone BC110',
            },
          ],
        },
      });
    }
  }, [product]);

  const handleToggleVariant = (variantType) => {
    const isSelected = selectedVariants.includes(variantType);
    if (isSelected) {
      const next = selectedVariants.filter((v) => v !== variantType);
      setSelectedVariants(next);
      setQuantities((q) => {
        const nextQ = { ...q };
        delete nextQ[variantType];
        return nextQ;
      });
      if (typeof window !== 'undefined') {
        sendGTMEvent({ ecommerce: null });
        sendGTMEvent({
          event: 'product_deselected',
          ecommerce: {
            currency: 'BDT',
            items: [
              {
                item_id: product.id || 'unknown',
                item_name: variantType,
                price: product.price || 0,
                item_category: 'Trackers',
                item_variant: variantType,
              },
            ],
          },
        });
      }
    } else {
      const next = [...selectedVariants, variantType];
      setSelectedVariants(next);
      setQuantities((q) => ({ ...q, [variantType]: 1 }));
      if (typeof window !== 'undefined') {
        sendGTMEvent({ ecommerce: null });
        sendGTMEvent({
          event: 'product_selected',
          ecommerce: {
            currency: 'BDT',
            items: [
              {
                item_id: product.id || 'unknown',
                item_name: variantType,
                price: product.price || 0,
                item_category: 'Trackers',
                item_variant: variantType,
              },
            ],
          },
        });
      }
    }
  };

  useEffect(() => {
    setShowQuantityPanel(selectedVariants.length > 0);
  }, [selectedVariants]);

  useEffect(() => {
    if (showQuantityPanel && quantityPanelRef.current) {
      quantityPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [showQuantityPanel]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('revealed');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    const observeAll = () => {
      document.querySelectorAll('[data-reveal]:not(.revealed)').forEach((el) => {
        if (prefersReduced) el.classList.add('revealed');
        else io.observe(el);
      });
    };
    observeAll();
    if (prefersReduced) return;
    const mo = new MutationObserver(() => observeAll());
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  const handleQtyChange = (variantKey, action) => {
    const current = quantities[variantKey] || 1;
    let next = current;
    if (action === 'increment' && current < 99) next += 1;
    else if (action === 'decrement' && current > 1) next -= 1;
    else return;
    setQuantities((prev) => ({ ...prev, [variantKey]: next }));
    if (typeof window !== 'undefined') {
      sendGTMEvent({ ecommerce: null });
      sendGTMEvent({
        event: 'quantity_changed',
        ecommerce: {
          currency: 'BDT',
          items: [
            {
              item_id: product.id || 'unknown',
              item_name: variantKey,
              price: product.price || 0,
              item_category: 'Trackers',
              item_variant: variantKey,
              quantity: next,
            },
          ],
        },
      });
    }
  };

  const handleRemoveVariant = (variantKey) => {
    setSelectedVariants((prev) => prev.filter((v) => v !== variantKey));
    setQuantities((q) => {
      const next = { ...q };
      delete next[variantKey];
      return next;
    });
    if (typeof window !== 'undefined') {
      sendGTMEvent({ ecommerce: null });
      sendGTMEvent({
        event: 'product_deselected',
        ecommerce: {
          currency: 'BDT',
          items: [
            {
              item_id: product.id || 'unknown',
              item_name: variantKey,
              price: product.price || 0,
              item_category: 'Trackers',
              item_variant: variantKey,
            },
          ],
        },
      });
    }
  };

  const handleCheckout = () => {
    if (selectedVariants.length === 0) return;
    setIsAdding(true);

    if (typeof window !== 'undefined') {
      const value = selectedVariants.reduce(
        (sum, v) => sum + (product.price || 0) * (quantities[v] || 1),
        0,
      );
      sendGTMEvent({ ecommerce: null });
      sendGTMEvent({
        event: 'checkout_opened',
        ecommerce: {
          currency: 'BDT',
          value,
          items: selectedVariants.map((v) => ({
            item_id: product.id || 'unknown',
            item_name: v,
            price: product.price || 0,
            item_category: 'Trackers',
            item_variant: v,
            quantity: quantities[v] || 1,
          })),
        },
      });
      sendGTMEvent({ ecommerce: null });
      sendGTMEvent({
        event: 'add_to_cart',
        ecommerce: {
          currency: 'BDT',
          value,
          items: selectedVariants.map((v) => ({
            item_id: product.id || 'unknown',
            item_name: v,
            price: product.price || 0,
            item_category: 'Trackers',
            item_variant: v,
            quantity: quantities[v] || 1,
          })),
        },
      });
    }

    dispatch(clearCart());
    selectedVariants.forEach((variantType) => {
      dispatch(
        addToCart({
          id: product.id,
          title: product.title,
          slug: product.slug,
          price: product.price,
          selectedColor: variantType,
          quantity: quantities[variantType] || 1,
          image: variantType.includes('Borofone') ? BOROFONE_IMG : HOCO_IMG,
        }),
      );
    });

    setIsOrderDialogOpen(true);
    setIsAdding(false);
  };

  const selectedItems = selectedVariants.map((variantType) => ({
    variantKey: variantType,
    name: variantType,
    price: product.price || 0,
    quantity: quantities[variantType] || 1,
    image: variantType.includes('Borofone') ? BOROFONE_IMG : HOCO_IMG,
  }));

  if (!product) {
    return (
      <>
        <Navbar />
        <div className='min-h-[60vh] flex flex-col items-center justify-center text-slate-500'>
          <p className='text-2xl font-bold mb-2'>Product Not Found</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{`${product.title} | Buy Online in Bangladesh | Sheii Shop`}</title>
        <meta name='description' content={product.shortDescription || product.description} />
        <meta name='robots' content='index, follow' />
        <link rel='canonical' href={`https://www.sheiishop.com/product/${product.slug}`} />
        <meta property='og:type' content='product' />
        <meta property='og:title' content={`${product.title} | Sheii Shop`} />
        <meta property='og:description' content={product.shortDescription || ''} />
        <meta property='og:image' content={BOROFONE_IMG} />
        <meta property='og:url' content={`https://www.sheiishop.com/product/${product.slug}`} />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org/',
              '@type': 'Product',
              name: product.title,
              image: [BOROFONE_IMG, HOCO_IMG],
              description: product.shortDescription || product.description || '',
              sku: product.id || 'unknown',
              brand: { '@type': 'Brand', name: 'Sheii Shop' },
              offers: {
                '@type': 'Offer',
                url: `https://www.sheiishop.com/product/${product.slug}`,
                priceCurrency: 'BDT',
                price: product.price,
                availability: product.inStock
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/OutOfStock',
                itemCondition: 'https://schema.org/NewCondition',
              },
            }),
          }}
        />
      </Head>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap');
        .bangla { font-family: 'Hind Siliguri', sans-serif; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes heroIn { from { opacity: 0; transform: translateY(18px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes heroGlow { 0%,100% { opacity: 0.45; transform: scale(1); } 50% { opacity: 0.75; transform: scale(1.06); } }
        @keyframes floatY { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes popIn { 0% { transform: scale(0.7); opacity: 0; } 60% { transform: scale(1.08); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes gradientShift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes highlightPop { 0% { opacity: 0; transform: translateY(18px) scale(0.96); } 60% { opacity: 1; transform: translateY(-3px) scale(1.03); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes markerSweep { from { transform: translateY(-44%) skewX(-2deg) scaleX(0); opacity: 0; } to { transform: translateY(-44%) skewX(-2deg) scaleX(1); opacity: 1; } }
        @keyframes markerShimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
        .hero-animate { animation: heroIn 0.7s cubic-bezier(0.22,1,0.36,1) forwards; opacity: 0; }
        .hero-animate-2 { animation: heroIn 0.7s 0.12s cubic-bezier(0.22,1,0.36,1) forwards; opacity: 0; }
        .hero-animate-3 { animation: heroIn 0.7s 0.24s cubic-bezier(0.22,1,0.36,1) forwards; opacity: 0; }
        .hero-glow { animation: heroGlow 4s ease-in-out infinite; }
        .float-img { animation: floatY 4.5s ease-in-out infinite; }
        .shimmer-btn { background-size: 200% 100%; animation: shimmer 2.2s linear infinite; }
        .pop-check { animation: popIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .hero-highlight-wrap { position: relative; display: inline-block; padding: 0 8px 2px; isolation: isolate; }
        .hero-highlight-wrap::before { content: ''; position: absolute; left: -6px; right: -6px; top: 50%; height: 0.62em; background: linear-gradient(90deg, #7C3AED 0%, #8b5cf6 45%, #06B6D4 100%); border-radius: 6px; opacity: 0.96; transform: translateY(-44%) skewX(-2deg) scaleX(0); transform-origin: left center; animation: markerSweep 0.72s 0.35s cubic-bezier(0.22,1,0.36,1) forwards; box-shadow: 0 3px 16px rgba(124,58,237,0.35); }
        .hero-highlight-wrap::after { content: ''; position: absolute; left: -6px; right: -6px; top: 50%; height: 0.62em; transform: translateY(-44%) skewX(-2deg); border-radius: 6px; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.22) 50%, transparent 100%); background-size: 200% 100%; opacity: 0; animation: markerShimmer 1.6s 1.15s ease forwards; pointer-events: none; }
        .hero-highlight-text { position: relative; z-index: 1; display: inline-block; color: #fff; text-shadow: 0 1px 10px rgba(0,0,0,0.35); animation: highlightPop 0.62s 0.08s cubic-bezier(0.22,1,0.36,1) both; }
        [data-reveal] { opacity: 0; transform: translateY(26px); transition: opacity 0.65s cubic-bezier(0.22,1,0.36,1), transform 0.65s cubic-bezier(0.22,1,0.36,1); will-change: opacity, transform; }
        [data-reveal].revealed { opacity: 1; transform: translateY(0); }
        [data-reveal="fade"] { transform: none; }
        [data-reveal="scale"] { transform: scale(0.94); }
        [data-reveal="scale"].revealed { transform: scale(1); }
        [data-reveal="left"] { transform: translateX(-24px); }
        [data-reveal="left"].revealed { transform: translateX(0); }
        [data-reveal-delay="1"] { transition-delay: 0.08s; }
        [data-reveal-delay="2"] { transition-delay: 0.16s; }
        [data-reveal-delay="3"] { transition-delay: 0.24s; }
        [data-reveal-delay="4"] { transition-delay: 0.32s; }
        [data-reveal-delay="5"] { transition-delay: 0.40s; }
        .card-hover { transition: transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s, border-color 0.35s; }
        .card-hover:hover { transform: translateY(-4px); }
        .cta-gradient { background-size: 200% 200%; animation: gradientShift 6s ease infinite; }
        @media (prefers-reduced-motion: reduce) {
          [data-reveal], .hero-animate, .hero-animate-2, .hero-animate-3, .hero-glow, .float-img, .shimmer-btn, .cta-gradient, .hero-highlight-wrap::before, .hero-highlight-text { animation: none !important; transition: none !important; transform: none !important; opacity: 1 !important; }
          .hero-highlight-wrap::before { transform: translateY(-44%) skewX(-2deg) scaleX(1) !important; }
        }
      `}</style>

      <Navbar />

      {/* Sticky progress bar */}
      <div className="sticky top-0 z-30 bg-[#080B14]/95 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 lg:px-8 py-2 flex items-center justify-between">
          <span className="text-sm font-bold text-white bangla">Hoco & Borofone Tracker — ৳৯৯৯ টাকা</span>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('product-selection');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs font-bold px-4 py-2 rounded-full bangla"
          >
            অর্ডার করুন
          </button>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-[#080B14] py-12 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-r from-violet-600/20 via-cyan-500/15 to-violet-600/20 rounded-full blur-3xl hero-glow" />
          <div className="absolute bottom-0 right-0 w-[420px] h-[420px] bg-cyan-500/10 rounded-full blur-3xl hero-glow" style={{ animationDelay: '1.2s' }} />
        </div>
        <div className="container mx-auto px-4 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-extrabold bangla mb-4 leading-tight">
              <span className="hero-highlight-wrap">
                <span className="hero-highlight-text">একটু ভেবে দেখুন তো?</span>
              </span>
            </h1>
            <p className="text-[#D9E1F2] text-base md:text-lg bangla mb-6 leading-relaxed hero-animate-2">
              আপনার পছন্দের বাইক, সাইকেল কিংবা আপনার সিএনজি কিংবা অটোরিক্সা হারিয়ে গেলে আপনি আপনার ফোন থেকেই যদি লোকেশন জেনে যেতে পারতেন কত সুবিধা হতো না?
              <span className="block mt-4 text-white font-semibold">নিচে ২ টা প্রোডাক্ট আর বিস্তারিত শেয়ার করছি — দেখুন তো কাজের প্রোডাক্ট কিনা?</span>
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-2 text-sm text-[#9BA8BF] bangla hero-animate-3">
              <span className="bg-white/10 px-3 py-1.5 rounded-full backdrop-blur">৳৯৯৯ টাকা</span>
              <span className="bg-white/10 px-3 py-1.5 rounded-full backdrop-blur">Cash on Delivery</span>
              <span className="bg-white/10 px-3 py-1.5 rounded-full backdrop-blur">Original product</span>
              <span className="bg-white/10 px-3 py-1.5 rounded-full backdrop-blur">Support available</span>
            </div>
          </div>
        </div>
      </section>

      {/* Product Selection */}
      <section id="product-selection" className="bg-gradient-to-b from-[#080B14] to-[#0B1020] py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <h2 data-reveal className="text-2xl md:text-3xl font-extrabold text-white bangla mb-2">চুরি/হারানোর আগেই বেছে নিন</h2>
            <p data-reveal data-reveal-delay="1" className="text-[#9BA8BF] bangla text-sm">দুটোই একই ট্র্যাকার — Hoco E103 বা Borofone BC110, যেটা পছন্দ সেটা নিন। দুই গাড়ি থাকলে দুটোই নিন</p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:gap-6 max-w-4xl mx-auto">
            {product.variants.map((variant, idx) => (
              <div key={variant.type} data-reveal data-reveal-delay={idx === 0 ? '1' : '2'}>
                <ProductCard
                  variant={variant}
                  isSelected={selectedVariants.includes(variant.type)}
                  onToggle={() => handleToggleVariant(variant.type)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quantity Panel */}
      {showQuantityPanel && selectedItems.length > 0 && (
        <section ref={quantityPanelRef} className="bg-[#0B1020] py-8 scroll-mt-4">
          <div className="container mx-auto px-4 lg:px-8 max-w-2xl animate-[fadeIn_0.35s_ease-out]">
            <QuantityPanel
              selectedItems={selectedItems}
              onQtyChange={handleQtyChange}
              onRemove={handleRemoveVariant}
              onCheckout={handleCheckout}
              checkoutDisabled={isAdding}
            />
          </div>
        </section>
      )}

      <GuaranteeSection />
      <AtAGlanceSection />
      <LiveLocationNoteSection />
      <AuthenticSection />
      {/* Warranty / Trust */}
      <section className="bg-gradient-to-b from-[#0B1020] to-[#080B14] py-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <div className="text-center mb-10">
            <h2 data-reveal className="text-2xl md:text-3xl font-extrabold text-white bangla mb-2">কেন আমাদের কাছেই নিবেন?</h2>
            <p data-reveal data-reveal-delay="1" className="text-[#9BA8BF] bangla text-sm">আসল ট্র্যাকার, চেক করে ডেলিভারি — চুরি হলে লোকেশন বের করতে WhatsApp-এ হেল্প পাবেন</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { Icon: FaShieldAlt, title: 'চুরি হলে লোকেশন হেল্প', desc: 'ম্যাপ বের করতে গাইড করব' },
              { Icon: FaCheckCircle, title: 'আসল পণ্য', desc: 'চেক করে পাঠানো হয়' },
              { Icon: FaSearch, title: 'গোপনে লুকানো যায়', desc: 'ছোট, চোর সহজে পাবে না' },
              { Icon: FaComments, title: 'WhatsApp সাপোর্ট', desc: 'হারালে/চুরি হলে দ্রুত হেল্প' },
            ].map((item, i) => (
              <div key={i} data-reveal data-reveal-delay={String((i % 4) + 1)} className="bg-white/5 rounded-xl p-5 text-center border border-white/10 card-hover">
                <div className="flex justify-center mb-3">
                  <item.Icon className="text-2xl text-cyan-400" />
                </div>
                <h3 className="font-bold text-white text-sm bangla mb-1">{item.title}</h3>
                <p className="text-[#9BA8BF] text-xs bangla">{item.desc}</p>
              </div>
            ))}
          </div>
          <div data-reveal className="mt-10 max-w-2xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-white/[0.04] backdrop-blur-xl p-3 md:p-4 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-cyan-500/10 pointer-events-none" />
              <div className="relative rounded-xl overflow-hidden bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/product/tracker/hoco-authorization-certificate.jpg"
                  alt="Hoco Authorization Certificate - SF Corporation Bangladesh"
                  className="w-full h-auto block"
                  loading="lazy"
                />
              </div>
              <p className="text-center text-xs text-[#9BA8BF] bangla mt-3">
                Hoco Official Authorization — SF Corporation, Bangladesh (Valid Aug 05, 2026 – Aug 04, 2027)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits / Use Cases */}
      <section className="bg-[#080B14] py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <h2 data-reveal className="text-2xl md:text-3xl font-extrabold text-white bangla mb-2">চুরি বা হারিয়ে গেলে — ফোনেই খুঁজে পাওয়ার সুযোগ</h2>
            <p data-reveal data-reveal-delay="1" className="text-[#9BA8BF] bangla text-sm max-w-2xl mx-auto">গাড়ি চুরি হলে বা রাস্তায় হারিয়ে গেলে — নেটওয়ার্কের মাধ্যমে সারা দেশে শেষ লোকেশন দেখুন, কাছে গেলে Ring বাজিয়ে সঠিক জায়গা চিহ্নিত করুন</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {useCases.map((item, i) => (
              <div key={i} data-reveal data-reveal-delay={String((i % 3) + 1)} className="bg-white/5 rounded-xl p-5 border border-white/10 text-center card-hover">
                <div className="flex justify-center mb-3">
                  <item.Icon className="text-2xl text-violet-400" />
                </div>
                <h3 className="font-bold text-white text-sm bangla mb-1">{item.title}</h3>
                <p className="text-[#9BA8BF] text-xs bangla">{item.desc}</p>
              </div>
            ))}
          </div>
          <div data-reveal className="text-center mt-8">
            <button
              onClick={() => {
                const el = document.getElementById('product-selection');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white/10 text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-white/20 transition-colors bangla"
            >
              চুরির আগেই সুরক্ষিত রাখুন
            </button>
          </div>
        </div>
      </section>

      {/* Setup Section */}
      <SetupSection />

      {/* Reset / Troubleshooting */}
      <ResetSection />

      {/* Reviews */}
      <ReviewsSection />

      {/* Return Policy */}
      <ReturnPolicySection />

      {/* FAQ */}
      <FAQSection />

      {/* Final CTA */}
      <section className="py-16 bg-[#080B14]">
        <div className="container mx-auto px-4 text-center">
          <div
            data-reveal="scale"
            className="rounded-2xl p-10 max-w-2xl mx-auto shadow-2xl cta-gradient"
            style={{
              background: 'linear-gradient(135deg,#7c3aed 0%,#06b6d4 50%,#7c3aed 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <h3 className="text-2xl md:text-3xl font-extrabold text-white bangla mb-2">চোরের আগেই প্রস্তুত থাকুন — আজই লুকিয়ে রাখুন</h3>
            <p className="text-white/80 bangla text-sm md:text-base mb-6">চুরি/হারানোর পরে আফসোস নয় — এখনই বাইক/অটোতে লুকিয়ে রাখুন, প্রতিটি মাত্র ৳৯৯৯ টাকা, ব্যাটারি ৬-১২ মাস</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6">
              <button
                onClick={() => {
                  const el = document.getElementById('product-selection');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white text-violet-700 font-extrabold px-8 py-3.5 rounded-xl text-sm hover:bg-gray-100 transition-colors bangla"
              >
                চুরি ঠেকাতে এখনই অর্ডার করুন
              </button>
              <a
                href="https://wa.me/8801814575428"
                target="_blank"
                rel="noreferrer"
                className="bg-white/20 text-white font-bold px-8 py-3.5 rounded-xl text-sm hover:bg-white/30 transition-colors bangla"
              >
                WhatsApp-এ প্রশ্ন করুন
              </a>
            </div>
            <div className="flex flex-wrap justify-center gap-3 text-white/70 text-xs bangla">
              <span>Cash on Delivery</span>
              <span>Fast delivery</span>
              <span>Original product</span>
              <span>Support available</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Mobile sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#080B14]/95 backdrop-blur-md border-t border-white/10 md:hidden safe-area-pb">
        <div className="flex items-center justify-between px-4 py-3 gap-3">
          <div className="text-sm">
            <p className="text-white font-bold bangla">
              {selectedVariants.length === 0
                ? 'কোনো tracker নির্বাচিত নয়'
                : `${selectedVariants.length}টি নির্বাচিত • ৳${selectedVariants.reduce((s, v) => s + (product.price || 0) * (quantities[v] || 1), 0)}`}
            </p>
            <p className="text-[#9BA8BF] text-xs bangla">
              {selectedVariants.length === 0 ? 'একটি card-এ tap করুন' : 'Quantity panel থেকে checkout করুন'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (selectedVariants.length === 0) {
                const el = document.getElementById('product-selection');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              } else {
                handleCheckout();
              }
            }}
            className={`flex-shrink-0 font-bold px-5 py-3 rounded-xl text-sm bangla transition-all ${
              selectedVariants.length === 0
                ? 'bg-white/10 text-white border border-white/20'
                : 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg'
            }`}
          >
            {selectedVariants.length === 0 ? 'বেছে নিন' : 'Checkout →'}
          </button>
        </div>
      </div>

      <div className="h-16 md:hidden" />

      <OrderDialog
        isOpen={isOrderDialogOpen}
        onClose={() => setIsOrderDialogOpen(false)}
      />
    </>
  );
}

export async function getStaticProps() {
  if (!productData) return { notFound: true };
  return { props: { product: productData }, revalidate: 60 };
}
