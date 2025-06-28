import React from 'react';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { addToCart } from '@/store/cartSlice';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleBuyNow = () => {
    if (product && product.inStock) {
      // Use the first variant's color and image as defaults
      const defaultVariant = product.variants[0];
      dispatch(
        addToCart({
          id: product.id,
          title: product.title,
          slug: product.slug,
          price: product.price,
          selectedColor: defaultVariant.color,
          quantity: 1, // Default quantity
          image: defaultVariant.images[0], // Use the first image
        })
      );
      router.push('/order');
    }
  };

  return (
    <div className='bg-white rounded-xl p-2 md:p-3 w-44 md:w-56 flex flex-col h-[300px] md:h-[360px]'>
      {/* Product Image Section */}
      <div className='relative flex-shrink-0'>
        <Link href={`/product/${product?.slug}`}>
          <img
            src={product?.thumbnail}
            alt={product?.title}
            className='w-full h-36 md:h-44 object-cover rounded-lg'
          />
        </Link>
        {product?.sectionType === 'hot' && (
          <span className='absolute top-2 left-2 bg-accent text-white text-xs font-semibold px-2 py-1 rounded'>
            New
          </span>
        )}
      </div>

      {/* Product Details */}
      <Link
        href={`/product/${product?.slug}`}
        className='text-gray-900 font-semibold text-sm mt-5 block line-clamp-2 h-[40px] md:h-[48px] overflow-hidden'
      >
        {product?.title}
      </Link>

      {/* Pricing */}
      <div className='mt-2 flex items-center space-x-2'>
        <span className='text-accent text-md font-bold'>
          ৳{product?.price?.toFixed(2)}
        </span>
        <span className='text-gray-500 line-through text-xs'>
          ৳{product?.originalPrice?.toFixed(2)}
        </span>
      </div>

      {/* Buy Now Button */}
      {product?.inStock ? (
        <div className='mt-auto flex items-center justify-center'>
          <button
            onClick={handleBuyNow}
            className='text-xs bg-gray-100 w-full py-2 rounded-md font-semibold text-gray-700 hover:bg-accent hover:text-white transition duration-300'
          >
            Buy Now
          </button>
        </div>
      ) : (
        <div className='mt-auto flex items-center justify-center'>
          <button
            className='text-xs bg-gray-100 w-full py-2 rounded-md font-semibold text-red-700 hover:bg-accent hover:text-white transition duration-300 cursor-not-allowed'
            disabled
          >
            Out of Stock
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
