import React from 'react';
import Link from 'next/link';

const ProductCard = ({ product }) => {
  // Support both database format (_id, basePrice) and static format (id, price)
  const price = product.basePrice || product.price;
  const originalPrice = product.baseOriginalPrice || product.originalPrice;
  const isInStock = product.inStock !== undefined ? product.inStock : true;

  return (
    <div className='bg-white rounded-xl p-2 md:p-3 w-44 md:w-56 flex flex-col h-[300px] md:h-[360px]'>
      {/* Product Image Section */}
      <div className='relative flex-shrink-0'>
        {isInStock ? (
          <Link href={`/product/${product?.slug}`}>
            <img
              src={product?.thumbnail}
              alt={product?.title}
              className='w-full h-36 md:h-44 object-cover rounded-lg'
            />
          </Link>
        ) : (
          <img
            src={product?.thumbnail}
            alt={product?.title}
            className='w-full h-36 md:h-44 object-cover rounded-lg opacity-70'
          />
        )}
        {product?.sectionType === 'hot' && (
          <span className='absolute top-2 left-2 bg-accent text-white text-xs font-semibold px-2 py-1 rounded'>
            New
          </span>
        )}
      </div>

      {/* Product Details */}
      {isInStock ? (
        <Link
          href={`/product/${product?.slug}`}
          className='text-gray-900 font-semibold text-sm mt-5 block line-clamp-2 h-[40px] md:h-[48px] overflow-hidden'
        >
          {product?.title}
        </Link>
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
          <Link
            href={`/product/${product?.slug}`}
            className='text-xs bg-gray-100 text-center w-full py-2 rounded-md font-semibold text-gray-700 hover:bg-accent hover:text-white transition duration-300'
          >
            Order Now
          </Link>
        </div>
      ) : (
        <div className='mt-auto flex items-center justify-center'>
          <span
            className='text-xs bg-gray-100 w-full py-2 rounded-md font-semibold text-red-700 text-center cursor-not-allowed'
          >
            Out of Stock
          </span>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
