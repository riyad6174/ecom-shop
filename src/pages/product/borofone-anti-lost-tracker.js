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

// Find the specific product for this page
const productData = products.find(
  (p) => p.slug === 'borofone-anti-lost-tracker'
);

const ProductDetails = ({ initialProduct }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [product, setProduct] = useState(initialProduct);
  const [selectedColor, setSelectedColor] = useState('');
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
      setSelectedColor(initialProduct.variants[0]?.color || '');
      setActiveImage(initialProduct.images[0] || ''); // Set first image as default

      // Push product view event to data layer
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'view_item',
        ecommerce: {
          items: [
            {
              item_id: initialProduct.id || 'unknown',
              item_name: initialProduct.title || 'unknown',
              price: initialProduct.price || 0,
              original_price: initialProduct.originalPrice || 0,
              item_category: 'Accessories', // Adjusted for tracker category
              item_variant: initialProduct.variants
                ? initialProduct.variants.map((v) => v.color).join(', ')
                : 'unknown',
            },
          ],
          currency: 'BDT', // Bangladeshi Taka
          value: initialProduct.price || 0,
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
    if (product) {
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
              item_category: 'Wearables',
              item_variant: selectedColor || 'unknown',
              quantity: quantity || 1,
            },
          ],
        },
      });
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
      router.push('/order');
    }
  };

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <>
      <Head>
        <title>{product.title} | Sheii Shop</title>
        <meta
          name='description'
          content='Shop the Borofone BS101 Anti-Lost Tracker – Apple Find My compatible, compact, water-resistant, and reliable for everyday use.'
        />
        <meta property='og:title' content={`${product.title} | Sheii Shop`} />
        <meta
          property='og:description'
          content='Track your valuables with the Borofone BS101 Anti-Lost Tracker. IP65 water-resistant, Apple Find My compatible, and long battery life.'
        />
        <meta
          property='og:url'
          content={`https://www.sheiishop.com/product/${product.slug}`}
        />
        <meta property='og:type' content='product' />
        <meta property='og:image' content={product.images[0]} />
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:title' content={`${product.title} | Sheii Shop`} />
        <meta
          name='twitter:description'
          content='Track your valuables with the Borofone BS101 Anti-Lost Tracker. Long battery life, waterproof, iOS-compatible.'
        />
        <meta name='twitter:image' content={product.images[0]} />

        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: product.title,
              image: product.images,
              description:
                'Borofone BS101 Anti-Lost Tracker with Apple Find My support, waterproof build, and up to 12 months of battery life.',
              sku: product.id,
              brand: {
                '@type': 'Brand',
                name: 'Borofone',
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
              {/* Image Section */}
              <div className='w-full md:w-3/4 px-4'>
                <div className='p-2 md:p-0 md:grid md:grid-cols-4 gap-4'>
                  {/* Main Image */}
                  <div className='col-span-3 md:pl-6'>
                    <img
                      className='w-full h-[267px] md:h-[533px] object-cover rounded-lg image-transition'
                      src={activeImage}
                      alt={product.title}
                    />
                    {/* Small Images for Mobile */}
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
                  {/* Small Images for Desktop */}
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
              {/* Product Details */}
              <div className='md:w-1/2 px-7 md:px-0 py-4'>
                <h2 className='text-lg md:text-2xl font-semibold font-mont text-gray-800 md:mb-4'>
                  {product.title}
                </h2>
                <p className='text-gray-600 text-sm mb-4 font-mont'>
                  {product.description}
                </p>

                <div className='mb-6'>
                  <span className='font-semibold text-gray-700'>
                    Choose a Color
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
                </div>

                {/* Price */}
                <div className='flex items-center justify-start gap-2 text-md mb-6'>
                  <span className='text-blue-600 font-bold text-xl'>
                    ৳ {product.price.toFixed(2)}
                  </span>
                  <span className='text-gray-500 font-normal text-lg line-through'>
                    ৳ {product.originalPrice.toFixed(2)}
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
                    className='flex items-center bg-blue-600 text-white justify-center gap-2 border border-blue-600 px-6 py-[12px] rounded-md font-mont font-semibold text-sm'
                    disabled={!product.inStock}
                  >
                    <span>{product.inStock ? 'Buy Now' : 'Out of Stock'}</span>
                  </button>
                </div>

                {/* Share */}
                {/* <div className='flex items-center justify-start gap-4'>
                  <div className='border border-gray-300 p-1 rounded-lg'>
                    <GoShareAndroid className='text-2xl' />
                  </div>
                  <span className='font-mont text-xs font-medium'>
                    {product.inStock
                      ? '(There are 60 products left)'
                      : '(Out of stock)'}
                  </span>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      <CustomSection>
        <div className='px-3'>
          <div className='bg-white p-5 rounded-lg'>
            <div className='flex justify-between items-center mb-3'>
              <h2 className='text-lg font-semibold'>Description</h2>
            </div>
            <div className='mt-10'>
              <p className='text-gray-600 font-mont text-sm'>
                Never lose track of your valuables with the **Borofone BS101
                Intelligent Anti-Lost Tracker**, a sleek and compact device
                designed to keep your essentials secure. Crafted with durable
                ABS material, this lightweight tracker (only 7g) seamlessly
                integrates with Apple’s Find My network, offering precise,
                real-time location tracking for your keys, wallet, bag, or even
                your pet.
              </p>
              <p className='text-gray-600 font-mont text-sm mt-4'>
                Equipped with a **210mAh CR2032 button battery**, the BS101
                provides up to **9-12 months of battery life**, with easy
                replacement to keep you worry-free. Its **intelligent
                positioning** and **sound alert** features let you locate items
                instantly via the Find My app on your iPhone, iPad, or iPod
                touch (iOS 14.5+ or iPadOS 14.5+). The **compact design**
                (38.5x32x9mm) makes it easy to attach to any item, while its
                **IP65 water-resistant** build ensures durability in everyday
                scenarios like rain or splashes.
              </p>
              <p className='text-gray-600 font-mont text-sm mt-4'>
                Whether you’re a traveler, student, or busy professional, the
                BS101 offers peace of mind with its **anti-loss reminder** that
                notifies you if you leave your items behind. Stylish, reliable,
                and user-friendly, the Borofone BS101 is your ultimate companion
                for keeping what matters most within reach.
              </p>
              <p className='py-5 text-gray-600 font-mont text-sm mt-4'>
                Key Features:
              </p>
              <ul className='list-disc list-inside text-gray-600 font-mont text-sm'>
                <li>📍 Seamless integration with Apple Find My network</li>
                <li>🔊 Sound alert for quick item location</li>
                <li>📱 Anti-loss notifications via smartphone</li>
                <li>🔋 210mAh CR2032 battery with 9-12 months life</li>
                <li>💧 IP65 water-resistant for daily durability</li>
                <li>👜 Compact and lightweight (38.5x32x9mm, 7g)</li>
                <li>🛠 Durable ABS construction</li>
                <li>📲 Compatible with iOS 14.5+ and iPadOS 14.5+</li>
              </ul>
            </div>
          </div>

          {/* User Manual */}
          <div className='bg-white p-5 rounded-lg mt-6'>
            <div className='flex justify-between items-center mb-3'>
              <h2 className='text-lg font-semibold'>User Manual</h2>
            </div>
            <div className='mt-10'>
              <p className='text-gray-600 font-mont text-sm'>
                Get started with your **Borofone BS101 Anti-Lost Tracker** in
                just a few simple steps:
              </p>
              <ol className='list-decimal list-inside text-gray-600 font-mont text-sm mt-4 space-y-2'>
                <li>
                  <span className='font-semibold'>Insert the Battery:</span>{' '}
                  Open the back cover of the BS101 and insert the provided
                  CR2032 button battery. Ensure the positive (+) side faces up,
                  then securely close the cover.
                </li>
                <li>
                  <span className='font-semibold'>Pair with Find My App:</span>{' '}
                  On your iPhone, iPad, or iPod touch (iOS 14.5+ or iPadOS
                  14.5+), open the **Find My** app. Press the button on the
                  BS101 tracker until it beeps. In the app, tap “Add Item” and
                  select “Other Supported Item.” Follow the on-screen
                  instructions to pair the tracker with your Apple account.
                </li>
                <li>
                  <span className='font-semibold'>Attach to Your Item:</span>{' '}
                  Use the built-in keyring or adhesive mount to attach the BS101
                  to your keys, bag, wallet, or pet collar.
                </li>
                <li>
                  <span className='font-semibold'>Track Your Item:</span> Open
                  the Find My app to view the tracker’s location in real-time.
                  Use the “Play Sound” feature to trigger a beep if the item is
                  nearby, or check the map for its last known location.
                </li>
                <li>
                  <span className='font-semibold'>Enable Notifications:</span>{' '}
                  In the Find My app, enable “Notify When Left Behind” to
                  receive alerts if you move away from your tracker.
                </li>
                <li>
                  <span className='font-semibold'>Replace Battery:</span> When
                  the battery is low (after 9-12 months), replace it with a new
                  CR2032 battery. No tools are required for the swap.
                </li>
              </ol>
              <p className='text-gray-600 font-mont text-sm mt-4'>
                <span className='font-semibold'>Note:</span> Ensure your device
                is running iOS 14.5 or later for compatibility. Keep the tracker
                away from extreme heat or prolonged water exposure to maintain
                performance.
              </p>
              <p className='text-gray-600 font-mont text-sm mt-4'>
                <span className='font-semibold'>Package Includes:</span>{' '}
                Borofone BS101 Tracker, CR2032 Battery, User Manual, Adhesive
                Mount
              </p>
            </div>
          </div>
        </div>
      </CustomSection>
      {/* <Related /> */}
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
