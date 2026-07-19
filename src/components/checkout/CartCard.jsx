import React from 'react';
import { useDispatch } from 'react-redux';
import { HiOutlineTrash } from 'react-icons/hi2';
import { removeFromCart } from '@/store/cartSlice';
import { sendGTMEvent } from '@next/third-parties/google';

const CartCard = ({ item }) => {
  const dispatch = useDispatch();

  const handleRemove = () => {
    if (typeof window !== 'undefined') {
      sendGTMEvent({ ecommerce: null });
      sendGTMEvent({
        event: 'remove_from_cart',
        ecommerce: {
          currency: 'BDT',
          value: (item.price || 0) * (item.quantity || 1),
          items: [
            {
              item_id: item.id || 'unknown',
              item_name: item.title || 'unknown',
              price: item.price || 0,
              quantity: item.quantity || 1,
              item_variant: item.selectedColor || item.selectedVariantValue,
              item_category: item.category || 'Accessories',
            },
          ],
        },
      });
    }
    dispatch(
      removeFromCart({
        id: item.id,
        selectedColor: item.selectedColor || item.selectedVariantValue,
      })
    );
  };

  return (
    <div className='bg-white rounded-lg shadow-md p-4 flex items-center gap-4 mb-4 hover:shadow-lg transition-shadow duration-300'>
      {/* Product Image */}
      <img
        className='h-20 w-20 object-cover rounded-md'
        src={item.image}
        alt={item.title}
      />
      {/* Product Details */}
      <div className='flex-1'>
        <h3 className='text-sm font-semibold text-gray-800 line-clamp-2'>
          {item.title}
        </h3>
        <p className='text-xs text-gray-500 mt-1'>
          Variant:{' '}
          <span className='font-medium'>
            {item.selectedColor || item.selectedVariantValue}
          </span>
        </p>
        <p className='text-xs text-gray-500'>
          Quantity: <span className='font-medium'>{item.quantity}</span>
        </p>
        <p className='text-sm font-bold text-blue-600 mt-1'>
          ৳{(item.price * item.quantity).toFixed(2)}
        </p>
      </div>
      {/* Remove Button */}
      <button
        onClick={handleRemove}
        className='text-red-500 hover:text-red-700 transition-colors duration-200'
        aria-label='Remove from cart'
      >
        <HiOutlineTrash className='text-xl' />
      </button>
    </div>
  );
};

export default CartCard;
