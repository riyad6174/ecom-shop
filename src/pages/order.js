import React, { useState, useEffect } from 'react';
import { sendGTMEvent } from '@next/third-parties/google';
import { useSelector, useDispatch } from 'react-redux';
import Navbar from '@/components/common/Navbar';
import CustomSection from '@/components/layout/CustomSection';
import { IoMdArrowBack } from 'react-icons/io';
import CartCard from '@/components/checkout/CartCard';
import HeaderSm from '@/components/common/HeaderSm';
import Footer from '@/components/common/Footer';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import DeliveryAndReturnPolicy from '@/components/CartPolicy';
import Link from 'next/link';
import { clearCart } from '@/store/cartSlice';
import { useRouter } from 'next/router';

function Cart() {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const router = useRouter();
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    deliveryZone: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);

  // Pricing state
  const [totalPrice, setTotalPrice] = useState(0);
  const [shippingCharge, setShippingCharge] = useState(60);
  const [grandTotal, setGrandTotal] = useState(0);

  // Push begin_checkout event when order page loads with cart items
  useEffect(() => {
    if (typeof window !== 'undefined' && cartItems.length > 0) {
      sendGTMEvent({ ecommerce: null });
      sendGTMEvent({
        event: 'begin_checkout',
        ecommerce: {
          currency: 'BDT',
          value: cartItems.reduce(
            (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
            0,
          ),
          items: cartItems.map((item) => ({
            item_id: item.id || 'unknown',
            item_name: item.title || 'unknown',
            price: item.price || 0,
            quantity: item.quantity || 1,
            item_variant: item.selectedColor || item.selectedVariantValue,
            item_category: item.category || 'Accessories',
          })),
        },
      });
    }
  }, []);

  // Calculate totals based on cart items
  useEffect(() => {
    const total = cartItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );
    setTotalPrice(total);
    setGrandTotal(total + shippingCharge);
  }, [cartItems, shippingCharge]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  // Handle phone number change
  const handlePhoneChange = (value) => {
    setFormData({ ...formData, phoneNumber: value || '' });
    validateField('phoneNumber', value || '');
  };

  // Handle delivery zone selection
  const handleDeliveryZoneChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, deliveryZone: value });
    validateField('deliveryZone', value);
    const newShippingCharge = value === 'ঢাকার ভেতরে' ? 60 : 120;
    setShippingCharge(newShippingCharge);
    setGrandTotal(totalPrice + newShippingCharge);
  };

  // Validate individual field
  const validateField = (name, value) => {
    let newErrors = { ...errors };
    switch (name) {
      case 'fullName':
        if (!value.trim()) {
          newErrors.fullName = 'Full name is required';
        } else if (value.length < 2) {
          newErrors.fullName = 'Full name must be at least 2 characters';
        } else {
          delete newErrors.fullName;
        }
        break;
      case 'phoneNumber':
        if (!value) {
          newErrors.phoneNumber = 'Phone number is required';
        } else if (!/^\+880\d{10}$/.test(value)) {
          newErrors.phoneNumber =
            'Please enter a valid Bangladesh phone number';
        } else {
          delete newErrors.phoneNumber;
        }
        break;
      case 'deliveryZone':
        if (!value) {
          newErrors.deliveryZone = 'Please select a delivery zone';
        } else {
          delete newErrors.deliveryZone;
        }
        break;
      case 'address':
        if (!value.trim()) {
          newErrors.address = 'Address is required';
        } else if (value.length < 5) {
          newErrors.address = 'Address must be at least 5 characters';
        } else {
          delete newErrors.address;
        }
        break;
      default:
        break;
    }
    setErrors(newErrors);
  };

  // Validate entire form on submit
  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    else if (formData.fullName.length < 2)
      newErrors.fullName = 'Full name must be at least 2 characters';
    if (!formData.phoneNumber)
      newErrors.phoneNumber = 'Phone number is required';
    else if (!/^\+880\d{10}$/.test(formData.phoneNumber))
      newErrors.phoneNumber = 'Please enter a valid Bangladesh phone number';
    if (!formData.deliveryZone) newErrors.deliveryZone = 'Please select a delivery zone';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    else if (formData.address.length < 5)
      newErrors.address = 'Address must be at least 5 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setSubmissionError(null);

    const uniqueId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const order = {
      user: { ...formData },
      order: {
        items: [...cartItems],
        totalPrice,
        shippingCharge,
        grandTotal,
        orderDate: new Date().toISOString(),
        orderId: uniqueId,
      },
    };

    const bdtTime = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Dhaka',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });

    const sheetData = {
      name: formData.fullName || '',
      phone: formData.phoneNumber || '',
      deliveryZone: formData.deliveryZone || '',
      address: formData.address || '',
      items: JSON.stringify(
        cartItems.map((item) => ({
          title: item.title || 'Unknown',
          price: item.price || 0,
          quantity: item.quantity || 1,
          variant: (item.selectedColor ? `Color: ${item.selectedColor}` : '') || (item.selectedVariantValue ? `Type: ${item.selectedVariantValue}` : '') || 'Standard',
        }))
      ),
      totalPrice: totalPrice || 0,
      shippingCharge: shippingCharge || 0,
      grandTotal: grandTotal || 0,
      orderId: uniqueId,
      orderDate: new Date().toISOString(),
      submissionTime: bdtTime,
      sheetName: 'Orders',
    };

    if (
      !sheetData.name ||
      !sheetData.phone ||
      !sheetData.deliveryZone ||
      !sheetData.address
    ) {
      setSubmissionError('Please fill all required fields.');
      setIsLoading(false);
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      console.log('Sending fetch request:', {
        url: '/api/submit',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sheetData),
      });
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sheetData),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error response:', errorData);
        setSubmissionError(errorData.message || 'Failed to submit order');
      } else {
        console.log('Order Submitted:', order);
        setOrderDetails(order);
        setShowPopup(true);

        // Push purchase event to data layer
        sendGTMEvent({ ecommerce: null });
        sendGTMEvent({
          event: 'purchase',
          ecommerce: {
            transaction_id: order.order.orderId || 'ORD-UNKNOWN',
            value: order.order.grandTotal || 0,
            currency: 'BDT',
            shipping: order.order.shippingCharge || 0,
            items: order.order.items.map((item) => ({
              item_id: item.id || 'unknown',
              item_name: item.title || 'unknown',
              price: item.price || 0,
              quantity: item.quantity || 1,
              item_variant: item.selectedColor || item.selectedVariantValue,
              item_category: item.category || 'Accessories',
            })),
          },
        });
      }
    } catch (error) {
      console.error('Fetch error:', error.name, error.message);
      setSubmissionError('Error submitting order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle popup close
  const handleClosePopup = () => {
    setShowPopup(false);
    setOrderDetails(null);
    dispatch(clearCart());
    router.push('/');
  };


  return (
    <div>
      <div className='hidden md:block'>
        <Navbar />
      </div>
      <HeaderSm>
        <Link href='/'>
          <IoMdArrowBack className='text-2xl' />
        </Link>
        <span className='text-xl font-semibold'>Order</span>
        <div></div>
      </HeaderSm>
      <CustomSection>
        <div className='mx-auto pt-16 md:pt-0'>
          <div className='flex flex-col md:flex-row gap-5'>
            {/* Cart Items */}
            <div className='md:w-4/5'>
              <div className='md:bg-white py-4 px-6 md:p-6 md:mb-4 md:rounded-lg md:shadow'>
                <h2 className='text-lg font-semibold mb-4'>Your Cart</h2>
                {cartItems.length === 0 ? (
                  <div className='flex flex-col gap-4 items-center justify-center h-24'>
                    <p className='text-gray-500'>Your cart is empty.</p>
                    <Link
                      href='/'
                      className='text-white mt-2 bg-blue-700 rounded-lg px-4 py-2 text-sm font-semibold'
                    >
                      Continue Shopping
                    </Link>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <CartCard
                      key={`${item.id}-${
                        item.selectedColor || item.selectedVariantValue
                      }`}
                      item={item}
                    />
                  ))
                )}
                <div className='hidden md:block'>
                  <DeliveryAndReturnPolicy />
                </div>
              </div>
            </div>
            {/* Checkout Form */}
            <div className='md:w-1/3'>
              <div className='bg-white rounded-lg shadow-md p-6'>
                <div className='pb-4'>
                  <h2 className='text-lg font-semibold'>Proceed to Checkout</h2>
                </div>
                <form
                  onSubmit={handleSubmit}
                  className='border md:border-2 rounded-lg md:border-blue-400 p-4 bg-gray-50'
                >
                  <div className='space-y-4'>
                    {/* Full Name */}
                    <div>
                      <label
                        htmlFor='fullName'
                        className='block text-sm font-medium text-gray-700 mb-1'
                      >
                        Full Name
                      </label>
                      <input
                        type='text'
                        id='fullName'
                        name='fullName'
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder='Enter Full Name'
                        className='py-2 px-3 border w-full rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      />
                      {errors.fullName && (
                        <p className='text-red-500 text-xs mt-1'>
                          {errors.fullName}
                        </p>
                      )}
                    </div>
                    {/* Phone Number */}
                    <div>
                      <label
                        htmlFor='phoneNumber'
                        className='block text-sm font-medium text-gray-700 mb-1'
                      >
                        Phone Number
                      </label>
                      <PhoneInput
                        id='phoneNumber'
                        defaultCountry='BD'
                        value={formData.phoneNumber}
                        onChange={handlePhoneChange}
                        placeholder='Enter Phone Number'
                        className='py-2 px-3 border w-full rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      />
                      {errors.phoneNumber && (
                        <p className='text-red-500 text-xs mt-1'>
                          {errors.phoneNumber}
                        </p>
                      )}
                    </div>
                    {/* Delivery Zone */}
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Delivery Zone
                      </label>
                      <div className='flex gap-3'>
                        <button
                          type='button'
                          onClick={() => handleDeliveryZoneChange({ target: { value: 'ঢাকার ভেতরে' } })}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border-2 transition-all ${
                            formData.deliveryZone === 'ঢাকার ভেতরে'
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          ঢাকার ভেতরে
                          <span className='block text-xs mt-0.5 opacity-70'>৳60</span>
                        </button>
                        <button
                          type='button'
                          onClick={() => handleDeliveryZoneChange({ target: { value: 'ঢাকার বাহিরে' } })}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border-2 transition-all ${
                            formData.deliveryZone === 'ঢাকার বাহিরে'
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          ঢাকার বাহিরে
                          <span className='block text-xs mt-0.5 opacity-70'>৳120</span>
                        </button>
                      </div>
                      {errors.deliveryZone && (
                        <p className='text-red-500 text-xs mt-1'>
                          {errors.deliveryZone}
                        </p>
                      )}
                    </div>
                    {/* Address */}
                    <div>
                      <label
                        htmlFor='address'
                        className='block text-sm font-medium text-gray-700 mb-1'
                      >
                        Details Address
                      </label>
                      <input
                        type='text'
                        id='address'
                        name='address'
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder='এলাকার নাম, থানা, জেলা'
                        className='py-2 px-3 border w-full rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      />
                      {errors.address && (
                        <p className='text-red-500 text-xs mt-1'>
                          {errors.address}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Pricing Summary */}
                  <div className='py-4 font-thin text-[16px] bg-blue-50 rounded-lg p-4 text-blue-800 my-5'>
                    <div className='flex text-sm md:text-md justify-between mb-2'>
                      <span>Total Price</span>
                      <span>৳{totalPrice.toFixed(2)}</span>
                    </div>
                    <div className='flex text-sm md:text-md justify-between mb-2'>
                      <span>Shipping Charge</span>
                      <span>৳{shippingCharge.toFixed(2)}</span>
                    </div>
                    <hr className='my-2' />
                    <div className='flex justify-between my-4'>
                      <span className='font-semibold text-sm md:text-lg'>
                        Grand Total
                      </span>
                      <span className='font-semibold text-sm md:text-lg'>
                        ৳{grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  {/* Submission Error */}
                  {submissionError && (
                    <p className='text-red-500 text-sm mb-2'>
                      {submissionError}
                    </p>
                  )}
                  <button
                    type='submit'
                    disabled={
                      Object.keys(errors).length > 0 ||
                      !formData.fullName ||
                      !formData.phoneNumber ||
                      !formData.deliveryZone ||
                      !formData.address ||
                      cartItems.length === 0 ||
                      isLoading
                    }
                    className='bg-gradient-to-r from-blue-700 to-blue-900 text-white py-3 px-4 rounded-lg w-full text-sm font-semibold disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed hover:from-blue-800 hover:to-blue-950 transition-all'
                  >
                    {isLoading ? 'Confirming...' : 'Confirm Order'}
                  </button>
                </form>
              </div>
            </div>
            <div className='block md:hidden p-4'>
              <DeliveryAndReturnPolicy />
            </div>
          </div>
        </div>
      </CustomSection>
      <Footer />
      {/* Redesigned Thank You Popup */}
      {showPopup && orderDetails && (
        <div className='fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto transform transition-all duration-300 scale-100'>
            {/* Header Section */}
            <div className='text-center p-6 pb-4 bg-gradient-to-b from-blue-50 to-white rounded-t-2xl border-b border-blue-100'>
              <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg
                  className='w-8 h-8 text-blue-700'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              </div>
              <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                Order Confirmed! 🎉
              </h2>
              <p className='text-gray-600 text-sm mb-1'>
                Your order has been placed successfully.
              </p>
              <div className='bg-blue-100 px-3 py-1 rounded-full inline-flex items-center gap-2 text-xs font-medium text-blue-800'>
                <span>Order ID:</span>
                <span className='font-semibold'>
                  #{orderDetails.order.orderId}
                </span>
              </div>
              <p className='text-xs text-gray-500 mt-2'>
                Placed on{' '}
                {new Date(orderDetails.order.orderDate).toLocaleDateString(
                  'en-GB',
                  {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  }
                )}
              </p>
            </div>

            {/* Order Summary Section */}
            <div className='p-6 space-y-6'>
              {/* Items Summary */}
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2'>
                  <span className='w-2 h-2 bg-green-500 rounded-full'></span>
                  Order Items ({orderDetails.order.items.length})
                </h3>
                <div className='space-y-3 max-h-40 overflow-y-auto'>
                  {orderDetails.order.items.map((item, index) => (
                    <div
                      key={`${item.id}-${item.selectedColor}-${index}`}
                      className='flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200'
                    >
                      <div className='w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0' />{' '}
                      {/* Placeholder image */}
                      <div className='flex-1 min-w-0'>
                        <p className='font-medium text-gray-900 text-sm truncate'>
                          {item.title}
                        </p>
                        <p className='text-xs text-gray-500'>
                          {item.selectedColor ||
                            item.selectedVariantValue ||
                            'Standard'}
                        </p>
                        <p className='text-xs text-gray-500'>
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className='text-right flex-shrink-0'>
                        <p className='font-semibold text-gray-900 text-sm'>
                          ৳{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Summary */}
              <div className='bg-blue-50 p-4 rounded-xl space-y-3'>
                <div className='flex justify-between text-sm text-gray-700'>
                  <span>Subtotal</span>
                  <span>৳{orderDetails.order.totalPrice.toFixed(2)}</span>
                </div>
                <div className='flex justify-between text-sm text-gray-700'>
                  <span>Shipping</span>
                  <span>৳{orderDetails.order.shippingCharge.toFixed(2)}</span>
                </div>
                <div className='flex justify-between pt-2 border-t border-blue-200 font-semibold text-lg text-gray-900'>
                  <span>Total</span>
                  <span>৳{orderDetails.order.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Next Steps */}
              {/* <div className='space-y-3'>
                <h4 className='text-sm font-semibold text-gray-900'>
                  What happens next?
                </h4>
                <ul className='space-y-2 text-xs text-gray-600'>
                  <li className='flex items-center gap-2'>
                    <span className='w-1.5 h-1.5 bg-green-400 rounded-full'></span>
                    We'll send a confirmation SMS to{' '}
                    {formData.phoneNumber?.slice(-10)} shortly.
                  </li>
                  <li className='flex items-center gap-2'>
                    <span className='w-1.5 h-1.5 bg-blue-400 rounded-full'></span>
                    Your order will be processed within 24 hours.
                  </li>
                  <li className='flex items-center gap-2'>
                    <span className='w-1.5 h-1.5 bg-purple-400 rounded-full'></span>
                    Track your order anytime via WhatsApp or call us.
                  </li>
                </ul>
              </div> */}
            </div>

            {/* Footer Actions */}
            <div className='p-6 pt-0 border-t border-gray-100 bg-gray-50 rounded-b-2xl'>
              <button
                onClick={handleClosePopup}
                className='w-full bg-gradient-to-r from-blue-700 to-blue-900 text-white py-3 px-6 rounded-xl font-semibold text-sm hover:from-blue-800 hover:to-blue-950 transition-all shadow-md'
              >
                Continue Shopping
              </button>
              <p className='text-center text-xs text-gray-500 mt-3'>
                Need help? Contact us at{' '}
                <a
                  href='tel:+8801814575428'
                  className='text-blue-700 hover:underline'
                >
                  +8801814575428
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
