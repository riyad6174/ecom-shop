import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination, Autoplay } from 'swiper/modules';
import Link from 'next/link';

const Hero = () => {
  return (
    <>
      {/* Desktop View */}
      <div className='container py-10 hidden md:block'>
        <div className='grid grid-cols-3 md:grid-cols-3 gap-4'>
          {/* Left Side - Image Slider */}
          <div className='relative col-span-2'>
            <Swiper
              modules={[Pagination, Autoplay]}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              speed={1000}
              className='h-[500px] w-full rounded-xl overflow-hidden'
            >
              {/* First slide: LCP image — load eagerly, high priority */}
              <SwiperSlide>
                <img
                  src='/assets/banner/fan-banner1.png'
                  alt='Winter Collection'
                  className='h-full w-full object-fit rounded-xl'
                  fetchpriority='high'
                  loading='eager'
                  decoding='sync'
                />
              </SwiperSlide>
              {/* Remaining slides: defer loading */}
              <SwiperSlide>
                <img
                  src='/assets/banner/fan-banner2.png'
                  alt='Fan Collection'
                  className='h-full w-full object-fit rounded-xl'
                  loading='lazy'
                  decoding='async'
                />
              </SwiperSlide>
              <SwiperSlide>
                <img
                  src='/assets/banner/watch2.webp'
                  alt='Watch Collection'
                  className='h-full w-full object-fit rounded-xl'
                  loading='lazy'
                  decoding='async'
                />
              </SwiperSlide>
            </Swiper>
          </div>

          {/* Right Side — these are above-fold so load eagerly but without highest priority */}
          <div className='flex flex-col gap-4'>
            <div className='relative rounded-xl overflow-hidden'>
              <img
                src='/assets/banner/watch2.webp'
                alt='Online Shopping'
                className='h-[262px] w-full object-cover'
                loading='eager'
                decoding='async'
              />
              <div className='absolute bottom-0 p-4'>
                <Link
                  href={'/products'}
                  className='mt-2 bg-white text-blue-600 font-semibold py-2 px-4 rounded-md hover:bg-blue-100'
                >
                  Shop Now
                </Link>
              </div>
            </div>

            <div className='relative rounded-xl overflow-hidden'>
              <img
                src='/assets/banner/ring.webp'
                alt='Trade-In Offer'
                className='h-[222px] w-full object-cover'
                loading='eager'
                decoding='async'
              />
              <div className='absolute bottom-0 p-4'>
                <Link
                  href={'/products'}
                  className='mt-2 bg-white text-blue-700 font-semibold py-2 px-4 rounded-md hover:bg-blue-50'
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View - Image Slider */}
      <div className='px-6 pt-6 md:hidden'>
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true, el: '.hero-pagination' }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          speed={1000}
          className='h-[183px] w-full rounded-xl overflow-hidden'
        >
          {/* First slide: LCP on mobile */}
          <SwiperSlide>
            <img
              src='/assets/banner/fan-banner1.png'
              alt='Winter Collection'
              className='h-full w-full object-cover rounded-xl'
              fetchpriority='high'
              loading='eager'
              decoding='sync'
            />
          </SwiperSlide>
          <SwiperSlide>
            <img
              src='/assets/banner/fan-banner2.png'
              alt='Fan Collection'
              className='h-full w-full object-cover rounded-xl'
              loading='lazy'
              decoding='async'
            />
          </SwiperSlide>
          <SwiperSlide>
            <img
              src='/assets/banner/watch2.webp'
              alt='Watch Collection'
              className='h-full w-full object-cover rounded-xl'
              loading='lazy'
              decoding='async'
            />
          </SwiperSlide>
        </Swiper>

        {/* Custom Pagination */}
        <div className='hero-pagination flex items-center justify-center py-3 gap-[5px]'></div>
      </div>

      {/* Custom Pagination Styling (ONLY for this section) */}
      <style jsx>{`
        .hero-pagination :global(.swiper-pagination-bullet) {
          width: 10px;
          padding: 3px;
          height: 10px;
          background: #aaa;
          opacity: 1;
          border-radius: 50%;
          transition: all 0.3s ease-in-out;
        }

        .hero-pagination :global(.swiper-pagination-bullet-active) {
          width: 30px;
          height: 10px;
          border-radius: 5px;
          background: #4169e1;
        }
      `}</style>
    </>
  );
};

export default Hero;
