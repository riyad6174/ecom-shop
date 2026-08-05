import Link from 'next/link';
import React from 'react';
import { BiPhone } from 'react-icons/bi';
import { BsWhatsapp } from 'react-icons/bs';
import { CiLocationOn, CiMail } from 'react-icons/ci';
import { FaFacebook } from 'react-icons/fa';

function Footer() {
  return (
    <footer className='bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-gray-200'>
      <div className='mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
          {/* Brand Section */}
          <div className='space-y-6'>
            <div>
              <img
                src='/assets/logo.png'
                alt='Sheii Shop Logo'
                className='w-40 transition-transform duration-300 hover:scale-105'
              />
            </div>
            <p className='max-w-xs text-sm leading-relaxed opacity-80'>
              <strong>Sheii Shop</strong>, founded in 2025, is a retailer
              specializing in imported accessories, smart devices, home
              essentials, and trendy lifestyle products. We are proud to be a{' '}
              <strong>
                sister concern of{' '}
                <a
                  href='https://www.sfcorporation.co'
                  target='_blank'
                  rel='noreferrer'
                  className='underline hover:text-white'
                >
                  SF Corporation
                </a>
              </strong>
              , committed to delivering quality, innovation, and value to our
              customers.
            </p>
            <p className='text-xs opacity-70'>
              Trade License: TRAD/DNCC/004449/2026
            </p>
            <div className='flex gap-4'>
              <a
                href='https://www.facebook.com/share/1Y36dHzXAW/?mibextid=wwXIfr'
                rel='noreferrer'
                target='_blank'
                className='group rounded-full p-2 transition-all duration-300 hover:bg-white/20'
                aria-label='Facebook'
              >
                <FaFacebook size={25} />
              </a>
              <a
                href='http://wa.me/8801814575428'
                rel='noreferrer'
                target='_blank'
                className='group rounded-full p-2 transition-all duration-300 hover:bg-white/20'
                aria-label='WhatsApp'
              >
                <BsWhatsapp size={25} />
              </a>
            </div>
          </div>

          {/* Store Information */}
          <div className='lg:col-span-1'>
            <h3 className='text-lg font-semibold text-white mb-6'>
              Store Information
            </h3>
            <ul className='space-y-4 text-sm'>
              <li>
                <Link
                  href='#'
                  className='flex items-start gap-3 transition-all duration-300 hover:text-white'
                >
                  <CiLocationOn className='text-2xl flex-shrink-0' />
                  <span>Road 3B, Uttora Sector 9 , Dhaka, Bangladesh</span>
                </Link>
              </li>
              <li>
                <a
                  href='tel:8801814575428'
                  className='flex items-center gap-3 transition-all duration-300 hover:text-white'
                >
                  <BiPhone className='text-xl flex-shrink-0' />
                  <span>+8801814575428</span>
                </a>
              </li>
              <li>
                <Link
                  href='mailto:helloseiishop@gmail.com'
                  className='flex items-center gap-3 transition-all duration-300 hover:text-white'
                >
                  <CiMail className='text-xl flex-shrink-0' />
                  <span>helloseiishop@gmail.com</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className='lg:col-span-1'>
            <h3 className='text-lg font-semibold text-white mb-6'>
              Quick Links
            </h3>
            <ul className='space-y-4 text-sm'>
              <li>
                <Link
                  href='/about-us'
                  className='transition-all duration-300 hover:text-white'
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href='/products'
                  className='transition-all duration-300 hover:text-white'
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  href='/contact-us'
                  className='transition-all duration-300 hover:text-white'
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider and Copyright */}
        <hr className='my-8 border-white/20' />
        <div className='flex flex-col items-center justify-center gap-2 text-sm sm:flex-row sm:gap-4'>
          <p className='opacity-80'>
            &copy; {new Date().getFullYear()} Sheii Shop. All Rights Reserved.
          </p>
          <span className='hidden opacity-50 sm:inline'>|</span>
          <p className='opacity-80'>
            Developed by Scela Venture - Sister concern of SF Corporation
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
