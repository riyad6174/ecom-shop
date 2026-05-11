import React, { useState, useEffect } from 'react';
import { sendGTMEvent } from '@next/third-parties/google';
import { useDispatch } from 'react-redux';
import Navbar from '@/components/common/Navbar';
import CustomSection from '@/components/layout/CustomSection';
import { products } from '@/utils/products';
import { addToCart } from '@/store/cartSlice';
import Footer from '@/components/common/Footer';
import Head from 'next/head';
import OrderDialog from '@/components/checkout/OrderDialog';
import Image from 'next/image';

const productData = products.find((p) => p.slug === 'outdoor-wall-lamp-waterproof');

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
                item_category: 'Lighting',
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

  const handleImageClick = (image) => setActiveImage(image);

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
              item_category: 'Lighting',
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

  return (
    <>
      <Head>
        <title>{product.title} | Sheii Shop</title>
        <meta
          name='description'
          content={`Buy the ${product.title} at Sheii Shop. ${product.description}`}
        />
        <meta
          name='keywords'
          content='remote control wall lamp, outdoor wall lamp, waterproof light, courtyard lamp, LED wall light, exterior lamp, touch control light, multifunctional lamp, Bangladesh'
        />
        <meta name='author' content='Sheii Shop' />
        <meta name='robots' content='index, follow' />
        <link
          rel='canonical'
          href={`https://www.sheiishop.com/product/${product.slug}`}
        />

        <meta property='og:title' content={`${product.title} | Sheii Shop`} />
        <meta property='og:description' content={product.description} />
        <meta property='og:type' content='product' />
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
              sku: product.model,
              brand: { '@type': 'Brand', name: 'OEM/ODM' },
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
        `}</style>

        <div className='py-8 container mx-auto px-4 lg:px-8'>
          <div className='bg-white md:py-6 rounded-2xl md:rounded-xl shadow-lg'>
            <div className='flex flex-col md:flex-row gap-4 md:gap-6 -mx-4'>
              {/* Image Section */}
              <div className='w-full md:w-3/4 px-4'>
                <div className='p-2 md:p-0 md:grid md:grid-cols-4 gap-4'>
                  <div className='col-span-3 md:pl-6'>
                    <div className='relative w-full h-[300px] md:h-[533px] rounded-lg overflow-hidden image-transition'>
                      <Image
                        fill
                        src={activeImage}
                        alt={product.title}
                        className='object-cover'
                        priority
                        sizes='(max-width: 768px) 100vw, 60vw'
                      />
                    </div>
                    {/* Thumbnails - Mobile */}
                    <div className='flex justify-center gap-2 mt-4 md:hidden'>
                      {product.images.slice(1).map((image, index) => (
                        <div
                          key={index}
                          className={`relative w-[80px] h-[80px] rounded-lg overflow-hidden cursor-pointer small-image ${
                            activeImage === image
                              ? 'small-image-active'
                              : 'small-image-inactive'
                          }`}
                          onClick={() => handleImageClick(image)}
                        >
                          <Image
                            fill
                            src={image}
                            alt={`${product.title} Thumbnail ${index + 1}`}
                            className='object-cover'
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Thumbnails - Desktop */}
                  <div className='col-span-1 hidden md:flex flex-col items-center gap-4'>
                    {product.images.slice(1).map((image, index) => (
                      <div
                        key={index}
                        className={`relative w-full h-[130px] rounded-lg overflow-hidden cursor-pointer small-image ${
                          activeImage === image
                            ? 'small-image-active'
                            : 'small-image-inactive'
                        }`}
                        onClick={() => handleImageClick(image)}
                      >
                        <Image
                          fill
                          src={image}
                          alt={`${product.title} Thumbnail ${index + 1}`}
                          className='object-cover'
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className='md:w-1/2 px-7 md:px-0 py-4'>
                <h2 className='text-lg md:text-2xl font-semibold font-mont text-gray-800 md:mb-4'>
                  {product.title}
                </h2>
                <p className='text-gray-600 text-sm mb-4 font-mont'>
                  {product.description}
                </p>

                {/* Price */}
                <div className='flex items-center justify-start gap-2 text-md mb-6'>
                  <span className='text-blue-600 font-bold text-xl'>
                    ৳{product.price.toFixed(2)}
                  </span>
                  <span className='text-gray-500 font-normal text-lg line-through'>
                    ৳{product.originalPrice.toFixed(2)}
                  </span>
                </div>

                {/* Quantity */}
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
                    className='flex items-center bg-gradient-to-r from-blue-700 to-blue-900 text-white justify-center gap-2 px-6 py-[12px] rounded-md font-mont font-semibold text-sm hover:from-blue-800 hover:to-blue-950 transition-all shadow-md disabled:opacity-70'
                    disabled={!product.inStock || isAddingToCart}
                  >
                    {isAddingToCart ? (
                      <>
                        <svg
                          className='animate-spin h-4 w-4 text-white'
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                        >
                          <circle
                            className='opacity-25'
                            cx='12'
                            cy='12'
                            r='10'
                            stroke='currentColor'
                            strokeWidth='4'
                          />
                          <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                          />
                        </svg>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>{product.inStock ? 'Buy Now' : 'Out of Stock'}</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <CustomSection>
        <div className='px-3'>
          <div className='bg-white p-5 rounded-lg'>
            <div className='flex justify-between items-center mb-3'>
              <h2 className='text-lg font-semibold'>পণ্যের বিবরণ</h2>
            </div>

            <div className='mt-5 space-y-4 text-gray-700 font-mont text-sm leading-relaxed'>
              <p>
                আমাদের <strong>Multifunctional Remote Control Outdoor Wall Lamp</strong> হলো একটি
                স্মার্ট ও আধুনিক আলোকসজ্জার সমাধান, যা আপনার বাড়ির বাইরের দেয়াল, সিঁড়ি, উঠান
                বা কোর্টইয়ার্ডকে সুন্দরভাবে আলোকিত করবে। রিমোট কন্ট্রোল ও টাচ উভয় পদ্ধতিতে
                অপারেট করা যায়, ফলে দূর থেকেও অনায়াসে লাইট নিয়ন্ত্রণ করা সম্ভব।
                ওয়াটারপ্রুফ ডিজাইনের কারণে বৃষ্টি বা আর্দ্র আবহাওয়াতেও নিশ্চিন্তে ব্যবহার
                করা যাবে।
              </p>

              <div className='relative w-full h-[300px] md:h-[420px] rounded-lg overflow-hidden'>
                <Image
                  fill
                  src='/assets/product/light/img2.jpg'
                  alt='Remote Control Outdoor Wall Lamp feature image'
                  className='object-cover rounded-lg'
                />
              </div>

              <p>
                রিমোট কন্ট্রোলের মাধ্যমে ঘরের ভেতর থেকেও বাইরের লাইট সহজে চালু/বন্ধ করুন এবং
                ব্রাইটনেস ও কালার টেম্পারেচার পরিবর্তন করুন। টাচ কন্ট্রোল ব্যবহার করেও একই
                সুবিধা পাওয়া যাবে। এতে রয়েছে{' '}
                <strong>২০০০ mAh বিল্ট-ইন রিচার্জেবল ব্যাটারি</strong>, যা DC 5V দিয়ে চার্জ হয়
                এবং একবার চার্জে দীর্ঘক্ষণ ব্যবহার উপযোগী।
              </p>

              <div className='relative w-full h-[300px] md:h-[420px] rounded-lg overflow-hidden'>
                <Image
                  fill
                  src='/assets/product/light/img4.jpg'
                  alt='Remote Control Wall Lamp description'
                  className='object-cover rounded-lg'
                />
              </div>

              <p>
                <strong>২৭০০K থেকে ৬০০০K</strong> কালার টেম্পারেচার রেঞ্জ থাকায় উষ্ণ থেকে
                শীতল যেকোনো আলোর পরিবেশ তৈরি করা সম্ভব। ৩০০ লুমেন উজ্জ্বলতা সহ এই ল্যাম্পটি
                যথেষ্ট শক্তিশালী আলো প্রদান করে। মেমোরি ফাংশন থাকায় পাওয়ার অফ করলেও শেষ
                সেটিং মনে রাখে — পরের বার চালু করলে আগের মতোই জ্বলবে।
              </p>

              <div className='relative w-full h-[300px] md:h-[420px] rounded-lg overflow-hidden'>
                <Image
                  fill
                  src='/assets/product/light/img3.jpg'
                  alt='Remote Control Wall Lamp usage'
                  className='object-cover rounded-lg'
                />
              </div>

              <p className='font-semibold text-gray-800'>মূল বৈশিষ্ট্যসমূহ:</p>
              <ul className='list-disc list-inside space-y-1 text-gray-600'>
                <li>✅ রিমোট কন্ট্রোল + টাচ কন্ট্রোল — দ্বৈত নিয়ন্ত্রণ পদ্ধতি</li>
                <li>✅ ওয়াটারপ্রুফ ডিজাইন — বৃষ্টি ও আর্দ্রতায় নির্ভরযোগ্য</li>
                <li>✅ ২০০০ mAh রিচার্জেবল ব্যাটারি — দীর্ঘস্থায়ী ব্যবহার</li>
                <li>✅ ২৭০০K–৬০০০K কালার টেম্পারেচার — উষ্ণ থেকে শীতল আলো</li>
                <li>✅ ৩০০ লুমেন উজ্জ্বল আলো</li>
                <li>✅ ৫০,০০০ ঘন্টার দীর্ঘস্থায়ী LED লাইফস্প্যান</li>
                <li>✅ মেমোরি ফাংশন — শেষ সেটিং স্বয়ংক্রিয়ভাবে মনে রাখে</li>
                <li>✅ ABS বডি ও প্লাস্টিক শেড — হালকা ও টেকসই</li>
                <li>✅ আধুনিক রাউন্ড মিনিমালিস্ট ডিজাইন — যেকোনো দেয়ালে মানানসই</li>
                <li>✅ DC 5V ইনপুট — USB দিয়ে সহজে চার্জ করুন</li>
                <li>✅ Ra 80 কালার রেন্ডারিং — প্রাকৃতিক রঙ প্রদর্শন</li>
              </ul>

              <p className='font-semibold text-gray-800'>টেকনিক্যাল স্পেসিফিকেশন:</p>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm border-collapse border border-gray-200'>
                  <tbody>
                    {[
                      ['মডেল নম্বর', 'WL-C6103C(Touch)'],
                      ['ইনপুট ভোল্টেজ', 'DC 5V'],
                      ['লাইট সোর্স', 'LED'],
                      ['কালার টেম্পারেচার', '২৭০০K – ৬০০০K'],
                      ['লুমেন', '৩০০ lm'],
                      ['লাইফস্প্যান', '৫০,০০০ ঘন্টা'],
                      ['কন্ট্রোল মোড', 'রিমোট কন্ট্রোল + টাচ কন্ট্রোল'],
                      ['ব্যাটারি', '২০০০ mAh'],
                      ['ওয়ার্কিং টাইম', '৩০,০০০ ঘন্টা'],
                      ['কালার রেন্ডারিং ইনডেক্স', 'Ra 80'],
                      ['লুমিনাস এফিশিয়েন্সি', '80 lm/w'],
                      ['বডি মেটেরিয়াল', 'ABS'],
                      ['শেড মেটেরিয়াল', 'প্লাস্টিক'],
                      ['শেড শেপ', 'রাউন্ড'],
                      ['ডিমার সাপোর্ট', 'নেই'],
                      ['ওজন', '০.২৯৯ কেজি'],
                      ['প্যাকেজ সাইজ', '15×12×8 cm'],
                      ['উৎপত্তি স্থান', 'গুয়াংডং, চীন'],
                      ['ওয়ারেন্টি', '১ বছর'],
                    ].map(([label, value], idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className='border border-gray-200 px-3 py-2 font-medium text-gray-700 w-1/2'>
                          {label}
                        </td>
                        <td className='border border-gray-200 px-3 py-2 text-gray-600'>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Video Section */}
            <div className='mt-10'>
              <h3 className='text-lg font-semibold font-mont text-gray-800 mb-4'>
                পণ্যের ভিডিও
              </h3>
              <div className='max-w-full md:max-w-3xl mx-auto rounded-xl overflow-hidden'>
                <video
                  className='w-full h-[300px] md:h-[500px]'
                  controls
                  poster='/assets/product/light/main.jpg'
                >
                  <source src='/assets/product/light/light.mp4' type='video/mp4' />
                  Your browser does not support the video tag.
                </video>
              </div>
              <p className='text-gray-600 font-mont text-sm mt-4'>
                উপরের ভিডিওতে পণ্যটির বিস্তারিত দেখুন এবং এটি কীভাবে কাজ করে তা জানুন।
              </p>
            </div>
          </div>
        </div>
      </CustomSection>

      <Footer />

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
