import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { sendGTMEvent } from '@next/third-parties/google';

const ProductCard = ({ product }) => {
  const router = useRouter();
  // Support both database format (_id, basePrice) and static format (id, price)
  const price = product.basePrice || product.price;
  const originalPrice = product.baseOriginalPrice || product.originalPrice;
  const isInStock = product.inStock !== undefined ? product.inStock : true;

  const handleProductClick = (e) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      sendGTMEvent({ ecommerce: null });
      sendGTMEvent({
        event: 'select_item',
        ecommerce: {
          items: [
            {
              item_id: product.id || product._id || 'unknown',
              item_name: product.title || 'unknown',
              price: price || 0,
              item_category: product.category || 'General',
              item_list_name: 'Product List',
            },
          ],
        },
      });
    }
    router.push(`/product/${product?.slug}`);
  };

  return (
    <div className='bg-white rounded-xl p-2 md:p-3 w-44 md:w-56 flex flex-col h-[300px] md:h-[360px]'>
      {/* Product Image Section */}
      <div className='relative flex-shrink-0'>
        {isInStock ? (
          <a
            href={`/product/${product?.slug}`}
            onClick={handleProductClick}
            className='relative block w-full h-36 md:h-44 rounded-lg overflow-hidden'
          >
            <Image
              src={product?.thumbnail}
              alt={product?.title}
              fill
              sizes='(max-width: 768px) 45vw, 220px'
              className='object-cover'
            />
          </a>
        ) : (
          <div className='relative block w-full h-36 md:h-44 rounded-lg overflow-hidden opacity-70'>
            <Image
              src={product?.thumbnail}
              alt={product?.title}
              fill
              sizes='(max-width: 768px) 45vw, 220px'
              className='object-cover'
            />
          </div>
        )}
        {product?.sectionType === 'hot' && (
          <span className='absolute top-2 left-2 bg-accent text-white text-xs font-semibold px-2 py-1 rounded'>
            New
          </span>
        )}
      </div>

      {/* Product Details */}
      {isInStock ? (
        <a
          href={`/product/${product?.slug}`}
          onClick={handleProductClick}
          className='text-gray-900 font-semibold text-sm mt-5 block line-clamp-2 h-[40px] md:h-[48px] overflow-hidden'
        >
          {product?.title}
        </a>
      ) : (
        <span className='text-gray-900 font-semibold text-sm mt-5 block line-clamp-2 h-[40px] md:h-[48px] overflow-hidden'>
          {product?.title}
        </span>
      )}

      {/* Pricing */}
      <div className='mt-2 flex items-center space-x-2'>
        {price && (
          <span className='text-accent text-md font-bold'>
            ৳{price.toFixed(2)}
          </span>
        )}
        {originalPrice && originalPrice > price && (
          <span className='text-gray-500 line-through text-xs'>
            ৳{originalPrice.toFixed(2)}
          </span>
        )}
      </div>

      {/* Buy Now Button */}
      {isInStock ? (
        <div className='mt-auto flex items-center justify-center'>
          <a
            href={`/product/${product?.slug}`}
            onClick={handleProductClick}
            className='text-xs bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-center w-full py-2 rounded-md font-semibold text-white hover:from-blue-800 hover:to-blue-950 transition-all'
          >
            Order Now
          </a>
        </div>
      ) : (
        <div className='mt-auto flex items-center justify-center'>
          <span className='text-xs bg-gray-100 w-full py-2 rounded-md font-semibold text-red-700 text-center cursor-not-allowed'>
            Out of Stock
          </span>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
