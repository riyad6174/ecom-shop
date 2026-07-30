import React, { useState, useEffect } from 'react';
import { sendGTMEvent } from '@next/third-parties/google';
import { useDispatch } from 'react-redux';
import Navbar from '@/components/common/Navbar';
import { products } from '@/utils/products';
import { addToCart } from '@/store/cartSlice';
import Footer from '@/components/common/Footer';
import Head from 'next/head';
import OrderDialog from '@/components/checkout/OrderDialog';

const productData = products.find(
  (p) => p.slug === 'hoco-j164-outdoor-solar-power-bank',
);

const StarIcon = ({ filled }) => (
  <svg
    className={`w-4 h-4 ${filled ? 'text-amber-400' : 'text-gray-300'}`}
    fill='currentColor'
    viewBox='0 0 20 20'
  >
    <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
  </svg>
);

const ShieldIcon = () => (
  <svg
    className='w-5 h-5 text-red-200'
    fill='none'
    stroke='currentColor'
    strokeWidth='2.5'
    viewBox='0 0 24 24'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
    <path d='M9 12l2 2 4-4' />
  </svg>
);

const DESC_IMGS = [
  '/assets/product/solar/desc-img1.jpg',
  '/assets/product/solar/desc-img2.jpg',
  '/assets/product/solar/desc-img3.jpg',
  '/assets/product/solar/desc-img4.jpg',
];

function CountdownToMidnight() {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = Math.max(0, Math.floor((midnight - now) / 1000));
      setTimeLeft({
        h: Math.floor(diff / 3600),
        m: Math.floor((diff % 3600) / 60),
        s: diff % 60,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div
      className='rounded-xl px-4 py-3 my-3'
      style={{
        background: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
        border: '1.5px solid #fed7aa',
      }}
    >
      <p className='bangla text-sm font-semibold text-center text-orange-700 mb-2'>
        ⏰ অফার টি চলবে আর
      </p>
      <div className='flex items-center justify-center gap-2'>
        {[
          { val: pad(timeLeft.h), label: 'ঘণ্টা' },
          { val: pad(timeLeft.m), label: 'মিনিট' },
          { val: pad(timeLeft.s), label: 'সেকেন্ড' },
        ].map((unit, i) => (
          <React.Fragment key={unit.label}>
            {i > 0 && (
              <span className='text-orange-500 font-black text-2xl leading-none mb-4'>
                :
              </span>
            )}
            <div className='flex flex-col items-center'>
              <span
                className='countdown-digit font-mono font-extrabold text-lg px-3 py-1.5 rounded-lg min-w-[44px] text-center shadow-md text-white'
                style={{
                  background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                }}
              >
                {unit.val}
              </span>
              <span className='text-[10px] text-orange-600 bangla mt-1 font-medium'>
                {unit.label}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

const ProductDetails = ({ initialProduct }) => {
  const dispatch = useDispatch();
  const [product, setProduct] = useState(initialProduct);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);

  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
      setActiveImage(initialProduct.images[0] || '');

      if (typeof window !== 'undefined') {
        sendGTMEvent({ ecommerce: null });
        sendGTMEvent({
          event: 'view_item',
          ecommerce: {
            items: [
              {
                item_id: initialProduct.id || 'unknown',
                item_name: initialProduct.title || 'unknown',
                price: initialProduct.price || 0,
                original_price: initialProduct.originalPrice || 0,
                item_category: 'Electronics',
                item_variant: 'Standard',
              },
            ],
            currency: 'BDT',
            value: initialProduct.price || 0,
          },
        });
      }
    }
  }, [initialProduct]);

  const handleQuantityChange = (type) => {
    if (type === 'increment' && quantity < 100) setQuantity(quantity + 1);
    else if (type === 'decrement' && quantity > 1) setQuantity(quantity - 1);
  };

  const handleBuyNow = () => {
    if (!product || isAddingToCart) return;
    setIsAddingToCart(true);

    if (typeof window !== 'undefined') {
      sendGTMEvent({ ecommerce: null });
      sendGTMEvent({
        event: 'add_to_cart',
        ecommerce: {
          currency: 'BDT',
          value: product.price * quantity || 0,
          items: [
            {
              item_id: product.id || 'unknown',
              item_name: product.title || 'unknown',
              price: product.price || 0,
              original_price: product.originalPrice || 0,
              item_category: 'Electronics',
              item_variant: 'Standard',
              quantity: quantity || 1,
            },
          ],
        },
      });
    }

    dispatch(
      addToCart({
        id: product.id,
        title: product.title,
        slug: product.slug,
        price: product.price,
        selectedColor: 'Standard',
        quantity: 1,
        image: activeImage,
      }),
    );

    setIsOrderDialogOpen(true);
    setIsAddingToCart(false);
    setQuantity(1);
  };

  if (!product) return <div>Product not found</div>;

  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100,
  );

  return (
    <>
      <Head>
        <title>{product.title} | Buy Online in Bangladesh | Sheii Shop</title>
        <meta
          name='description'
          content={`বাংলাদেশে সেরা দামে ${product.title} কিনুন। HOCO Waterproof Solar Energy Power Bank — 8000mAh, সোলার চার্জিং, Type-C, LED ফ্ল্যাশলাইট ও বিল্ট-ইন কম্পাস সহ।`}
        />
        <meta
          name='keywords'
          content='solar power bank, HOCO J164, outdoor power bank, waterproof power bank, solar charging, 8000mAh power bank, solar energy charger, power bank Bangladesh'
        />
        <meta name='robots' content='index, follow' />
        <meta name='author' content='Sheii Shop' />
        <link
          rel='canonical'
          href={`https://www.sheiishop.com/product/${product.slug}`}
        />
        <meta property='og:type' content='product' />
        <meta property='og:title' content={`${product.title} | Sheii Shop`} />
        <meta property='og:description' content={product.description} />
        <meta
          property='og:image'
          content={
            product.images[0] ||
            'https://www.sheiishop.com/assets/footer-logo.png'
          }
        />
        <meta
          property='og:url'
          content={`https://www.sheiishop.com/product/${product.slug}`}
        />
        <meta property='og:site_name' content='Sheii Shop' />
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:title' content={`${product.title} | Sheii Shop`} />
        <meta name='twitter:description' content={product.description} />
        <meta
          name='twitter:image'
          content={
            product.images[0] ||
            'https://www.sheiishop.com/assets/footer-logo.png'
          }
        />
        <script
          type='application/ld+json'
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
        .bangla {
          font-family: 'Hind Siliguri', sans-serif;
        }
        .img-zoom {
          transition: transform 0.5s ease;
        }
        .img-zoom:hover {
          transform: scale(1.03);
        }
        .thumb-sel {
          border: 2.5px solid #dc2626;
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.2);
        }
        .thumb-unsel {
          border: 2px solid transparent;
          opacity: 0.65;
        }
        .thumb-unsel:hover {
          opacity: 1;
          border-color: #fca5a5;
        }
        .btn-buy {
          background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%);
          transition: all 0.3s ease;
          box-shadow:
            0 4px 20px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .btn-buy:hover {
          transform: translateY(-2px);
          box-shadow:
            0 8px 30px rgba(0, 0, 0, 0.6),
            inset 0 1px 0 rgba(255, 255, 255, 0.12);
          background: linear-gradient(135deg, #2a2a2a 0%, #111111 100%);
        }
        .feature-card {
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
        }
        @keyframes offer-pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.88;
          }
        }
        @keyframes offer-bg-radiate {
          0%,
          100% {
            background-position: 0% 50%;
          }
          25% {
            background-position: 100% 0%;
          }
          50% {
            background-position: 100% 100%;
          }
          75% {
            background-position: 0% 100%;
          }
        }
        @keyframes offer-text-sparkle {
          0%,
          100% {
            text-shadow:
              0 0 8px rgba(255, 255, 255, 0.6),
              0 0 16px rgba(220, 38, 38, 0.4);
          }
          50% {
            text-shadow:
              0 0 14px rgba(255, 255, 255, 0.9),
              0 0 28px rgba(220, 38, 38, 0.7),
              0 0 40px rgba(255, 200, 50, 0.6);
          }
        }
        .offer-banner {
          background-size: 300% 300%;
          animation:
            offer-bg-radiate 6s ease infinite,
            offer-pulse 2.2s ease-in-out infinite;
        }
        .offer-banner-text {
          animation: offer-text-sparkle 2.5s ease-in-out infinite;
        }
        @keyframes digit-pop {
          0% {
            transform: scale(1.18);
          }
          100% {
            transform: scale(1);
          }
        }
        .countdown-digit {
          animation: digit-pop 0.15s ease-out;
        }
        @keyframes guarantee-shimmer {
          0%,
          100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }
        .guarantee-shimmer {
          position: absolute;
          top: 0;
          left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.08),
            transparent
          );
          animation: guarantee-shimmer 3s ease-in-out infinite;
        }
        @keyframes guarantee-icon-pulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(220, 38, 38, 0);
          }
        }
        .guarantee-icon-pulse {
          animation: guarantee-icon-pulse 2.5s ease-in-out infinite;
        }
        .guarantee-text-shine {
          background: linear-gradient(
            90deg,
            #fff 0%,
            #fca5a5 50%,
            #fff 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shine 2.5s linear infinite;
        }
        @keyframes shine {
          to {
            background-position: 200% center;
          }
        }
        @keyframes fixed-bar-bg {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .fixed-offer-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 50;
          background-size: 300% 300%;
          animation:
            offer-pulse 2.2s ease-in-out infinite,
            fixed-bar-bg 4s ease infinite;
        }
      `}</style>

      <Navbar />

      {/* Offer Banner */}
      <div
        className='offer-banner sticky top-0 z-40 py-2.5 px-4 text-center'
        style={{
          background:
            'linear-gradient(125deg, #991b1b 0%, #1a1a1a 25%, #dc2626 50%, #0f0f0f 75%, #991b1b 100%)',
          borderBottom: '2px solid #450a0a',
        }}
      >
        <p className='offer-banner-text text-white font-bold bangla text-sm md:text-base tracking-wide drop-shadow'>
          🔥 {discount}% ডিস্কাউন্ট পাচ্ছেন শুধু আজকের জন্য 🔥
        </p>
      </div>

      {/* Hero */}
      <div className='bg-gradient-to-b from-slate-50 to-white'>
        <div className='container mx-auto px-4 lg:px-8 py-10'>
          <div className='bg-white rounded shadow-xl overflow-hidden'>
            <div className='flex flex-col lg:flex-row'>
              {/* Images */}
              <div className='w-full lg:w-[58%] p-5 md:p-8'>
                <div className='flex flex-col md:grid md:grid-cols-4 gap-4'>
                  <div className='md:col-span-3 overflow-hidden rounded-2xl bg-gray-50'>
                    <div className='relative w-full h-[360px] md:h-[520px]'>
                      <img
                        className='w-full h-full object-cover img-zoom'
                        src={activeImage}
                        alt={product.title}
                      />
                    </div>
                  </div>
                  <div className='hidden md:flex flex-col gap-3'>
                    {product.images.slice(0, 5).map((img, i) => (
                      <div
                        key={i}
                        onClick={() => setActiveImage(img)}
                        className={`overflow-hidden rounded-xl cursor-pointer transition-all duration-200 ${activeImage === img ? 'thumb-sel' : 'thumb-unsel'}`}
                      >
                        <img
                          src={img}
                          alt={`thumb ${i + 1}`}
                          className='w-full h-[95px] object-cover'
                        />
                      </div>
                    ))}
                  </div>
                  <div className='flex md:hidden justify-center gap-2 mt-2'>
                    {product.images.slice(0, 5).map((img, i) => (
                      <div
                        key={i}
                        onClick={() => setActiveImage(img)}
                        className={`overflow-hidden rounded-lg cursor-pointer transition-all duration-200 ${activeImage === img ? 'thumb-sel' : 'thumb-unsel'}`}
                      >
                        <img
                          src={img}
                          alt={`thumb ${i + 1}`}
                          className='w-[72px] h-[72px] object-cover'
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Product info */}
              <div className='w-full lg:w-[42%] px-6 md:px-10 py-8 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-gray-100'>
                <div className='inline-flex items-center gap-2 mb-4'>
                  <span
                    style={{
                      background: 'linear-gradient(135deg,#0f0f0f,#dc2626)',
                    }}
                    className='text-white text-xs font-semibold px-3 py-1 rounded-full'
                  >
                    🔥 হট ডিল
                  </span>
                  {product.inStock ? (
                    <span className='bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full bangla'>
                      স্টকে আছে
                    </span>
                  ) : (
                    <span className='bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-full bangla'>
                      স্টক শেষ
                    </span>
                  )}
                </div>

                <h1 className='text-2xl md:text-3xl font-bold text-gray-900 leading-snug mb-3'>
                  {product.title}
                </h1>

                <div className='flex items-center gap-2 mb-3'>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <StarIcon key={s} filled />
                  ))}
                  <span className='text-sm text-gray-500 bangla'>
                    (4.8 · 85টি রিভিউ)
                  </span>
                </div>

                <p className='text-gray-600 bangla text-sm leading-relaxed mb-4'>
                  {product.description}
                </p>

                <CountdownToMidnight />

                {/* Price */}
                <div className='flex items-end gap-3 mt-4 mb-5'>
                  <span className='text-4xl font-extrabold text-red-600'>
                    ৳{product.price.toFixed(0)}
                  </span>
                  <span className='text-xl text-gray-400 line-through mb-1'>
                    ৳{product.originalPrice.toFixed(0)}
                  </span>
                  <span className='bg-rose-100 text-rose-600 text-sm font-bold px-2 py-0.5 rounded-lg mb-1'>
                    {product.originalPrice.toFixed(0) -
                      product.price.toFixed(0)}{' '}
                    টাকা ছাড়
                  </span>
                </div>

                {/* Quantity + Buy */}
                <div className='flex items-center gap-3 mb-6'>
                  <div className='flex items-center border-2 border-gray-200 rounded-xl overflow-hidden'>
                    <button
                      onClick={() => handleQuantityChange('decrement')}
                      className='px-4 py-3 text-gray-600 hover:bg-gray-100 transition-colors font-bold text-lg'
                    >
                      −
                    </button>
                    <span className='px-5 py-3 font-semibold text-gray-800 min-w-[48px] text-center'>
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange('increment')}
                      className='px-4 py-3 text-gray-600 hover:bg-gray-100 transition-colors font-bold text-lg'
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={handleBuyNow}
                    disabled={!product.inStock || isAddingToCart}
                    className='btn-buy flex-1 text-white font-bold py-3.5 rounded-xl text-sm tracking-wide bangla disabled:opacity-70'
                  >
                    {product.inStock ? 'এখনই কিনুন' : 'স্টক শেষ'}
                  </button>
                </div>

                {/* Guarantee - Dark bg with white and red accent */}
                <div
                  className='mt-4 guarantee-card-wrapper relative overflow-hidden rounded-xl'
                  style={{ border: '1.5px solid #dc2626' }}
                >
                  <div className='guarantee-shimmer' />
                  <div
                    className='relative flex items-center gap-3 px-4 py-3.5'
                    style={{
                      background:
                        'linear-gradient(135deg, #1f1f1f, #0f0f0f)',
                    }}
                  >
                    <div
                      className='w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 guarantee-icon-pulse'
                      style={{ background: '#dc2626' }}
                    >
                      <ShieldIcon />
                    </div>
                    <div>
                      <p className='text-sm font-bold guarantee-text-shine'>
                        ৬ মাসের রিপ্লেসমেন্ট গ্যারান্টি
                      </p>
                      <p className='text-[10px] text-red-300 font-medium mt-0.5'>
                        6 Months Replacement Guarantee
                      </p>
                    </div>
                  </div>
                </div>

                {/* Perks */}
                <div className='grid grid-cols-2 gap-3 pt-5 mt-5 border-t border-gray-100'>
                  {[
                    { icon: '🚀', text: 'দ্রুত ডেলিভারি' },
                    { icon: '🔒', text: 'ক্যাশ অন ডেলিভারি' },
                    { icon: '✅', text: '6 মাস রিপ্লেসমেন্ট ওয়ারেন্টি' },
                    { icon: '🔄', text: 'সহজ রিটার্ন পলিসি' },
                  ].map((p) => (
                    <div key={p.text} className='flex items-center gap-2'>
                      <span className='text-lg'>{p.icon}</span>
                      <span className='text-xs text-gray-500 bangla font-medium'>
                        {p.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description Images */}
      <div className='w-full'>
        <div className='flex flex-col md:hidden'>
          {DESC_IMGS.map((src, i) => (
            <div key={i} className='overflow-hidden'>
              <img
                src={src}
                alt={`বিবরণ ${i + 1}`}
                className='w-full object-cover block'
              />
            </div>
          ))}
        </div>
        <div className='hidden md:grid md:grid-cols-2'>
          {DESC_IMGS.map((src, i) => (
            <div key={i} className='overflow-hidden'>
              <img
                src={src}
                alt={`বিবরণ ${i + 1}`}
                className='w-full h-full object-cover block img-zoom'
              />
            </div>
          ))}
        </div>
      </div>

      {/* Product Description Section */}
      <div className='bg-gradient-to-b from-white to-slate-50 py-16'>
        <div className='container mx-auto px-4 lg:px-8 max-w-4xl'>
          <div className='text-center mb-12'>
            <span
              style={{
                background:
                  'linear-gradient(135deg, #0f0f0f, #7f1d1d, #dc2626)',
              }}
              className='text-white text-xs font-semibold px-4 py-1.5 rounded-full bangla inline-block'
            >
              পণ্যের বিবরণ
            </span>
            <h2 className='text-3xl md:text-4xl font-extrabold text-gray-900 mt-4 mb-3 bangla'>
              কেন এই সোলার পাওয়ার ব্যাংকটি আপনার জন্য পারফেক্ট?
            </h2>
            <div className='w-16 h-1 bg-red-500 rounded-full mx-auto'></div>
          </div>

          <div className='bg-white rounded shadow-md p-8 md:p-12 mb-8'>
            <p className='text-gray-700 bangla text-lg leading-relaxed mb-5'>
              ফোনের চার্জ শেষ হয়ে যাওয়া এখন আর কোনো সমস্যা নয় —{' '}
              <strong className='text-red-600'>
                HOCO Waterproof Solar Energy Power Bank
              </strong>{' '}
              আপনার প্রতিদিনের ব্যবহার, ভ্রমণ, ক্যাম্পিং, লোডশেডিং বা জরুরি
              পরিস্থিতির জন্য একটি নির্ভরযোগ্য পাওয়ার ব্যাকআপ।
            </p>
            <p className='text-gray-700 bangla text-lg leading-relaxed mb-5'>
              এর <strong>8000mAh ব্যাটারি</strong> আপনার স্মার্টফোন ও অন্যান্য
              USB ডিভাইস চার্জ রাখতে সাহায্য করে। বিদ্যুৎ না থাকলেও সোলার
              চার্জিং সুবিধার মাধ্যমে সূর্যের আলো ব্যবহার করে পাওয়ার ব্যাংকটি
              চার্জ করা যায়।
            </p>
            <p className='text-gray-700 bangla text-lg leading-relaxed mb-5'>
              ওয়াটারপ্রুফ ডিজাইন থাকায় বৃষ্টি বা আউটডোর পরিবেশেও নিশ্চিন্তে
              ব্যবহার করতে পারবেন। এছাড়াও রয়েছে{' '}
              <strong>Type-C চার্জিং পোর্ট</strong>, জরুরি ব্যবহারের জন্য{' '}
              <strong>LED ফ্ল্যাশলাইট</strong>, এবং ট্রাভেল ও অ্যাডভেঞ্চারের জন্য{' '}
              <strong>বিল্ট-ইন কম্পাস</strong>।
            </p>
            <p className='text-gray-700 bangla text-lg leading-relaxed'>
              ছোট, হালকা ও সহজে বহনযোগ্য এই পাওয়ার ব্যাংকটি আপনার দৈনন্দিন
              জীবন ও ভ্রমণের জন্য একটি আদর্শ সঙ্গী।
            </p>
          </div>

          {/* Key Benefits */}
          <div className='mb-8'>
            <div
              className='px-8 py-5 rounded-t-2xl'
              style={{
                background:
                  'linear-gradient(125deg, #1a1a1a 0%, #991b1b 50%, #dc2626 100%)',
              }}
            >
              <h3 className='text-white font-bold text-xl bangla'>
                ✅ প্রধান সুবিধাসমূহ (Key Benefits)
              </h3>
            </div>
            <div className='bg-white rounded-b-2xl shadow-md p-8'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {[
                  '8000mAh শক্তিশালী ব্যাটারি ক্যাপাসিটি',
                  'সোলার এনার্জির মাধ্যমে চার্জ করার সুবিধা',
                  'ওয়াটারপ্রুফ ডিজাইন',
                  'আধুনিক Type-C চার্জিং পোর্ট',
                  'বিল্ট-ইন LED ফ্ল্যাশলাইট',
                  'বিল্ট-ইন কম্পাস',
                  'স্মার্টফোন, ইয়ারবাড, ব্লুটুথ ডিভাইসসহ বিভিন্ন USB ডিভাইসের সাথে ব্যবহারযোগ্য',
                  'ভ্রমণ, ক্যাম্পিং, লোডশেডিং ও জরুরি পরিস্থিতির জন্য আদর্শ',
                  'হালকা, টেকসই ও সহজে বহনযোগ্য',
                ].map((benefit, i) => (
                  <div
                    key={i}
                    className='flex items-start gap-3 rounded-xl p-4'
                    style={{
                      background:
                        'linear-gradient(135deg, #f8f9fa, #fef2f2)',
                    }}
                  >
                    <span className='text-red-500 font-bold text-lg mt-0.5 flex-shrink-0'>
                      ✓
                    </span>
                    <span className='text-gray-700 bangla text-sm leading-relaxed'>
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Why choose this power bank */}
          <div className='bg-white rounded shadow-md p-8 md:p-12 mb-8'>
            <h3 className='text-xl font-extrabold text-gray-900 mb-5 bangla'>
              কেন এই পাওয়ার ব্যাংকটি কিনবেন?
            </h3>
            <div className='space-y-3'>
              {[
                'যেকোনো সময় নির্ভরযোগ্য ব্যাকআপ পাওয়ার',
                'বিদ্যুৎ না থাকলেও সোলার চার্জিং সুবিধা',
                'আউটডোর ব্যবহারের জন্য উপযোগী',
                'এক ডিভাইসে চার্জিং, আলো ও কম্পাসের সুবিধা',
                'স্টাইলিশ, মজবুত ও দীর্ঘস্থায়ী ডিজাইন',
              ].map((point, i) => (
                <div key={i} className='flex items-center gap-3'>
                  <div
                    className='w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold'
                    style={{
                      background:
                        'linear-gradient(135deg, #1a1a1a, #dc2626)',
                    }}
                  >
                    <span>{i + 1}</span>
                  </div>
                  <span className='text-gray-700 bangla text-base'>
                    {point}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Specifications */}
          <div className='bg-white rounded shadow-md overflow-hidden mb-8'>
            <div
              className='px-8 py-5'
              style={{
                background:
                  'linear-gradient(125deg, #1a1a1a 0%, #7f1d1d 50%, #dc2626 100%)',
              }}
            >
              <h3 className='text-white font-bold text-lg bangla'>
                পণ্যের স্পেসিফিকেশন
              </h3>
            </div>
            <div className='divide-y divide-gray-100'>
              {[
                { l: 'মডেল', v: 'HOCO J164 Outdoor Solar Power Bank' },
                { l: 'আউটপুট পাওয়ার', v: '10 W' },
                { l: 'ফাংশন', v: 'Solar Panel Charge, Quick Charge Support' },
                { l: 'ম্যাটেরিয়াল', v: 'ABS' },
                { l: 'আউটপুট ইন্টারফেস', v: 'USB/MICRO USB, Type C' },
                {
                  l: 'টাইপ',
                  v: 'Waterproof, High Capacity, Power Station, Portable',
                },
                { l: 'ব্যাটারি ক্যাপাসিটি', v: '8000mAh' },
                { l: 'ফিচার', v: 'LED ফ্ল্যাশলাইট, বিল্ট-ইন কম্পাস' },
              ].map((row, i) => (
                <div
                  key={row.l}
                  className={`flex px-8 py-4 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                >
                  <span className='w-48 text-sm font-semibold text-gray-500 bangla flex-shrink-0'>
                    {row.l}
                  </span>
                  <span className='text-sm text-gray-800 bangla font-medium'>
                    {row.v}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Section */}
          <div className='bg-white rounded shadow-md p-8 md:p-12 mb-8'>
            <div className='text-center mb-8'>
              <span
                style={{
                  background:
                    'linear-gradient(135deg, #0f0f0f, #7f1d1d, #dc2626)',
                }}
                className='text-white text-xs font-semibold px-4 py-1.5 rounded-full bangla inline-block'
              >
                গ্রাহক রিভিউ
              </span>
              <h3 className='text-2xl font-extrabold text-gray-900 mt-4 mb-2 bangla'>
                আমাদের গ্রাহকরা কী বলছেন?
              </h3>
              <div className='w-16 h-1 bg-red-500 rounded-full mx-auto mb-4'></div>
              <div className='flex items-center justify-center gap-2'>
                {[1, 2, 3, 4, 5].map((s) => (
                  <StarIcon key={s} filled />
                ))}
                <span className='text-gray-500 bangla text-sm ml-1'>
                  4.8 · 85টি রিভিউ
                </span>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              {[
                {
                  name: 'রাকিব হাসান',
                  text: 'লোডশেডিংয়ের সময় খুব কাজে আসে। সোলার চার্জিং ফিচারটি অসাধারণ। আউটডোরে গেলে সাথে রাখি সবসময়।',
                },
                {
                  name: 'তানিয়া আক্তার',
                  text: 'ছোট কিন্তু খুব শক্তিশালী। কম্পাস আর ফ্ল্যাশলাইট ফিচার দারুণ। ক্যাম্পিং করার সময় খুব কাজে দিয়েছে।',
                },
                {
                  name: 'সাদমান রহমান',
                  text: 'ওয়াটারপ্রুফ হওয়ায় বাইরে বের হলে কোন চিন্তা নেই। টাইপ-সি চার্জিং পোর্ট অনেক সুবিধাজনক।',
                },
                {
                  name: 'নুসরাত জাহান',
                  text: 'বেস্ট প্রোডাক্ট। ফোন ২ বার ফুল চার্জ দিতে পারে। দারুণ বিল্ড কোয়ালিটি, হালকা এবং স্টাইলিশ।',
                },
              ].map((review, i) => (
                <div
                  key={i}
                  className='rounded-2xl p-6 flex flex-col gap-3'
                  style={{
                    background:
                      'linear-gradient(135deg, #f8f9fa, #fef2f2)',
                  }}
                >
                  <div className='flex gap-1'>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <StarIcon key={s} filled />
                    ))}
                  </div>
                  <p className='text-gray-700 bangla text-sm leading-relaxed'>
                    "{review.text}"
                  </p>
                  <p className='text-gray-900 bangla font-bold text-sm mt-auto'>
                    — {review.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className='text-center mt-14'>
            <div
              className='rounded-2xl p-10 max-w-2xl mx-auto shadow-2xl'
              style={{
                background:
                  'linear-gradient(135deg, #0a0a0a 0%, #1c0a0a 30%, #0f0f0f 60%, #0a0a0a 100%)',
                border: '1px solid rgba(220, 38, 38, 0.3)',
              }}
            >
              <h3
                className='text-2xl font-extrabold bangla mb-2'
                style={{
                  color: '#fecaca',
                  textShadow: '0 0 20px rgba(220, 38, 38, 0.4)',
                }}
              >
                আজই অর্ডার করুন!
              </h3>
              <p className='bangla text-sm mb-6' style={{ color: '#f87171' }}>
                সীমিত স্টক — দেরি না করে এখনই নিশ্চিত করুন আপনার অর্ডার
              </p>
              <button
                onClick={handleBuyNow}
                disabled={!product.inStock || isAddingToCart}
                className='font-extrabold bangla px-10 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-70'
                style={{
                  background:
                    'linear-gradient(135deg, #1f1f1f 0%, #000000 50%, #1f1f1f 100%)',
                  color: '#fff',
                  boxShadow: '0 4px 25px rgba(0, 0, 0, 0.55)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              >
                {product.inStock
                  ? `৳${product.price} — এখনই কিনুন`
                  : 'স্টক শেষ'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className='pb-20' />

      <Footer />

      {/* Fixed bottom offer bar */}
      <div
        className='fixed-offer-bar py-3 px-4'
        style={{
          background:
            'linear-gradient(125deg, #0f0f0f 0%, #991b1b 25%, #dc2626 50%, #1a1a1a 75%, #991b1b 100%)',
          borderTop: '2px solid #450a0a',
        }}
      >
        <div className='flex items-center justify-between max-w-4xl mx-auto gap-3'>
          <p className='text-white font-bold bangla text-sm md:text-base'>
            🔥 সীমিত সময়ের অফার! আজই {discount}% ছাড়ে কিনুন
          </p>
          <button
            onClick={handleBuyNow}
            disabled={!product.inStock || isAddingToCart}
            className='flex-shrink-0 bg-white text-red-600 font-extrabold bangla px-5 py-2 rounded-lg text-sm hover:bg-red-50 transition-all duration-200 shadow-md disabled:opacity-70'
          >
            {product.inStock ? 'এখনই কিনুন →' : 'স্টক শেষ'}
          </button>
        </div>
      </div>

      <OrderDialog
        isOpen={isOrderDialogOpen}
        onClose={() => setIsOrderDialogOpen(false)}
      />
    </>
  );
};

export async function getStaticProps() {
  if (!productData) return { notFound: true };
  return { props: { initialProduct: productData } };
}

export default ProductDetails;
