import Head from 'next/head';
import Navbar from '@/components/common/Navbar';
import React from 'react';

function AboutUs() {
  return (
    <>
      <Head>
        <title>About Us | Sheii Shop - Our Story & Mission</title>
        <meta
          name='description'
          content='Learn about Sheii Shop — founded in 2025, we bring stylish, high-quality, and innovative products to elevate everyday living. Discover our mission and values.'
        />
        <meta
          name='keywords'
          content='Sheii Shop about, about Sheii Shop, fashion brand Bangladesh, online store Dhaka'
        />
        <meta name='robots' content='index, follow' />
        <link rel='canonical' href='https://www.sheiishop.com/about-us' />

        <meta property='og:type' content='website' />
        <meta property='og:title' content='About Us | Sheii Shop' />
        <meta
          property='og:description'
          content='Learn about Sheii Shop — founded in 2025, we bring stylish, high-quality, and innovative products to elevate everyday living.'
        />
        <meta
          property='og:image'
          content='https://www.sheiishop.com/assets/logo.png'
        />
        <meta property='og:url' content='https://www.sheiishop.com/about-us' />
        <meta property='og:site_name' content='Sheii Shop' />

        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:title' content='About Us | Sheii Shop' />
        <meta
          name='twitter:description'
          content='Learn about Sheii Shop — founded in 2025, we bring stylish, high-quality, and innovative products to elevate everyday living.'
        />
        <meta
          name='twitter:image'
          content='https://www.sheiishop.com/assets/logo.png'
        />

        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'AboutPage',
              name: 'About Sheii Shop',
              url: 'https://www.sheiishop.com/about-us',
              description:
                'Founded in 2025, Sheii Shop is your go-to destination for stylish, high-quality, and innovative products.',
              mainEntity: {
                '@type': 'Organization',
                name: 'Sheii Shop',
                foundingDate: '2025',
                url: 'https://www.sheiishop.com',
                logo: 'https://www.sheiishop.com/assets/logo.png',
              },
            }),
          }}
        />
      </Head>

      <div>
        <Navbar />
        <div className='sm:flex items-center max-w-screen-xl'>
          <div className='sm:w-1/2 p-10'>
            <div className='image object-center text-center'>
              <img
                src='https://i.imgur.com/WbQnbas.png'
                alt='About Sheii Shop'
              />
            </div>
          </div>
          <div className='sm:w-1/2 p-5'>
            <div className='text'>
              <span className='text-gray-500 border-b-2 border-indigo-600 uppercase'>
                About us
              </span>
              <h1 className='my-4 font-bold text-3xl sm:text-4xl'>
                About <span className='text-primary'>Sheii Shop</span>
              </h1>
              <p className='text-gray-700'>
                Founded in 2025, Sheii Shop is your go-to destination for
                stylish, high-quality, and innovative products that elevate
                everyday living. Specializing in imported accessories,
                cutting-edge devices, home essentials, and trendy must-haves, we
                curate a collection that blends functionality with flair. <br />{' '}
                <br /> Our mission is simple: to delight our customers with
                reliable, fashionable, and forward-thinking goods that inspire
                and enhance their lifestyle. At Sheii Shop, we&apos;re committed
                to exceptional quality, seamless shopping experiences, and
                bringing global trends right to your doorstep. <br /> Join us on
                this journey to redefine everyday elegance—shop with Sheii,
                where style meets innovation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AboutUs;
