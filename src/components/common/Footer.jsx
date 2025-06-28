import Link from 'next/link';
import React from 'react';
import { BiPhone } from 'react-icons/bi';
import { CiLocationOn, CiMail } from 'react-icons/ci';

function Footer() {
  return (
    <footer className='bg-footer '>
      <div className='mx-auto max-w-screen-xl space-y-8 px-4 py-6 sm:px-6 lg:space-y-4 lg:px-8'>
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-3 py-4'>
          <div>
            <div className='text-teal-600'>
              <img src='/assets/logo.png' alt='' />
            </div>

            <p className='mt-8 max-w-xs text-sm text-gray-300'>
              Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
              nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam
              erat volutpat.
            </p>

            <ul className='mt-8 flex gap-4'>
              <li>
                <a
                  href='#'
                  rel='noreferrer'
                  target='_blank'
                  className='text-gray-300 transition hover:opacity-75'
                >
                  <img
                    src='https://www.svgrepo.com/show/452196/facebook-1.svg'
                    alt=''
                    className='w-7'
                  />
                </a>
              </li>
              <li>
                <a
                  href='#'
                  rel='noreferrer'
                  target='_blank'
                  className='text-gray-300 transition hover:opacity-75'
                >
                  <img
                    src='https://www.svgrepo.com/show/452138/youtube.svg'
                    alt=''
                    className='w-7'
                  />
                </a>
              </li>
              <li>
                <a
                  href='#'
                  rel='noreferrer'
                  target='_blank'
                  className='text-gray-300 transition hover:opacity-75'
                >
                  <img
                    src='https://www.svgrepo.com/show/452229/instagram-1.svg'
                    alt=''
                    className='w-7'
                  />
                </a>
              </li>
              <li>
                <a
                  href='#'
                  rel='noreferrer'
                  target='_blank'
                  className='text-gray-300 transition hover:opacity-75'
                >
                  <img
                    src='https://www.svgrepo.com/show/331618/twitter.svg'
                    alt=''
                    className='w-7'
                  />
                </a>
              </li>
              <li>
                <a
                  href='#'
                  rel='noreferrer'
                  target='_blank'
                  className='text-gray-300 transition hover:opacity-75'
                >
                  <img
                    src='https://www.svgrepo.com/show/475670/pinterest-color.svg'
                    alt=''
                    className='w-7'
                  />
                </a>
              </li>
            </ul>
          </div>

          <div className='grid grid-cols-1  gap-5 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-2'>
            <div>
              <p className='font-medium text-gray-300'>Store Information</p>

              <ul className='mt-6 space-y-4 text-sm'>
                <li>
                  <Link
                    href='#'
                    className='text-gray-300 transition hover:opacity-75 flex items-start justify-start gap-2'
                  >
                    {' '}
                    <CiLocationOn className='text-4xl' />
                    <span>
                      Megashop - Demo Store 570 - Union Trade Center United
                      States
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href='#'
                    className='text-gray-300 transition hover:opacity-75 flex items-start justify-start gap-2'
                  >
                    {' '}
                    <BiPhone className='text-xl' />
                    <span>+001 476 814</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href='#'
                    className='text-gray-300 transition hover:opacity-75 flex items-start justify-start gap-2'
                  >
                    {' '}
                    <CiMail className='text-xl' />
                    <span>megashop@mega.com</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <hr />
        <div className='flex items-center justify-center  border-gray-600'>
          <p className='text-sm text-gray-300 '>&copy; All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
