import React, { useState, useEffect } from 'react';
import { sendGTMEvent } from '@next/third-parties/google';
import { useDispatch } from 'react-redux';
import Navbar from '@/components/common/Navbar';
import { addToCart } from '@/store/cartSlice';
import Footer from '@/components/common/Footer';
import Head from 'next/head';
import OrderDialog from '@/components/checkout/OrderDialog';

const StarIcon = ({ filled }) => (
  <svg
    className={`w-4 h-4 ${filled ? 'text-amber-400' : 'text-gray-300'}`}
    fill='currentColor'
    viewBox='0 0 20 20'
  >
    <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
  </svg>
);

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
        background: 'linear-gradient(135deg,#fff7ed,#ffedd5)',
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
                  background: 'linear-gradient(135deg,#ea580c,#c2410c)',
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

export default function DynamicProductPage({ product, notFound }) {
  const dispatch = useDispatch();
  const [selectedVariant, setSelectedVariant] = useState('');
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);

  useEffect(() => {
    if (!product) return;
    const firstVariant = product.variants?.[0];
    setSelectedVariant(
      firstVariant
        ? firstVariant.value || firstVariant.color || firstVariant.type || ''
        : '',
    );
    setActiveImage(product.images?.[0] || product.thumbnail || '');

    if (typeof window !== 'undefined') {
      sendGTMEvent({ ecommerce: null });
      sendGTMEvent({
        event: 'view_item',
        ecommerce: {
          currency: 'BDT',
          value: product.price || 0,
          items: [
            {
              item_id: product.id || product._id || 'unknown',
              item_name: product.title || 'unknown',
              price: product.price || 0,
              original_price: product.originalPrice || 0,
              item_category: product.category || 'General',
              item_variant:
                firstVariant?.value ||
                firstVariant?.color ||
                firstVariant?.type ||
                'Standard',
            },
          ],
        },
      });
    }
  }, [product]);

  if (notFound || !product) {
    return (
      <>
        <Navbar />
        <div className='min-h-[60vh] flex flex-col items-center justify-center text-slate-500'>
          <p className='text-2xl font-bold mb-2'>Product Not Found</p>
          <p className='text-sm'>
            The product you are looking for does not exist.
          </p>
        </div>
        <Footer />
      </>
    );
  }

  const discount =
    product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : 0;

  function handleBuyNow() {
    if (!product || isAdding) return;
    setIsAdding(true);

    if (typeof window !== 'undefined') {
      sendGTMEvent({ ecommerce: null });
      sendGTMEvent({
        event: 'add_to_cart',
        ecommerce: {
          currency: 'BDT',
          value: product.price * quantity || 0,
          items: [
            {
              item_id: product.id || product._id || 'unknown',
              item_name: product.title || 'unknown',
              price: product.price || 0,
              original_price: product.originalPrice || 0,
              item_category: product.category || 'General',
              item_variant: selectedVariant || 'Standard',
              quantity: quantity || 1,
            },
          ],
        },
      });
    }

    dispatch(
      addToCart({
        id: product.id || product._id,
        title: product.title,
        slug: product.slug,
        price: product.price,
        selectedColor: selectedVariant,
        quantity: 1,
        image: activeImage,
      }),
    );

    setIsOrderDialogOpen(true);
    setIsAdding(false);
    setQuantity(1);
  }

  const colorVariants = product.variants?.filter(
    (v) => v.name === 'Color' || v.color,
  );
  const hasColorSwatch = colorVariants && colorVariants.length > 0;

  return (
    <>
      <Head>
        <title>{product.title} | Buy Online in Bangladesh | Sheii Shop</title>
        <meta
          name='description'
          content={
            product.shortDescription || product.description || product.title
          }
        />
        <meta name='robots' content='index, follow' />
        <link
          rel='canonical'
          href={`https://www.sheiishop.com/product/${product.slug}`}
        />
        <meta property='og:type' content='product' />
        <meta property='og:title' content={`${product.title} | Sheii Shop`} />
        <meta
          property='og:description'
          content={product.shortDescription || product.description || ''}
        />
        <meta
          property='og:image'
          content={
            product.images?.[0] ||
            product.thumbnail ||
            'https://www.sheiishop.com/assets/footer-logo.png'
          }
        />
        <meta
          property='og:url'
          content={`https://www.sheiishop.com/product/${product.slug}`}
        />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org/',
              '@type': 'Product',
              name: product.title,
              image: product.images,
              description:
                product.shortDescription || product.description || '',
              sku: product.id || product._id,
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
          border: 2.5px solid #c9922a;
          box-shadow: 0 0 0 3px rgba(201, 146, 42, 0.22);
        }
        .thumb-unsel {
          border: 2px solid transparent;
          opacity: 0.65;
        }
        .thumb-unsel:hover {
          opacity: 1;
          border-color: #d4af37;
        }
        .btn-buy {
          background: linear-gradient(
            135deg,
            #1a1a2e 0%,
            #0f0c1a 50%,
            #1a1a2e 100%
          );
          transition: all 0.3s ease;
          box-shadow:
            0 4px 20px rgba(0, 0, 0, 0.55),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .btn-buy:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.65);
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
        .offer-banner {
          animation: offer-pulse 2.2s ease-in-out infinite;
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
        .dp-html-content img {
          max-width: 100%;
          height: auto;
        }
        .dp-html-content h1,
        .dp-html-content h2,
        .dp-html-content h3 {
          font-weight: 700;
          margin: 1rem 0 0.5rem;
        }
        .dp-html-content ul,
        .dp-html-content ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .dp-html-content li {
          margin-bottom: 0.25rem;
        }
        .dp-html-content p {
          margin-bottom: 0.75rem;
        }
      `}</style>

      <Navbar />

      {/* Sticky Offer Banner */}
      {discount > 0 && (
        <div
          className='offer-banner sticky top-0 z-40 py-2.5 px-4 text-center'
          style={{
            background:
              'linear-gradient(90deg,#0d0d0d 0%,#1a1208 30%,#2d1f0a 50%,#1a1208 70%,#0d0d0d 100%)',
            borderBottom: '1.5px solid rgba(212,175,55,0.3)',
          }}
        >
          <p
            className='font-bold bangla text-sm md:text-base tracking-wide'
            style={{
              color: '#f0d080',
              textShadow: '0 0 16px rgba(212,175,55,0.5)',
            }}
          >
            ✦ {discount}% ডিস্কাউন্ট পাচ্ছেন শুধু আজকের জন্য ✦
          </p>
        </div>
      )}

      {/* Hero */}
      <div className='bg-gradient-to-b from-slate-50 to-white'>
        <div className='container mx-auto px-0 lg:px-8 py-0 md:py-6'>
          <div className='bg-white rounded shadow-xl overflow-hidden'>
            <div className='flex flex-col lg:flex-row'>
              {/* Images */}
              <div className='w-full lg:w-[58%] p-5 md:p-8'>
                <div className='flex flex-col md:grid md:grid-cols-4 gap-4'>
                  <div className='md:col-span-3 overflow-hidden rounded-2xl bg-gray-50'>
                    <img
                      className='w-full h-[360px] md:h-[520px] object-cover img-zoom'
                      src={activeImage}
                      alt={product.title}
                    />
                  </div>
                  <div className='hidden md:flex flex-col gap-3'>
                    {product.images?.slice(0, 3).map((img, i) => (
                      <div
                        key={i}
                        onClick={() => setActiveImage(img)}
                        className={`overflow-hidden rounded-xl cursor-pointer transition-all duration-200 ${activeImage === img ? 'thumb-sel' : 'thumb-unsel'}`}
                      >
                        <img
                          src={img}
                          alt={`thumb ${i + 1}`}
                          className='w-full h-[155px] object-cover'
                        />
                      </div>
                    ))}
                  </div>
                  <div className='flex md:hidden justify-center gap-2 mt-2'>
                    {product.images?.slice(0, 4).map((img, i) => (
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

              {/* Product Info */}
              <div className='w-full lg:w-[42%] px-6 md:px-10 py-8 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-gray-100'>
                <div className='inline-flex items-center gap-2 mb-4'>
                  <span
                    style={{
                      background: 'linear-gradient(135deg,#1a1208,#2d1f0a)',
                      color: '#d4af37',
                      border: '1px solid rgba(212,175,55,0.3)',
                    }}
                    className='text-xs font-bold px-3 py-1 rounded-full'
                  >
                    ★ বেস্টসেলার
                  </span>
                  {product.inStock ? (
                    <span
                      style={{ background: '#052e16', color: '#86efac' }}
                      className='text-xs font-semibold px-3 py-1 rounded-full bangla'
                    >
                      স্টকে আছে
                    </span>
                  ) : (
                    <span className='bg-red-900 text-red-200 text-xs font-semibold px-3 py-1 rounded-full bangla'>
                      স্টক শেষ
                    </span>
                  )}
                </div>

                <h1 className='text-lg md:text-3xl font-semibold md:font-bold text-gray-900 leading-snug mb-3 bangla'>
                  {product.title}
                </h1>

                <div className='flex items-center gap-2 mb-3'>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <StarIcon key={s} filled />
                  ))}
                  <span className='text-sm text-gray-500 bangla'>
                    (৪.৮ · ৯৬টি রিভিউ)
                  </span>
                </div>

                {product.shortDescription && (
                  <p className='text-gray-600 bangla text-sm leading-relaxed mb-4'>
                    {product.shortDescription}
                  </p>
                )}

                {product.discountTimer && <CountdownToMidnight />}

                <div className='flex items-end gap-3 mt-4 mb-5'>
                  <span
                    className='text-4xl font-extrabold'
                    style={{ color: '#c9922a' }}
                  >
                    ৳{Number(product.price).toFixed(0)}
                  </span>
                  <span className='text-xl text-gray-400 line-through mb-1'>
                    ৳{Number(product.originalPrice).toFixed(0)}
                  </span>
                  {discount > 0 && (
                    <span
                      style={{
                        background: '#1a1208',
                        color: '#d4af37',
                        border: '1px solid rgba(212,175,55,0.25)',
                      }}
                      className='text-sm font-bold px-2 py-0.5 rounded-lg mb-1'
                    >
                      {Number(product.originalPrice) - Number(product.price)}{' '}
                      Taka Save
                    </span>
                  )}
                </div>

                {/* Variants */}
                {product.variants && product.variants.length > 0 && (
                  <div className='mb-5'>
                    <p className='text-sm font-semibold text-gray-700 mb-3 bangla'>
                      {product.variants[0].name || 'ভ্যারিয়েন্ট'}:{' '}
                      <span className='font-bold' style={{ color: '#c9922a' }}>
                        {selectedVariant}
                      </span>
                    </p>
                    <div className='flex items-center gap-2 flex-wrap'>
                      {product.variants.map((v, i) => {
                        const val = v.value || v.color || v.type || '';
                        const isSelected = selectedVariant === val;
                        const isColor = v.name === 'Color' || v.color;
                        if (isColor) {
                          const lc = val.toLowerCase();
                          const bg =
                            lc === 'golden'
                              ? '#d4a017'
                              : lc === 'silver'
                                ? '#c0c0c0'
                                : lc;
                          return (
                            <button
                              key={i}
                              title={val}
                              onClick={() => setSelectedVariant(val)}
                              style={{
                                backgroundColor: bg,
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                border:
                                  lc === 'silver' || lc === 'white'
                                    ? '2px solid #9ca3af'
                                    : '2px solid transparent',
                                outline: isSelected
                                  ? '3px solid #c9922a'
                                  : 'none',
                                outlineOffset: 3,
                                transform: isSelected
                                  ? 'scale(1.15)'
                                  : 'scale(1)',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                              }}
                            />
                          );
                        }
                        return (
                          <button
                            key={i}
                            onClick={() => setSelectedVariant(val)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all`}
                            style={
                              isSelected
                                ? {
                                    background: '#1a1208',
                                    color: '#d4af37',
                                    borderColor: '#c9922a',
                                  }
                                : {
                                    background: 'white',
                                    color: '#374151',
                                    borderColor: '#d1d5db',
                                  }
                            }
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Qty + Buy */}
                <div className='flex items-center gap-3 mb-3'>
                  <div className='flex items-center border-2 border-gray-200 rounded-xl overflow-hidden'>
                    <button
                      onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                      className='px-4 py-3 text-gray-600 hover:bg-gray-100 transition-colors font-bold text-lg'
                    >
                      −
                    </button>
                    <span className='px-5 py-3 font-semibold text-gray-800 min-w-[48px] text-center'>
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        quantity < 999 && setQuantity(quantity + 1)
                      }
                      className='px-4 py-3 text-gray-600 hover:bg-gray-100 transition-colors font-bold text-lg'
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={handleBuyNow}
                    disabled={!product.inStock || isAdding}
                    className='btn-buy flex-1 text-white font-bold py-3.5 rounded-xl text-sm tracking-wide bangla disabled:opacity-70'
                  >
                    {isAdding
                      ? 'প্রক্রিয়াকরণ...'
                      : product.inStock
                        ? 'এখনই কিনুন'
                        : 'স্টক শেষ'}
                  </button>
                </div>

                <div className='grid grid-cols-2 gap-3 pt-5 border-t border-gray-100'>
                  {[
                    { icon: '🚀', text: 'দ্রুত ডেলিভারি' },
                    { icon: '🔒', text: 'ক্যাশ অন ডেলিভারি' },
                    { icon: '🎁', text: 'বিশেষ অফার' },
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

      {/* Gallery — mobile only: full width, 1 per row, no gaps, before description */}
      {product.gallery && product.gallery.length > 0 && (
        <div className='md:hidden w-full px-4'>
          {product.gallery.map((img, i) => (
            <div key={i} className='w-full'>
              <img
                src={img}
                alt={`gallery-${i}`}
                className='w-full block object-cover'
              />
            </div>
          ))}
        </div>
      )}

      {/* HTML Description */}
      {product.descriptionHTML && (
        <div className='bg-gradient-to-b from-white to-slate-50 py-12'>
          <div className='container mx-auto px-0 lg:px-8 max-w-4xl'>
            <div className='text-center mb-4'>
              <span
                style={{
                  background: 'linear-gradient(135deg,#1a1208,#2d1f0a)',
                  color: '#d4af37',
                  border: '1px solid rgba(212,175,55,0.3)',
                }}
                className='text-xs font-bold px-4  py-1.5 rounded-full bangla inline-block'
              >
                পণ্যের বিবরণ
              </span>
            </div>
            <div
              className='bg-white rounded shadow-md p-4 md:p-12 dp-html-content'
              dangerouslySetInnerHTML={{ __html: product.descriptionHTML }}
            />
          </div>
        </div>
      )}

      {/* Specifications */}
      {product.specifications && product.specifications.length > 0 && (
        <div className='bg-white py-12'>
          <div className='container mx-auto px-4 lg:px-8 max-w-4xl'>
            <div className='rounded shadow-md overflow-hidden'>
              <div
                className='px-8 py-5'
                style={{
                  background: 'linear-gradient(to right,#1a1208,#2d1f0a)',
                  borderBottom: '2px solid rgba(212,175,55,0.4)',
                }}
              >
                <h3
                  className='font-bold text-lg bangla'
                  style={{ color: '#d4af37' }}
                >
                  পণ্যের স্পেসিফিকেশন
                </h3>
              </div>
              <div className='divide-y divide-gray-100'>
                {product.specifications.map((spec, i) => (
                  <div
                    key={i}
                    className={`flex px-8 py-4 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                  >
                    <span className='w-48 text-sm font-semibold text-gray-500 bangla'>
                      {spec.label}
                    </span>
                    <span className='text-sm text-gray-800 bangla font-medium'>
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQs */}
      {product.faqs && product.faqs.length > 0 && (
        <div className='bg-slate-50 py-12'>
          <div className='container mx-auto px-4 lg:px-8 max-w-4xl'>
            <h2 className='text-2xl font-extrabold text-gray-900 mb-6 bangla text-center'>
              সচরাচর জিজ্ঞাসা
            </h2>
            <div className='space-y-4'>
              {product.faqs.map((faq, i) => (
                <details
                  key={i}
                  className='bg-white rounded-xl shadow-sm border border-gray-100 p-5 group'
                >
                  <summary className='font-semibold text-gray-800 bangla cursor-pointer list-none flex justify-between items-center'>
                    {faq.question}
                    <span
                      className='text-lg group-open:rotate-45 transition-transform'
                      style={{ color: '#c9922a' }}
                    >
                      +
                    </span>
                  </summary>
                  <p className='mt-3 text-gray-600 bangla text-sm leading-relaxed'>
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reviews */}
      {product.reviews && product.reviews.length > 0 && (
        <div className='bg-white py-12'>
          <div className='container mx-auto px-4 lg:px-8 max-w-4xl'>
            <h2 className='text-2xl font-extrabold text-gray-900 mb-6 bangla text-center'>
              ক্রেতাদের মতামত
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {product.reviews.map((review, i) => (
                <div
                  key={i}
                  className='bg-slate-50 rounded-2xl p-5 border border-slate-100'
                >
                  <div className='flex items-center gap-2 mb-2'>
                    <div
                      className='w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm'
                      style={{ background: '#1a1208', color: '#d4af37' }}
                    >
                      {review.reviewerName?.[0] || 'R'}
                    </div>
                    <span className='font-semibold text-gray-800 text-sm'>
                      {review.reviewerName}
                    </span>
                    <div className='flex ml-auto'>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <StarIcon key={s} filled={s <= (review.rating || 5)} />
                      ))}
                    </div>
                  </div>
                  <p className='text-gray-600 text-sm leading-relaxed'>
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Extra Gallery Grid — desktop only (mobile handled above before description) */}
      {product.gallery && product.gallery.length > 0 && (
        <div className='hidden md:block w-full'>
          <div
            className={`grid ${product.gallery.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} ${product.gallery.length >= 3 ? 'md:grid-cols-3' : product.gallery.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}
          >
            {product.gallery.map((img, i) => (
              <div key={i} className='overflow-hidden'>
                <img
                  src={img}
                  alt={`gallery-${i}`}
                  className='w-full object-cover block img-zoom'
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className='py-14 bg-gradient-to-b from-white to-slate-50'>
        <div className='container mx-auto px-4 text-center'>
          <div
            className='rounded-2xl p-10 max-w-2xl mx-auto shadow-2xl'
            style={{
              background:
                'linear-gradient(135deg,#0a0a14 0%,#1a1333 40%,#251848 70%,#0a0a14 100%)',
              border: '1px solid rgba(180,140,255,0.18)',
            }}
          >
            <h3
              className='text-2xl font-extrabold bangla mb-2'
              style={{
                color: '#e8d5ff',
                textShadow: '0 0 20px rgba(160,100,255,0.4)',
              }}
            >
              আজই অর্ডার করুন!
            </h3>
            <p className='bangla text-sm mb-6' style={{ color: '#a08cc0' }}>
              সীমিত স্টক — দেরি না করে এখনই নিশ্চিত করুন আপনার অর্ডার
            </p>
            <button
              onClick={handleBuyNow}
              disabled={!product.inStock || isAdding}
              className='font-extrabold bangla px-10 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-70'
              style={{
                background:
                  'linear-gradient(135deg,#d4af37 0%,#c9922a 50%,#d4af37 100%)',
                color: '#1a1208',
                boxShadow: '0 4px 20px rgba(212,175,55,0.35)',
                border: 'none',
              }}
            >
              {product.inStock ? `৳${product.price} — এখনই কিনুন` : 'স্টক শেষ'}
            </button>
          </div>
        </div>
      </div>

      <Footer />

      <OrderDialog
        isOpen={isOrderDialogOpen}
        onClose={() => setIsOrderDialogOpen(false)}
      />
    </>
  );
}

export async function getServerSideProps({ params }) {
  const { slug } = params;

  try {
    const { connectDB } = await import('@/lib/mongodb');
    const ProductModel = (await import('@/models/Product')).default;
    const { products: staticProducts } = await import('@/utils/products');

    const isStatic = staticProducts.some((p) => p.slug === slug);
    if (isStatic) {
      return { notFound: true };
    }

    await connectDB();
    const product = await ProductModel.findOne({ slug }).lean();

    if (!product) return { props: { notFound: true } };

    return {
      props: {
        product: JSON.parse(
          JSON.stringify({ ...product, id: product._id.toString() }),
        ),
      },
    };
  } catch (err) {
    console.error(err);
    return { props: { notFound: true } };
  }
}
