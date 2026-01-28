import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { GoShareAndroid } from 'react-icons/go';
import Navbar from '@/components/common/Navbar';
import Related from '@/components/checkout/Related';
import CustomSection from '@/components/layout/CustomSection';
import { products } from '@/utils/products';
import { addToCart } from '@/store/cartSlice';
import Footer from '@/components/common/Footer';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';

// Find the specific product for this page
const productData = products.find(
  (p) => p.slug === 'portable-baby-feeding-bottle-warmer'
);

// Sample FAQ data
const faqs = [
  {
    question: 'এই বোতল ওয়ার্মারটি কি সব ধরনের বোতলের সাথে সামঞ্জস্যপূর্ণ?',
    answer:
      'হ্যাঁ, এটি সব সাইজের স্ট্যান্ডার্ড বেবি ফিডিং বোতলের সাথে সামঞ্জস্যপূর্ণ এবং দ্রুত গরম করে।',
  },
  {
    question: 'ব্যাটারি লাইফ কতক্ষণ?',
    answer:
      '৬০০০ mAh ব্যাটারি দিয়ে ৫-৬ ঘণ্টা পর্যন্ত ব্যাকআপ প্রদান করে, যা একাধিক ফিডিং সেশনের জন্য যথেষ্ট।',
  },
  {
    question: 'চার্জিং সময় কতটুকু?',
    answer:
      'টাইপ সি ফাস্ট চার্জিং সাপোর্ট করে, যা ১ ঘণ্টায় ফুল চার্জ হয়ে যায়।',
  },
  {
    question: 'এটি নিরাপদ কি না শিশুর জন্য?',
    answer:
      'হ্যাঁ, ইনবিল্ট অ্যান্টি-হিট প্রটেকশন রয়েছে, যা অতিরিক্ত গরম হওয়া প্রতিরোধ করে এবং শিশুর খাবারকে নিরাপদ উষ্ণতায় রাখে।',
  },
  {
    question: 'ওয়ারেন্টি আছে কি?',
    answer:
      '৬ মাসের ম্যানুফ্যাকচারার ওয়ারেন্টি সহ আসে। যেকোনো সমস্যায় আমাদের সাথে যোগাযোগ করুন।',
  },
];

// Sample review data (with images)
const reviews = [
  {
    id: 3,
    image: '/assets/product/warmer/review-3.jpeg',
  },
  {
    id: 1,
    image: '/assets/product/warmer/review-1.png', // Placeholder
  },
  {
    id: 2,
    image: '/assets/product/warmer/review-2.png',
  },
];

const ProductDetails = ({ initialProduct }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [product, setProduct] = useState(initialProduct);
  const [selectedColor, setSelectedColor] = useState('');
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
      setSelectedColor(initialProduct.variants?.[0]?.color || '');
      setActiveImage(initialProduct.images?.[0] || '');

      // Push product view event to data layer
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'view_item',
        ecommerce: {
          currency: 'BDT',
          value: initialProduct.price || 0,
          items: [
            {
              item_id: initialProduct.id || 'unknown',
              item_name: initialProduct.title || 'unknown',
              price: initialProduct.price || 0,
              original_price: initialProduct.originalPrice || 0,
              item_category: 'Baby Bottle Warmer',
              item_variant: initialProduct.variants?.[0]?.color || 'unknown',
            },
          ],
        },
      });
    }
  }, [initialProduct]);

  const handleImageClick = (image) => {
    setActiveImage(image);
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
  };

  const handleQuantityChange = (type) => {
    if (type === 'increment' && quantity < 999) {
      setQuantity(quantity + 1);
    } else if (type === 'decrement' && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleBuyNow = () => {
    if (!product || isAddingToCart) {
      if (!product) console.error('Product data is missing');
      return;
    }

    setIsAddingToCart(true);

    // Push add_to_cart event to data layer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
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
            item_category: 'Baby Bottle Warmer',
            item_variant: selectedColor || 'unknown',
            quantity: quantity || 1,
          },
        ],
      },
    });

    // Dispatch to Redux store
    dispatch(
      addToCart({
        id: product.id,
        title: product.title,
        slug: product.slug,
        price: product.price,
        selectedColor,
        quantity,
        image: activeImage,
      })
    );

    // Delay navigation to allow tracking pixels to complete
    setTimeout(() => {
      router.push('/order');
    }, 300);
  };

  if (!product) {
    return <div>Product not found</div>;
  }

  // Rest of the JSX remains unchanged
  return (
    <>
      <Head>
        <title>{product.title} | Buy Online in Bangladesh | Sheii Shop</title>
        <meta
          name='description'
          content={`বাংলাদেশে সেরা দামে ${product.title} কিনুন। ৬০০০ মিলি অ্যাম্পিয়ার রিচার্জেবল ব্যাটারি, টাইপ সি ফাস্ট চার্জ, অ্যান্টি হিট প্রটেকশন এবং ভ্রমণকারীদের জন্য আদর্শ। শীতকালে শিশুর উষ্ণ খাবারের জন্য নিখুঁত।`}
        />
        <meta
          name='keywords'
          content={`Portable Baby Bottle Warmer, বেবি বোতল ওয়ার্মার বাংলাদেশ, rechargeable bottle warmer price BD, 6000mAh battery warmer, Type C fast charge, anti heat protection, baby feeding warmer, travel bottle warmer`}
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
            product.images?.[0] ||
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
            product.images?.[0] ||
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
              brand: {
                '@type': 'Brand',
                name: 'Sheii Shop',
              },
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

      <Navbar />
      <div>
        <style jsx>{`
          .image-transition {
            transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
          }
          .image-transition:hover {
            transform: scale(1.02);
          }
          .small-image {
            transition: opacity 0.2s ease-in-out, border-color 0.2s ease-in-out;
            border-width: 2px;
          }
          .small-image-active {
            border-color: #3b82f6;
            opacity: 1;
          }
          .small-image-inactive {
            opacity: 0.7;
            border-color: transparent;
          }
          .color-button {
            transition: all 0.2s ease-in-out;
          }
          .color-button-active {
            border-color: #3b82f6;
            transform: scale(1.1);
          }
        `}</style>
        <div className='py-8 container mx-auto px-4 lg:px-8'>
          <div className='bg-white md:py-6 rounded-2xl md:rounded-xl shadow-lg'>
            <div className='flex flex-col md:flex-row gap-4 md:gap-6 -mx-4'>
              <div className='w-full md:w-3/4 px-4'>
                <div className='p-2 md:p-0 md:grid md:grid-cols-4 gap-4'>
                  <div className='col-span-3 md:pl-6'>
                    <img
                      className='w-full h-[320px] md:h-[533px] object-cover rounded-lg image-transition'
                      src={activeImage}
                      alt={product.title}
                    />
                    <div className='flex justify-center gap-2 mt-4 md:hidden'>
                      {product.images.slice(1).map((image, index) => (
                        <img
                          key={index}
                          className={`w-[80px] h-[80px] object-cover rounded-lg cursor-pointer small-image ${
                            activeImage === image
                              ? 'small-image-active'
                              : 'small-image-inactive'
                          }`}
                          src={image}
                          alt={`${product.title} Thumbnail ${index + 1}`}
                          onClick={() => handleImageClick(image)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className='col-span-1 hidden md:flex flex-col items-center gap-4'>
                    {product.images.slice(1).map((image, index) => (
                      <img
                        key={index}
                        className={`w-full h-[167px] object-cover rounded-lg cursor-pointer small-image ${
                          activeImage === image
                            ? 'small-image-active'
                            : 'small-image-inactive'
                        }`}
                        src={image}
                        alt={`${product.title} Thumbnail ${index + 1}`}
                        onClick={() => handleImageClick(image)}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className='md:w-1/2 px-7 md:px-0 py-4'>
                <h2 className='text-lg md:text-2xl font-semibold font-mont text-gray-800 md:mb-4'>
                  {product.title}
                </h2>
                <p className='text-gray-600 text-sm mb-4 font-mont'>
                  {product.description}
                </p>
                {/* <div className='mb-6'>
                  <span className='font-semibold text-gray-700'>
                    কালার সিলেক্ট করুন
                  </span>
                  <div className='flex items-center gap-3 mt-4'>
                    {product.variants.map((variant) => (
                      <div
                        key={variant.color}
                        className={`border-2 flex items-center justify-center rounded-full p-1 cursor-pointer color-button ${
                          selectedColor === variant.color
                            ? 'color-button-active'
                            : ''
                        }`}
                        onClick={() => handleColorChange(variant.color)}
                      >
                        <button
                          className='w-[30px] h-[30px] rounded-full'
                          style={{
                            backgroundColor: variant.color.toLowerCase(),
                          }}
                        ></button>
                      </div>
                    ))}
                  </div>
                </div> */}
                <div className='flex items-center justify-start gap-2 text-md mb-6'>
                  <span className='text-blue-600 font-bold text-xl'>
                    ৳ {product.price.toFixed(2)}
                  </span>
                  <span className='text-gray-500 font-normal text-lg line-through'>
                    ৳ {product.originalPrice.toFixed(2)}
                  </span>
                </div>
                <div className='flex items-center justify-start gap-4 mb-6'>
                  <div className='relative flex items-center max-w-[8rem] border border-gray-400 rounded-lg bg-white'>
                    <button
                      type='button'
                      onClick={() => handleQuantityChange('decrement')}
                      className='hover:bg-gray-200 rounded-s-lg py-3 px-4 h-11 focus:ring-gray-100 focus:ring-2 focus:outline-none'
                    >
                      <svg
                        className='w-2 h-2 text-gray-900'
                        aria-hidden='true'
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 18 2'
                      >
                        <path
                          stroke='currentColor'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M1 1h16'
                        />
                      </svg>
                    </button>
                    <input
                      type='text'
                      value={quantity}
                      readOnly
                      className='h-11 text-center text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full py-2.5'
                    />
                    <button
                      type='button'
                      onClick={() => handleQuantityChange('increment')}
                      className='hover:bg-gray-200 rounded-e-lg py-3 px-4 h-11 focus:ring-gray-100 focus:ring-2 focus:outline-none'
                    >
                      <svg
                        className='w-2 h-2 text-gray-900'
                        aria-hidden='true'
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 18 18'
                      >
                        <path
                          stroke='currentColor'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='2'
                          d='M9 1v16M1 9h16'
                        />
                      </svg>
                    </button>
                  </div>
                  <button
                    onClick={handleBuyNow}
                    className='flex items-center bg-blue-600 text-white justify-center gap-2 border border-blue-600 px-6 py-[12px] rounded-md font-mont font-semibold text-sm disabled:opacity-70'
                    disabled={!product.inStock || isAddingToCart}
                  >
                    {isAddingToCart ? (
                      <>
                        <svg className='animate-spin h-4 w-4 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                          <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                          <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                        </svg>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>{product.inStock ? 'Buy Now' : 'Out of Stock'}</span>
                    )}
                  </button>
                </div>
                <p className='text-xs text-gray-600'>
                  প্রোডাক্টটি অরিজিনাল হবে কিনা চিন্তা করছেন? ১০০% অরিজিনাল হবে
                  এই গ্যারান্টি আমরা দিচ্ছি। নকল প্রোডাক্ট কিনে প্রতারিত হবেন
                  না।
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table Section */}
      <CustomSection>
        <div className='px-3'>
          <div className='bg-white p-5 rounded-lg shadow-md'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-lg font-semibold text-gray-800'>
                নকল vs অরিজিনাল: কম্প্যারিজন
              </h2>
            </div>
            <div className='overflow-x-auto'>
              <table className='min-w-full border-collapse border border-gray-300'>
                <thead>
                  <tr className='bg-gray-50'>
                    <th className='border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700'>
                      বৈশিষ্ট্য
                    </th>
                    <th className='border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-red-600'>
                      নকল প্রোডাক্ট
                    </th>
                    <th className='border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-green-600'>
                      অরিজিনাল প্রোডাক্ট
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className='hover:bg-gray-50'>
                    <td className='border border-gray-300 px-4 py-2 text-sm text-gray-600 font-medium'>
                      ম্যাটেরিয়াল
                    </td>
                    <td className='border border-gray-300 px-4 py-2 text-center text-sm text-red-600'>
                      কম কোয়ালিটির প্লাস্টিক, সহজে ভাঙে
                    </td>
                    <td className='border border-gray-300 px-4 py-2 text-center text-sm text-green-600'>
                      প্রিমিয়াম ABS প্লাস্টিক, টেকসই এবং হালকা
                    </td>
                  </tr>
                  <tr className='hover:bg-gray-50'>
                    <td className='border border-gray-300 px-4 py-2 text-sm text-gray-600 font-medium'>
                      ব্যাটারি
                    </td>
                    <td className='border border-gray-300 px-4 py-2 text-center text-sm text-red-600'>
                      ৬০০০/৮০০০ দাবি করে কিন্তু কোথাও উল্লেখ নেই, দুর্বল
                      ব্যাটারি
                    </td>
                    <td className='border border-gray-300 px-4 py-2 text-center text-sm text-green-600'>
                      ৬০০০/৮০০০ mAh স্পষ্টভাবে প্রোডাক্টের নিচে লেখা,
                      দীর্ঘস্থায়ী
                    </td>
                  </tr>
                  <tr className='hover:bg-gray-50'>
                    <td className='border border-gray-300 px-4 py-2 text-sm text-gray-600 font-medium'>
                      ডিসপ্লে
                    </td>
                    <td className='border border-gray-300 px-4 py-2 text-center text-sm text-red-600'>
                      অস্পষ্ট ফন্ট, অতিরঞ্জিত LED আলো (বাচ্চা/বয়স্কদের জন্য
                      বিরক্তিকর), ভুল তথ্য দেয়, কিছুক্ষণ পর অন/অফ হয়ে যায়
                    </td>
                    <td className='border border-gray-300 px-4 py-2 text-center text-sm text-green-600'>
                      ক্লিয়ার এবং প্রিমিয়াম LCD ডিসপ্লে, সঠিক তথ্য প্রদান করে
                    </td>
                  </tr>
                  <tr className='hover:bg-gray-50'>
                    <td className='border border-gray-300 px-4 py-2 text-sm text-gray-600 font-medium'>
                      ব্যাকআপ টাইম
                    </td>
                    <td className='border border-gray-300 px-4 py-2 text-center text-sm text-red-600'>
                      ঠিকমতো কাজ করে না, ১-২ ঘণ্টা পর শেষ
                    </td>
                    <td className='border border-gray-300 px-4 py-2 text-center text-sm text-green-600'>
                      ৫-৬ ঘণ্টা নির্ভরযোগ্য ব্যাকআপ
                    </td>
                  </tr>
                  <tr className='hover:bg-gray-50'>
                    <td className='border border-gray-300 px-4 py-2 text-sm text-gray-600 font-medium'>
                      চার্জিং স্পিড
                    </td>
                    <td className='border border-gray-300 px-4 py-2 text-center text-sm text-red-600'>
                      ধীর এবং অস্থির, টাইপ সি সাপোর্ট নেই
                    </td>
                    <td className='border border-gray-300 px-4 py-2 text-center text-sm text-green-600'>
                      টাইপ সি ফাস্ট চার্জিং, ১ ঘণ্টায় ফুল চার্জ
                    </td>
                  </tr>
                  <tr className='hover:bg-gray-50'>
                    <td className='border border-gray-300 px-4 py-2 text-sm text-gray-600 font-medium'>
                      নিরাপত্তা
                    </td>
                    <td className='border border-gray-300 px-4 py-2 text-center text-sm text-red-600'>
                      কোনো অ্যান্টি-হিট প্রটেকশন নেই, অতিরিক্ত গরম হয়
                    </td>
                    <td className='border border-gray-300 px-4 py-2 text-center text-sm text-green-600'>
                      ইনবিল্ট অ্যান্টি-হিট প্রটেকশন, শিশুর জন্য সম্পূর্ণ নিরাপদ
                    </td>
                  </tr>
                  <tr className='hover:bg-gray-50'>
                    <td className='border border-gray-300 px-4 py-2 text-sm text-gray-600 font-medium'>
                      বিল্ড কোয়ালিটি
                    </td>
                    <td className='border border-gray-300 px-4 py-2 text-center text-sm text-red-600'>
                      কমজোরি, সহজে ক্ষতিগ্রস্ত হয়
                    </td>
                    <td className='border border-gray-300 px-4 py-2 text-center text-sm text-green-600'>
                      উন্নত এবং হালকা ওজন, টেকসই
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className='mt-4 text-sm text-gray-600 italic'>
              অরিজিনাল প্রোডাক্ট কিনুন নিরাপদ এবং দীর্ঘস্থায়ী অভিজ্ঞতার জন্য!
            </p>
          </div>
        </div>
      </CustomSection>

      {/* Image Section */}
      <CustomSection>
        <div className='px-3 mb-2'>
          <div className='bg-white rounded-lg overflow-hidden shadow-md'>
            <img
              className='w-full h-[420px] md:h-full object-cover'
              src={
                '/assets/product/warmer/comp.jpeg' || '/images/placeholder.jpg'
              }
              alt='Product Usage'
            />
          </div>
        </div>
      </CustomSection>

      {/* FAQ Section */}
      <CustomSection>
        <div className='px-3'>
          <div className='bg-white p-5 rounded-lg shadow-md'>
            <h2 className='text-lg font-semibold text-gray-800 mb-4'>
              সাধারণ প্রশ্নোত্তর (FAQ)
            </h2>
            <div className='space-y-4'>
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className='border-b border-gray-200 pb-4 last:border-b-0'
                >
                  <details className='cursor-pointer'>
                    <summary className='text-sm font-medium text-gray-700 mb-2 hover:text-blue-600'>
                      {faq.question}
                    </summary>
                    <p className='text-sm text-gray-600 ml-4'>{faq.answer}</p>
                  </details>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CustomSection>

      {/* Reviews Section with Swiper - Images Only */}
      <CustomSection>
        <div className='px-3'>
          <div className='bg-white p-5 rounded-lg shadow-md'>
            <h2 className='text-lg font-semibold text-gray-800 mb-4'>
              গ্রাহকের রিভিউ
            </h2>
            <Swiper
              modules={[Autoplay]}
              spaceBetween={20}
              slidesPerView={1}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              className='w-full'
            >
              {reviews.map((review) => (
                <SwiperSlide key={review.id} className='!px-2'>
                  <div className='bg-gray-50 rounded-lg overflow-hidden shadow-sm border'>
                    <img
                      className='w-full h-[350px] md:h-[300px] object-cover'
                      src={review.image}
                      alt='Review Image'
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </CustomSection>

      {/* Existing Description Section */}
      <CustomSection>
        <div className='px-3'>
          <div className='bg-white p-5 rounded-lg'>
            <div className='flex justify-between items-center mb-3'>
              <h2 className='text-lg font-semibold'>Description</h2>
            </div>

            <div className='mt-10'>
              <p className='text-gray-600 font-mont text-sm'>
                আপনার শিশুর খাবারকে যেকোনো সময় উষ্ণ রাখুন এই পোর্টেবল
                রিচার্জেবল বেবি ফিডিং বোতল ওয়ার্মার দিয়ে। এটি শিশুদের জন্য
                বিশেষভাবে তৈরি, হালকা ওজন এবং উন্নত বিল্ড কোয়ালিটির সাথে। ৬০০০
                মিলি অ্যাম্পিয়ার ব্যাটারি দিয়ে এটি দীর্ঘস্থায়ী চার্জ প্রদান
                করে এবং টাইপ সি সাপোর্টেড ফাস্ট চার্জিংয়ের মাধ্যমে দ্রুত
                রিচার্জ হয়। ইনবিল্ট অ্যান্টি হিট প্রটেকশন নিশ্চিত করে নিরাপদ
                ব্যবহার, যাতে শিশুর খাবার উষ্ণ হয় কিন্তু অতিরিক্ত গরম না হয়।
              </p>
              <p className='text-gray-600 font-mont text-sm mt-4'>
                ভ্রমণকারী অভিভাবকদের জন্য আদর্শ, বিশেষ করে শীতকালে যখন শিশুর
                উষ্ণ খাবারের প্রয়োজন হয়। এটি সহজেই যেকোনো জায়গায় বহন করা
                যায়, হালকা ওজনের কারণে ব্যাগে রাখা সহজ। বাড়িতে, ভ্রমণে বা
                অফিসে— যেকোনো পরিস্থিতিতে এটি আপনার সঙ্গী হয়ে উঠবে। উচ্চমানের
                উপাদান দিয়ে তৈরি এটি টেকসই এবং দৈনন্দিন ব্যবহারের জন্য
                নির্ভরযোগ্য। শিশুর স্বাস্থ্য এবং আরামের জন্য এটি একটি অপরিহার্য
                সঙ্গী।
              </p>
              <p className='text-gray-600 font-mont text-sm mt-4'>
                এটি সব ধরনের বোতলের সাথে সামঞ্জস্যপূর্ণ এবং দ্রুত গরম করে, যা
                ব্যস্ত অভিভাবকদের জন্য পারফেক্ট।
              </p>
              <p className='py-5 text-gray-600 font-mont text-sm mt-4'>
                Key Features:
              </p>
              <ul className='list-disc list-inside text-gray-600 font-mont text-sm'>
                <li>🔋 ৬০০০ মিলি অ্যাম্পিয়ার রিচার্জেবল ব্যাটারি</li>
                <li>⚡ টাইপ সি সাপোর্টেড ফাস্ট চার্জিং</li>
                <li>🛡️ ইনবিল্ট অ্যান্টি হিট প্রটেকশন</li>
                <li>👶 শিশুদের জন্য উপযুক্ত এবং নিরাপদ</li>
                <li>⚖️ হালকা ওজন এবং উন্নত বিল্ড কোয়ালিটি</li>
                <li>✈️ ভ্রমণকারীদের জন্য আদর্শ, সহজে বহনযোগ্য</li>
                <li>❄️ বিশেষ করে শীতকালে উষ্ণ খাবারের জন্য</li>
                <li>🌍 যেকোনো জায়গায় সহজে ব্যবহারযোগ্য</li>
                <li>🥛 দ্রুত এবং সমানভাবে বোতল গরম করে</li>
              </ul>
            </div>
          </div>
        </div>
      </CustomSection>
      <Footer />
    </>
  );
};

export async function getStaticProps() {
  if (!productData) {
    return { notFound: true };
  }
  return { props: { initialProduct: productData } };
}

export default ProductDetails;
