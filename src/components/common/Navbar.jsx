import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { FaBars, FaTimes, FaHome } from 'react-icons/fa';
import { FiShoppingCart } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import OrderDialog from '@/components/checkout/OrderDialog';

function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const cartItems = useSelector((state) => state.cart.items);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'About Us', href: '/about-us' },
    { name: 'Contact Us', href: '/contact-us' },
  ];

  return (
    <>
      {/* Desktop Navbar */}
      <nav className='hidden md:block shadow-lg relative'>
        {/* Gradient background with glass effect */}
        <div className='bg-gradient-to-r from-blue-800 via-blue-600 to-blue-800'>
          <div className='backdrop-blur-sm bg-white/10'>
            {/* Logo Section */}
            <div className='py-6 flex items-center justify-center border-b border-white/15'>
              <Link href='/'>
                <img
                  className='h-20 drop-shadow-lg'
                  src='/assets/logo.png'
                  alt='Logo'
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Links Section */}
        <div className='bg-white/90 backdrop-blur-md py-3 flex justify-center space-x-12 border-b border-gray-100'>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs font-bold uppercase tracking-widest transition-all ${
                router.pathname === link.href
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-blue-500'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className='block md:hidden shadow-md relative'>
        {/* Top bar */}
        <div className='bg-gradient-to-r from-blue-800 via-blue-600 to-blue-800'>
          <div className='backdrop-blur-sm bg-white/10 px-6 h-16 flex items-center justify-between'>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className='text-2xl text-white'
              aria-label='Toggle menu'
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>

            <Link href='/'>
              <img
                className='h-12 drop-shadow-md'
                src='/assets/logo.png'
                alt='Logo'
              />
            </Link>

            <button
              onClick={() => setIsOrderDialogOpen(true)}
              className='relative p-2 text-white'
              aria-label='Open cart'
            >
              <FiShoppingCart className='text-2xl' />
              {totalItems > 0 && (
                <span className='absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white'>
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`${
            isMenuOpen ? 'max-h-80 opacity-100 py-4' : 'max-h-0 opacity-0'
          } overflow-hidden transition-all duration-300 bg-sky-50 border-t border-sky-100`}
        >
          <div className='flex flex-col'>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className='px-8 py-3 text-sky-900 font-bold border-b border-sky-100/50 flex items-center gap-3 hover:bg-white'
              >
                {link.name === 'Home' && <FaHome className='text-blue-500' />}
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <OrderDialog
        isOpen={isOrderDialogOpen}
        onClose={() => setIsOrderDialogOpen(false)}
      />
    </>
  );
}

export default Navbar;
