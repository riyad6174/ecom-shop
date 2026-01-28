import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { IoClose } from 'react-icons/io5';
import { HiOutlineTrash } from 'react-icons/hi';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import districtsData from '@/utils/districts.json';
import { clearCart, removeFromCart } from '@/store/cartSlice';

const OrderDialog = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const dialogRef = useRef(null);

  // Animation states
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // View state: 'cart' | 'confirmation'
  const [currentView, setCurrentView] = useState('cart');
  const [confirmationAnimating, setConfirmationAnimating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    district: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDistricts, setFilteredDistricts] = useState(
    districtsData.districts.slice(0, 5)
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);

  // Pricing state
  const [totalPrice, setTotalPrice] = useState(0);
  const [shippingCharge, setShippingCharge] = useState(60);
  const [grandTotal, setGrandTotal] = useState(0);

  // Handle open/close animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Small delay to trigger animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden';
    } else {
      setIsAnimating(false);
      setConfirmationAnimating(false);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setCurrentView('cart');
      }, 400); // Match transition duration
      document.body.style.overflow = '';
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Calculate totals based on cart items
  useEffect(() => {
    const total = cartItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );
    setTotalPrice(total);
    setGrandTotal(total + shippingCharge);
  }, [cartItems, shippingCharge]);

  // Update filtered districts on mount
  useEffect(() => {
    setFilteredDistricts(districtsData.districts.slice(0, 5));
  }, []);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

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

  // Handle district selection
  const handleDistrictSelect = (district) => {
    setFormData({ ...formData, district });
    setSearchTerm(district);
    setIsDropdownOpen(false);
    validateField('district', district);
    const newShippingCharge = district === 'Dhaka' ? 60 : 120;
    setShippingCharge(newShippingCharge);
    setGrandTotal(totalPrice + newShippingCharge);
  };

  // Handle district search
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setFormData({ ...formData, district: value });
    setIsDropdownOpen(true);
    const filtered = districtsData.districts.filter((district) =>
      district.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredDistricts(filtered.slice(0, 5));
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
          newErrors.phoneNumber = 'Please enter a valid Bangladesh phone number';
        } else {
          delete newErrors.phoneNumber;
        }
        break;
      case 'district':
        if (!value.trim()) {
          newErrors.district = 'District is required';
        } else if (!districtsData.districts.some((d) => d.name === value)) {
          newErrors.district = 'Please select a valid district';
        } else {
          delete newErrors.district;
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
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
    else if (!/^\+880\d{10}$/.test(formData.phoneNumber))
      newErrors.phoneNumber = 'Please enter a valid Bangladesh phone number';
    if (!formData.district.trim()) newErrors.district = 'District is required';
    else if (!districtsData.districts.some((d) => d.name === formData.district))
      newErrors.district = 'Please select a valid district';
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

    const phoneLastFive = formData.phoneNumber
      ? formData.phoneNumber.slice(-5)
      : 'UNKNOWN';
    const order = {
      user: { ...formData },
      order: {
        items: [...cartItems],
        totalPrice,
        shippingCharge,
        grandTotal,
        orderDate: new Date().toISOString(),
        orderId: `ORD-${phoneLastFive}`,
      },
    };

    const sheetData = {
      name: formData.fullName || '',
      phone: formData.phoneNumber || '',
      district: formData.district || '',
      address: formData.address || '',
      items: JSON.stringify(
        cartItems.map((item) => ({
          title: item.title || 'Unknown',
          price: item.price || 0,
          quantity: item.quantity || 1,
          selectedColor: item.selectedColor || item.selectedVariantValue,
        }))
      ),
      totalPrice: totalPrice || 0,
      shippingCharge: shippingCharge || 0,
      grandTotal: grandTotal || 0,
      orderId: `ORD-${phoneLastFive}` || 'ORD-UNKNOWN',
      orderDate: new Date().toISOString(),
      submissionTime: new Date().toISOString(),
      sheetName: 'Orders',
    };

    if (
      !sheetData.name ||
      !sheetData.phone ||
      !sheetData.district ||
      !sheetData.address
    ) {
      setSubmissionError('Please fill all required fields.');
      setIsLoading(false);
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
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
        setOrderDetails(order);
        setCurrentView('confirmation');
        // Trigger confirmation fade-in animation
        setTimeout(() => setConfirmationAnimating(true), 50);

        // Push purchase event to data layer
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
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

        // Fire Meta Pixel Purchase event directly
        if (typeof window.fbq === 'function') {
          window.fbq('track', 'Purchase', {
            content_ids: order.order.items.map((item) => item.id || 'unknown'),
            content_type: 'product',
            contents: order.order.items.map((item) => ({
              id: item.id || 'unknown',
              quantity: item.quantity || 1,
            })),
            currency: 'BDT',
            value: order.order.grandTotal || 0,
          });
        }
      }
    } catch (error) {
      console.error('Fetch error:', error.name, error.message);
      setSubmissionError('Error submitting order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle close
  const handleClose = () => {
    if (currentView === 'confirmation') {
      dispatch(clearCart());
      setFormData({
        fullName: '',
        phoneNumber: '',
        district: '',
        address: '',
      });
      setSearchTerm('');
      setOrderDetails(null);
    }
    onClose();
  };

  // Handle continue shopping after confirmation
  const handleContinueShopping = () => {
    dispatch(clearCart());
    setFormData({
      fullName: '',
      phoneNumber: '',
      district: '',
      address: '',
    });
    setSearchTerm('');
    setOrderDetails(null);
    onClose();
  };

  // Handle remove item from cart
  const handleRemoveItem = (item) => {
    dispatch(removeFromCart({ id: item.id, selectedColor: item.selectedColor }));
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-400 ease-out ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ transitionDuration: '400ms' }}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-400 ${
          isAnimating ? 'opacity-60' : 'opacity-0'
        }`}
        style={{ transitionDuration: '400ms' }}
      />

      {/* Dialog Container */}
      <div className='absolute inset-0 flex md:justify-end'>
        {/* Mobile: Bottom Sheet | Desktop: Right Side Panel */}
        <div
          ref={dialogRef}
          className={`
            bg-white w-full md:w-[800px] lg:w-[900px]
            absolute md:relative
            bottom-0 md:bottom-auto md:top-0 md:right-0
            h-[95vh] md:h-full
            rounded-t-xl md:rounded-none
            shadow-2xl
            flex flex-col
            transform transition-all ease-[cubic-bezier(0.32,0.72,0,1)]
            ${isAnimating
              ? 'translate-y-0 md:translate-y-0 md:translate-x-0'
              : 'translate-y-full md:translate-y-0 md:translate-x-full'
            }
          `}
          style={{ transitionDuration: '400ms' }}
        >
          {/* Header */}
          <div className='flex-shrink-0 flex items-center justify-between p-4 md:p-6 border-b border-gray-200 bg-white rounded-t-xl md:rounded-none'>
            <h2 className='text-lg md:text-xl font-semibold text-gray-900'>
              {currentView === 'cart' ? 'Complete Your Order' : 'Order Confirmed!'}
            </h2>
            <button
              onClick={handleClose}
              className='p-2 hover:bg-gray-100 rounded-full transition-colors'
              aria-label='Close dialog'
            >
              <IoClose className='w-6 h-6 text-gray-500' />
            </button>
          </div>

          {/* Content */}
          <div className='flex-1 overflow-y-auto min-h-0'>
            {currentView === 'cart' ? (
              <div className='flex flex-col md:flex-row md:h-full'>
                {/* Cart Items Section */}
                <div className='md:w-1/2 p-4 md:p-6 md:border-r border-gray-200 bg-gray-50 md:overflow-y-auto'>
                  <h3 className='text-md font-semibold text-gray-800 mb-4'>
                    Your Cart ({cartItems.length} items)
                  </h3>

                  {cartItems.length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-8'>
                      <div className='w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4'>
                        <svg className='w-8 h-8 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' />
                        </svg>
                      </div>
                      <p className='text-gray-500 text-sm'>Your cart is empty</p>
                    </div>
                  ) : (
                    <div className='space-y-3'>
                      {cartItems.map((item, index) => (
                        <div
                          key={`${item.id}-${item.selectedColor || item.selectedVariantValue}-${index}`}
                          className='flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 shadow-sm'
                        >
                          <div className='w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden'>
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.title}
                                className='w-full h-full object-cover'
                              />
                            ) : (
                              <div className='w-full h-full bg-gray-200' />
                            )}
                          </div>
                          <div className='flex-1 min-w-0'>
                            <p className='font-medium text-gray-900 text-sm truncate'>
                              {item.title}
                            </p>
                            <p className='text-xs text-gray-500'>
                              {item.selectedColor || item.selectedVariantValue || 'Standard'}
                            </p>
                            <div className='flex items-center justify-between mt-1'>
                              <p className='text-xs text-gray-500'>Qty: {item.quantity}</p>
                              <p className='font-semibold text-gray-900 text-sm'>
                                ৳{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item)}
                            className='p-2 hover:bg-red-50 rounded-full transition-colors flex-shrink-0'
                            aria-label='Remove item'
                          >
                            <HiOutlineTrash className='w-5 h-5 text-red-500' />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pricing Summary - Mobile Only */}
                  <div className='mt-4 p-4 bg-blue-50 rounded-xl md:hidden'>
                    <div className='flex justify-between text-sm text-gray-700 mb-2'>
                      <span>Subtotal</span>
                      <span>৳{totalPrice.toFixed(2)}</span>
                    </div>
                    <div className='flex justify-between text-sm text-gray-700 mb-2'>
                      <span>Shipping</span>
                      <span>৳{shippingCharge.toFixed(2)}</span>
                    </div>
                    <div className='flex justify-between font-semibold text-gray-900 pt-2 border-t border-blue-200'>
                      <span>Total</span>
                      <span>৳{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Order Form Section */}
                <div className='md:w-1/2 p-4 pb-8 md:p-6 md:overflow-y-auto'>
                  <h3 className='text-md font-semibold text-gray-800 mb-4'>
                    Delivery Information
                  </h3>

                  <form onSubmit={handleSubmit} className='space-y-4'>
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
                        className='py-2.5 px-3 border w-full rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all'
                      />
                      {errors.fullName && (
                        <p className='text-red-500 text-xs mt-1'>{errors.fullName}</p>
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
                        className='py-2.5 px-3 border w-full rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      />
                      {errors.phoneNumber && (
                        <p className='text-red-500 text-xs mt-1'>{errors.phoneNumber}</p>
                      )}
                    </div>

                    {/* District */}
                    <div className='relative'>
                      <label
                        htmlFor='district'
                        className='block text-sm font-medium text-gray-700 mb-1'
                      >
                        District
                      </label>
                      <input
                        type='text'
                        id='district'
                        name='district'
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onFocus={() => setIsDropdownOpen(true)}
                        placeholder='Select District'
                        className='py-2.5 px-3 border w-full rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      />
                      {isDropdownOpen && (
                        <ul className='absolute z-20 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg'>
                          {filteredDistricts.length > 0 ? (
                            filteredDistricts.map((district) => (
                              <li
                                key={district.id}
                                onClick={() => handleDistrictSelect(district.name)}
                                className='px-3 py-2 text-sm hover:bg-blue-100 cursor-pointer transition-colors'
                              >
                                {district.name}
                              </li>
                            ))
                          ) : (
                            <li className='px-3 py-2 text-sm text-gray-500'>
                              No districts found
                            </li>
                          )}
                        </ul>
                      )}
                      {errors.district && (
                        <p className='text-red-500 text-xs mt-1'>{errors.district}</p>
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
                        placeholder='Thana, Road No, House No'
                        className='py-2.5 px-3 border w-full rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      />
                      {errors.address && (
                        <p className='text-red-500 text-xs mt-1'>{errors.address}</p>
                      )}
                    </div>

                    {/* Pricing Summary - Desktop Only */}
                    <div className='hidden md:block p-4 bg-blue-50 rounded-xl'>
                      <div className='flex justify-between text-sm text-gray-700 mb-2'>
                        <span>Subtotal</span>
                        <span>৳{totalPrice.toFixed(2)}</span>
                      </div>
                      <div className='flex justify-between text-sm text-gray-700 mb-2'>
                        <span>Shipping</span>
                        <span>৳{shippingCharge.toFixed(2)}</span>
                      </div>
                      <div className='flex justify-between font-semibold text-gray-900 pt-2 border-t border-blue-200'>
                        <span>Total</span>
                        <span>৳{grandTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Submission Error */}
                    {submissionError && (
                      <p className='text-red-500 text-sm'>{submissionError}</p>
                    )}

                    {/* Submit Button */}
                    <button
                      type='submit'
                      disabled={
                        Object.keys(errors).length > 0 ||
                        !formData.fullName ||
                        !formData.phoneNumber ||
                        !formData.district ||
                        !formData.address ||
                        cartItems.length === 0 ||
                        isLoading
                      }
                      className='bg-orange-600 text-white py-3 px-4 rounded-lg w-full text-sm font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-orange-700 transition-colors shadow-md'
                    >
                      {isLoading ? (
                        <span className='flex items-center justify-center gap-2'>
                          <svg className='animate-spin h-4 w-4 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                            <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                          </svg>
                          Confirming...
                        </span>
                      ) : (
                        'Confirm Order'
                      )}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              /* Confirmation View */
              <div
                className={`p-4 md:p-6 transition-all duration-500 ease-out ${
                  confirmationAnimating
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4'
                }`}
              >
                {/* Success Header */}
                <div className='text-center py-6 bg-gradient-to-b from-green-50 to-white rounded-xl mb-6'>
                  <div
                    className={`w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-500 ease-out ${
                      confirmationAnimating ? 'scale-100' : 'scale-75'
                    }`}
                    style={{ transitionDelay: '100ms' }}
                  >
                    <svg
                      className={`w-10 h-10 text-green-600 transition-all duration-300 ${
                        confirmationAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                      }`}
                      style={{ transitionDelay: '200ms' }}
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
                  <h3
                    className={`text-2xl font-bold text-gray-900 mb-2 transition-all duration-400 ${
                      confirmationAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                    }`}
                    style={{ transitionDelay: '150ms' }}
                  >
                    Thank You!
                  </h3>
                  <p
                    className={`text-gray-600 text-sm mb-3 transition-all duration-400 ${
                      confirmationAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                    }`}
                    style={{ transitionDelay: '200ms' }}
                  >
                    Your order has been placed successfully.
                  </p>
                  <div
                    className={`bg-green-100 px-4 py-2 rounded-full inline-flex items-center gap-2 text-sm font-medium text-green-800 transition-all duration-400 ${
                      confirmationAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                    }`}
                    style={{ transitionDelay: '250ms' }}
                  >
                    <span>Order ID:</span>
                    <span className='font-bold'>#{orderDetails?.order?.orderId}</span>
                  </div>
                  <p
                    className={`text-xs text-gray-500 mt-3 transition-all duration-300 ${
                      confirmationAnimating ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ transitionDelay: '300ms' }}
                  >
                    Placed on{' '}
                    {orderDetails?.order?.orderDate &&
                      new Date(orderDetails.order.orderDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                  </p>
                </div>

                {/* Order Items */}
                <div
                  className={`mb-6 transition-all duration-400 ${
                    confirmationAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: '350ms' }}
                >
                  <h4 className='text-md font-semibold text-gray-900 mb-3 flex items-center gap-2'>
                    <span className='w-2 h-2 bg-green-500 rounded-full'></span>
                    Order Items ({orderDetails?.order?.items?.length || 0})
                  </h4>
                  <div className='space-y-3 max-h-48 overflow-y-auto'>
                    {orderDetails?.order?.items?.map((item, index) => (
                      <div
                        key={`${item.id}-${item.selectedColor}-${index}`}
                        className='flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200'
                      >
                        <div className='w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden'>
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            <div className='w-full h-full bg-gray-300' />
                          )}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='font-medium text-gray-900 text-sm truncate'>
                            {item.title}
                          </p>
                          <p className='text-xs text-gray-500'>
                            {item.selectedColor || item.selectedVariantValue || 'Standard'} | Qty: {item.quantity}
                          </p>
                        </div>
                        <div className='text-right flex-shrink-0'>
                          <p className='font-semibold text-gray-900 text-sm'>
                            ৳{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Info */}
                <div
                  className={`mb-6 p-4 bg-gray-50 rounded-xl transition-all duration-400 ${
                    confirmationAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: '400ms' }}
                >
                  <h4 className='text-md font-semibold text-gray-900 mb-3'>
                    Delivery Information
                  </h4>
                  <div className='space-y-2 text-sm'>
                    <p className='text-gray-700'>
                      <span className='text-gray-500'>Name:</span> {orderDetails?.user?.fullName}
                    </p>
                    <p className='text-gray-700'>
                      <span className='text-gray-500'>Phone:</span> {orderDetails?.user?.phoneNumber}
                    </p>
                    <p className='text-gray-700'>
                      <span className='text-gray-500'>District:</span> {orderDetails?.user?.district}
                    </p>
                    <p className='text-gray-700'>
                      <span className='text-gray-500'>Address:</span> {orderDetails?.user?.address}
                    </p>
                  </div>
                </div>

                {/* Payment Summary */}
                <div
                  className={`mb-6 p-4 bg-blue-50 rounded-xl transition-all duration-400 ${
                    confirmationAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: '450ms' }}
                >
                  <div className='flex justify-between text-sm text-gray-700 mb-2'>
                    <span>Subtotal</span>
                    <span>৳{orderDetails?.order?.totalPrice?.toFixed(2)}</span>
                  </div>
                  <div className='flex justify-between text-sm text-gray-700 mb-2'>
                    <span>Shipping</span>
                    <span>৳{orderDetails?.order?.shippingCharge?.toFixed(2)}</span>
                  </div>
                  <div className='flex justify-between font-bold text-lg text-gray-900 pt-2 border-t border-blue-200'>
                    <span>Total</span>
                    <span>৳{orderDetails?.order?.grandTotal?.toFixed(2)}</span>
                  </div>
                </div>

                {/* Continue Shopping Button */}
                <button
                  onClick={handleContinueShopping}
                  className={`w-full bg-orange-600 text-white py-3 px-6 rounded-xl font-semibold text-sm hover:bg-orange-700 transition-all shadow-md ${
                    confirmationAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: '500ms', transitionDuration: '400ms' }}
                >
                  Continue Shopping
                </button>
                <p className='text-center text-xs text-gray-500 mt-4'>
                  Need help? Contact us at{' '}
                  <a href='tel:+8801814575428' className='text-orange-600 hover:underline'>
                    +8801814575428
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDialog;
