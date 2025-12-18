import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Navbar from '@/components/common/Navbar';
import CustomSection from '@/components/layout/CustomSection';
import { IoMdArrowBack } from 'react-icons/io';
import { BsWhatsapp, BsTelephone } from 'react-icons/bs';
import { HiOutlineLocationMarker } from 'react-icons/hi';
import CartCard from '@/components/checkout/CartCard';
import HeaderSm from '@/components/common/HeaderSm';
import Footer from '@/components/common/Footer';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import districtsData from '@/utils/districts.json';
import DeliveryAndReturnPolicy from '@/components/CartPolicy';
import Link from 'next/link';
import { clearCart } from '@/store/cartSlice';
import { useRouter } from 'next/router';

function Cart() {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const router = useRouter();
  const districtRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    district: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [activeTab, setActiveTab] = useState('form'); // 'form', 'whatsapp', 'call'
  const [whatsappMessage, setWhatsappMessage] = useState('');

  // Pricing state
  const [totalPrice, setTotalPrice] = useState(0);
  const [shippingCharge, setShippingCharge] = useState(60);
  const [grandTotal, setGrandTotal] = useState(0);

  // Bangla error messages
  const errorMessages = {
    fullName: {
      required: 'নাম আবশ্যক',
      minLength: 'নাম কমপক্ষে ২ অক্ষরের হতে হবে',
    },
    phoneNumber: {
      required: 'ফোন নম্বর আবশ্যক',
      invalid: 'সঠিক বাংলাদেশী ফোন নম্বর দিন',
    },
    district: {
      required: 'জেলা নির্বাচন করুন',
      invalid: 'সঠিক জেলা নির্বাচন করুন',
    },
    address: {
      required: 'বিস্তারিত ঠিকানা দিন',
      minLength: 'ঠিকানা কমপক্ষে ৫ অক্ষরের হতে হবে',
    },
  };

  // Calculate totals based on cart items
  useEffect(() => {
    const total = cartItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );
    setTotalPrice(total);
    setGrandTotal(total + shippingCharge);

    // Generate WhatsApp message
    const itemsText = cartItems
      .map(
        (item) =>
          `${item.title} (${
            item.selectedColor || item.selectedVariantValue
          }) - ${item.quantity} পিস`
      )
      .join('\n');

    const message = `আসসালামু আলাইকুম,
    
আমি প্রোডাক্টি অর্ডার দিতে চাই:
${itemsText}

প্রোডাক্টির দাম: ৳${total}

`;

    setWhatsappMessage(encodeURIComponent(message));
  }, [cartItems, shippingCharge]);

  // Initialize districts on mount
  useEffect(() => {
    const popularDistricts = [
      'ঢাকা',
      'চট্টগ্রাম',
      'খুলনা',
      'রাজশাহী',
      'সিলেট',
      'বরিশাল',
      'রংপুর',
      'ময়মনসিংহ',
    ];
    setFilteredDistricts(
      districtsData.districts
        .filter((d) => popularDistricts.includes(d.name))
        .slice(0, 8)
    );
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (districtRef.current && !districtRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    const newShippingCharge = district === 'ঢাকা' ? 60 : 120;
    setShippingCharge(newShippingCharge);
    setGrandTotal(totalPrice + newShippingCharge);
  };

  // Handle district search
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setFormData({ ...formData, district: value });
    setIsDropdownOpen(true);

    if (value.trim() === '') {
      const popularDistricts = [
        'ঢাকা',
        'চট্টগ্রাম',
        'খুলনা',
        'রাজশাহী',
        'সিলেট',
        'বরিশাল',
        'রংপুর',
        'ময়মনসিংহ',
      ];
      setFilteredDistricts(
        districtsData.districts
          .filter((d) => popularDistricts.includes(d.name))
          .slice(0, 8)
      );
    } else {
      const filtered = districtsData.districts.filter((district) =>
        district.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredDistricts(filtered.slice(0, 8));
    }
  };

  // Highlight search term in district name
  const highlightText = (text, highlight) => {
    if (!highlight.trim()) return text;

    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className='bg-yellow-200 px-1 rounded'>
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Validate individual field
  const validateField = (name, value) => {
    let newErrors = { ...errors };
    switch (name) {
      case 'fullName':
        if (!value.trim()) {
          newErrors.fullName = errorMessages.fullName.required;
        } else if (value.length < 2) {
          newErrors.fullName = errorMessages.fullName.minLength;
        } else {
          delete newErrors.fullName;
        }
        break;
      case 'phoneNumber':
        if (!value) {
          newErrors.phoneNumber = errorMessages.phoneNumber.required;
        } else if (!/^\+880\d{10}$/.test(value)) {
          newErrors.phoneNumber = errorMessages.phoneNumber.invalid;
        } else {
          delete newErrors.phoneNumber;
        }
        break;
      case 'district':
        if (!value.trim()) {
          newErrors.district = errorMessages.district.required;
        } else if (!districtsData.districts.some((d) => d.name === value)) {
          newErrors.district = errorMessages.district.invalid;
        } else {
          delete newErrors.district;
        }
        break;
      case 'address':
        if (!value.trim()) {
          newErrors.address = errorMessages.address.required;
        } else if (value.length < 5) {
          newErrors.address = errorMessages.address.minLength;
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
    if (!formData.fullName.trim())
      newErrors.fullName = errorMessages.fullName.required;
    else if (formData.fullName.length < 2)
      newErrors.fullName = errorMessages.fullName.minLength;

    if (!formData.phoneNumber)
      newErrors.phoneNumber = errorMessages.phoneNumber.required;
    else if (!/^\+880\d{10}$/.test(formData.phoneNumber))
      newErrors.phoneNumber = errorMessages.phoneNumber.invalid;

    if (!formData.district.trim())
      newErrors.district = errorMessages.district.required;
    else if (!districtsData.districts.some((d) => d.name === formData.district))
      newErrors.district = errorMessages.district.invalid;

    if (!formData.address.trim())
      newErrors.address = errorMessages.address.required;
    else if (formData.address.length < 5)
      newErrors.address = errorMessages.address.minLength;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setSubmissionError(null);

    // ... rest of your handleSubmit function remains the same ...
    // (Keep all your existing form submission logic)
  };

  // Handle popup close
  const handleClosePopup = () => {
    setShowPopup(false);
    setOrderDetails(null);
    dispatch(clearCart());
    router.push('/');
  };

  // Handle direct WhatsApp order
  const handleWhatsAppOrder = () => {
    const phone = '+8801814575428'; // Your WhatsApp number
    window.open(`https://wa.me/${phone}?text=${whatsappMessage}`, '_blank');
  };

  // Handle direct call
  const handleCallOrder = () => {
    window.open('tel:+8801590096368');
  };

  // Check if form is valid for manual order
  const isFormValid =
    Object.keys(errors).length === 0 &&
    formData.fullName &&
    formData.phoneNumber &&
    formData.district &&
    formData.address;

  return (
    <div>
      <div className='hidden md:block'>
        <Navbar />
      </div>
      <HeaderSm>
        <Link href='/'>
          <IoMdArrowBack className='text-2xl' />
        </Link>
        <span className='text-xl font-semibold'>অর্ডার করুন</span>
        <div></div>
      </HeaderSm>
      <CustomSection>
        <div className='mx-auto pt-16 md:pt-0'>
          <div className='flex flex-col md:flex-row gap-5'>
            {/* Cart Items */}
            <div className='md:w-4/5'>
              <div className='md:bg-white py-4 px-6 md:p-6 md:mb-4 md:rounded-lg md:shadow'>
                <h2 className='text-lg font-semibold mb-4'>আপনার কার্ট</h2>
                {cartItems.length === 0 ? (
                  <div className='flex flex-col gap-4 items-center justify-center h-24'>
                    <p className='text-gray-500'>আপনার কার্ট খালি</p>
                    <Link
                      href='/'
                      className='text-white mt-2 bg-blue-700 rounded-lg px-4 py-2 text-sm font-semibold'
                    >
                      শপিং চালিয়ে যান
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
                <div className='pb-4 border-b'>
                  <h2 className='text-lg font-semibold'>অর্ডার সম্পন্ন করুন</h2>
                  <p className='text-sm text-gray-600 mt-1'>
                    আপনার পছন্দের পদ্ধতিতে অর্ডার দিন
                  </p>
                </div>

                {/* Direct Order Buttons */}
                <div className='my-4 space-y-3'>
                  <div className='flex gap-3'>
                    <button
                      onClick={() => setActiveTab('whatsapp')}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border text-sm font-semibold transition-colors ${
                        activeTab === 'whatsapp'
                          ? 'bg-green-50 border-green-500 text-green-700'
                          : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <BsWhatsapp className='text-lg' />
                      WhatsApp এ অর্ডার
                    </button>

                    <button
                      onClick={() => setActiveTab('call')}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border text-sm font-semibold transition-colors ${
                        activeTab === 'call'
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <BsTelephone className='text-lg' />
                      ফোনে অর্ডার
                    </button>
                  </div>

                  <button
                    onClick={() => setActiveTab('form')}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg border text-sm font-semibold transition-colors ${
                      activeTab === 'form'
                        ? 'bg-orange-50 border-orange-500 text-orange-700'
                        : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <HiOutlineLocationMarker className='text-lg' />
                    ফর্ম পূরণ করে অর্ডার
                  </button>
                </div>

                {/* Order Method Instructions */}
                {activeTab === 'whatsapp' && (
                  <div className='mb-6 p-4 bg-green-50 border border-green-200 rounded-lg'>
                    <p className='text-sm text-green-800 mb-2'>
                      WhatsApp এ মেসেজ করে অর্ডার দিন। আপনার কার্টের আইটেমগুলো
                      অটোমেটিক WhatsApp মেসেজে যুক্ত হবে।
                    </p>
                    <button
                      onClick={handleWhatsAppOrder}
                      disabled={cartItems.length === 0}
                      className='w-full bg-green-600 text-white py-3 px-4 rounded-lg text-sm font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-green-700 transition-colors'
                    >
                      WhatsApp এ মেসেজ করুন
                    </button>
                  </div>
                )}

                {activeTab === 'call' && (
                  <div className='mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                    <p className='text-sm text-blue-800 mb-2'>
                      সরাসরি ফোন করে অর্ডার দিন। আমাদের প্রতিনিধি আপনার অর্ডার
                      নিবেন।
                    </p>
                    <button
                      onClick={handleCallOrder}
                      className='w-full bg-blue-600 text-white py-3 px-4 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors'
                    >
                      +8801590096368 এ কল করুন
                    </button>
                  </div>
                )}

                {/* Form Section */}
                {activeTab === 'form' && (
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
                          পুরো নাম *
                        </label>
                        <input
                          type='text'
                          id='fullName'
                          name='fullName'
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder='আপনার পুরো নাম লিখুন'
                          className='py-2 px-3 border w-full rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        />
                        {errors.fullName && (
                          <p className='text-red-500 text-xs mt-1 flex items-center gap-1'>
                            <span className='text-red-500'>⚠</span>
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
                          ফোন নম্বর *
                        </label>
                        <div className='relative'>
                          <PhoneInput
                            id='phoneNumber'
                            defaultCountry='BD'
                            value={formData.phoneNumber}
                            onChange={handlePhoneChange}
                            placeholder='+৮৮০১৭১২৩৪৫৬৭৮'
                            className='py-2 px-3 border w-full rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                          />
                          <div className='absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded'>
                            বাংলাদেশ
                          </div>
                        </div>
                        {errors.phoneNumber && (
                          <p className='text-red-500 text-xs mt-1 flex items-center gap-1'>
                            <span className='text-red-500'>⚠</span>
                            {errors.phoneNumber}
                          </p>
                        )}
                      </div>

                      {/* District */}
                      <div className='relative' ref={districtRef}>
                        <label
                          htmlFor='district'
                          className='block text-sm font-medium text-gray-700 mb-1'
                        >
                          জেলা *
                        </label>
                        <div className='relative'>
                          <input
                            type='text'
                            id='district'
                            name='district'
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onFocus={() => setIsDropdownOpen(true)}
                            placeholder='আপনার জেলা সার্চ করুন বা নির্বাচন করুন'
                            className='py-2 px-3 border w-full rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10'
                          />
                          <div className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400'>
                            {isDropdownOpen ? '▲' : '▼'}
                          </div>
                        </div>

                        {isDropdownOpen && (
                          <div className='absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto'>
                            <div className='p-2 border-b'>
                              <p className='text-xs text-gray-500'>
                                {searchTerm
                                  ? 'সার্চ ফলাফল'
                                  : 'জনপ্রিয় জেলাগুলো'}
                              </p>
                            </div>
                            <ul>
                              {filteredDistricts.length > 0 ? (
                                filteredDistricts.map((district) => (
                                  <li
                                    key={district.id}
                                    onClick={() =>
                                      handleDistrictSelect(district.name)
                                    }
                                    className='px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0'
                                  >
                                    <div className='flex items-center gap-2'>
                                      <span className='text-blue-600'>📍</span>
                                      <span>
                                        {highlightText(
                                          district.name,
                                          searchTerm
                                        )}
                                      </span>
                                    </div>
                                  </li>
                                ))
                              ) : (
                                <li className='px-3 py-2 text-sm text-gray-500 text-center'>
                                  কোন জেলা পাওয়া যায়নি
                                </li>
                              )}
                            </ul>
                            {filteredDistricts.length > 0 && (
                              <div className='p-2 border-t bg-gray-50'>
                                <p className='text-xs text-gray-500 text-center'>
                                  মোট {districtsData.districts.length} টি জেলা
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                        {errors.district && (
                          <p className='text-red-500 text-xs mt-1 flex items-center gap-1'>
                            <span className='text-red-500'>⚠</span>
                            {errors.district}
                          </p>
                        )}
                      </div>

                      {/* Address */}
                      <div>
                        <label
                          htmlFor='address'
                          className='block text-sm font-medium text-gray-700 mb-1'
                        >
                          বিস্তারিত ঠিকানা *
                        </label>
                        <input
                          type='text'
                          id='address'
                          name='address'
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder='থানা, রাস্তা নম্বর, বাড়ি নম্বর, এলাকা'
                          className='py-2 px-3 border w-full rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        />
                        {errors.address && (
                          <p className='text-red-500 text-xs mt-1 flex items-center gap-1'>
                            <span className='text-red-500'>⚠</span>
                            {errors.address}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Pricing Summary */}
                    <div className='py-4 font-thin text-[16px] bg-blue-50 rounded-lg p-4 text-blue-800 my-5'>
                      <div className='flex text-sm md:text-md justify-between mb-2'>
                        <span>মোট মূল্য</span>
                        <span>৳{totalPrice.toFixed(2)}</span>
                      </div>
                      <div className='flex text-sm md:text-md justify-between mb-2'>
                        <span>ডেলিভারি চার্জ</span>
                        <span>৳{shippingCharge.toFixed(2)}</span>
                      </div>
                      <hr className='my-2' />
                      <div className='flex justify-between my-4'>
                        <span className='font-semibold text-sm md:text-lg'>
                          সর্বমোট
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
                        !isFormValid || cartItems.length === 0 || isLoading
                      }
                      className='bg-orange-600 text-white py-3 px-4 rounded-lg w-full text-sm font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-orange-700 transition-colors'
                    >
                      {isLoading
                        ? 'অর্ডার নিশ্চিত করা হচ্ছে...'
                        : 'অর্ডার নিশ্চিত করুন'}
                    </button>

                    <p className='text-xs text-gray-500 mt-3 text-center'>
                      অর্ডার দিতে সমস্যা হলে কল করুন:
                      <a
                        href='tel:+8801814575428'
                        className='text-orange-600 font-semibold ml-1'
                      >
                        +৮৮০১৮১৪৫৭৫৪২৮
                      </a>
                    </p>
                  </form>
                )}
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
            <div className='text-center p-6 pb-4 bg-gradient-to-b from-orange-50 to-white rounded-t-2xl border-b border-orange-100'>
              <div className='w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg
                  className='w-8 h-8 text-orange-600'
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
              <div className='bg-orange-100 px-3 py-1 rounded-full inline-flex items-center gap-2 text-xs font-medium text-orange-800'>
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
                className='w-full bg-orange-600 text-white py-3 px-6 rounded-xl font-semibold text-sm hover:bg-orange-700 transition-colors shadow-md'
              >
                Continue Shopping
              </button>
              <p className='text-center text-xs text-gray-500 mt-3'>
                Need help? Contact us at{' '}
                <a
                  href='tel:+8801814575428'
                  className='text-orange-600 hover:underline'
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
