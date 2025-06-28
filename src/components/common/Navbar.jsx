import React from 'react';
import { useRouter } from 'next/router';
import { HiMiniChevronDown } from 'react-icons/hi2';
import { GoBell } from 'react-icons/go';
import { TfiHeart } from 'react-icons/tfi';
import { IoCartOutline } from 'react-icons/io5';
import Link from 'next/link';
import { FaBars } from 'react-icons/fa6';
import { BiSearch } from 'react-icons/bi';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
function Navbar() {
  const router = useRouter();

  return (
    <>
      {/* large device navbar */}
      <nav className='hidden md:block'>
        <div className='bg-white shadow-md'>
          <div className=' container  py-4  flex items-center justify-center'>
            <Link href='/'>
              <img className='h-20' src='/assets/logo.png' alt='Logo' />
            </Link>

            {/* <div className='flex items-center space-x-6'>
              <button className='flex items-center justify-center bg-gray-100 rounded-full px-5 py-2'>
                2 x <IoCartOutline className='text-2xl text-gray-500' />
              </button>
            </div> */}
          </div>
        </div>

        <div className='bg-gray-700 border-t py-3 px-6 flex justify-center space-x-6 text-gray-100 text-sm'>
          <Link
            href='/products'
            className={`${
              router.pathname === '/products'
                ? 'text-blue-600 font-semibold'
                : ''
            }`}
          >
            Products
          </Link>

          <Link
            href='/about-us'
            className={`${
              router.pathname === '/about-us'
                ? 'text-blue-600 font-semibold'
                : ''
            }`}
          >
            About Us
          </Link>
          <Link
            href='/contact-us'
            className={`${
              router.pathname === '/contact-us'
                ? 'text-blue-600 font-semibold'
                : ''
            }`}
          >
            Contact Us
          </Link>
        </div>
      </nav>
      {/* small device navbar */}
      <nav className='block md:hidden'>
        <div className='px-6 py-2 bg-white'>
          <div className='flex items-center justify-center'>
            {/* <button className='text-2xl text-gray-500'>
              <FaBars />
            </button> */}
            <Link href='/'>
              <img className='h-12' src='/assets/logo.png' alt='Logo' />
            </Link>
            {/* <button>
              <IoCartOutline className='text-2xl text-gray-500' />
            </button> */}
          </div>
        </div>
        {/* <div className='px-6 pt-2 pb-6 bg-white relative'>
          <input
            type='text'
            placeholder='Search here'
            className='w-full px-3 py-3 border rounded-xl bg-slate-50 focus:outline-none'
          />
          <button className='absolute text-sm top-[18px] right-10  text-white bg-primary px-4 py-[5px] rounded-md'>
            Search
          </button>
        </div> */}
      </nav>
    </>
  );
}

export default Navbar;
