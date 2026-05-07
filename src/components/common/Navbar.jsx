import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { FaBars, FaTimes, FaHome } from 'react-icons/fa';
import { FiShoppingCart } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const OrderDialog = dynamic(() => import('@/components/checkout/OrderDialog'), {
  ssr: false,
});

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
      <nav className='hidden md:block shadow-2xl relative'>
        <div className='bg-gradient-to-r from-gray-950 via-slate-900 to-gray-950'>
          <div className='backdrop-blur-sm bg-black/20 px-8 h-16 grid grid-cols-3 items-center border-b border-white/10'>
            {/* Logo - Left */}
            <div className='flex items-center'>
              <Link href='/'>
                <img
                  className='h-10 drop-shadow-lg'
                  src='/assets/logo.png'
                  alt='Logo'
                />
              </Link>
            </div>

            {/* Links - Center */}
            <div className='flex justify-center items-center space-x-10'>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs font-bold uppercase tracking-widest transition-all ${
                    router.pathname === link.href
                      ? 'text-amber-400 border-b-2 border-amber-400 pb-0.5'
                      : 'text-slate-400 hover:text-amber-300'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Cart - Right */}
            <div className='flex justify-end'>
              <button
                onClick={() => setIsOrderDialogOpen(true)}
                className='relative p-2 text-white hover:text-amber-400 transition-colors'
                aria-label='Open cart'
              >
                <FiShoppingCart className='text-xl' />
                {totalItems > 0 && (
                  <span className='absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center'>
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className='block md:hidden shadow-2xl relative'>
        {/* Top bar */}
        <div className='bg-gradient-to-r from-gray-950 via-slate-900 to-gray-950'>
          <div className='backdrop-blur-sm bg-black/20 px-6 h-16 flex items-center justify-between'>
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
          } overflow-hidden transition-all duration-300 bg-slate-900 border-t border-white/10`}
        >
          <div className='flex flex-col'>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className='px-8 py-3 text-slate-300 font-bold border-b border-white/10 flex items-center gap-3 hover:bg-slate-800 hover:text-amber-400'
              >
                {link.name === 'Home' && <FaHome className='text-amber-400' />}
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
