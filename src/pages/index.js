import Head from 'next/head';

import Footer from '@/components/common/Footer';
import Navbar from '@/components/common/Navbar';

import Hero from '@/components/home/Hero';
import Offer from '@/components/home/Offer';
import Products from '@/components/home/Products';
import Promo from '@/components/home/Promo';
import Refer from '@/components/home/Refer';
import Trending from '@/components/home/Trending';

import React from 'react';

function index() {
  return (
    <>
      <Head>
        <title>
          Sheii Shop | Trendy Fashion, Affordable Style & Daily Deals
        </title>
        <meta
          name='description'
          content='Discover stylish and affordable fashion at Sheii Shop. Shop the latest trends in clothing, accessories, and beauty with daily offers and exclusive deals.'
        />
        <meta
          name='keywords'
          content="Sheii Shop, trendy fashion, affordable clothing, women's fashion, online boutique, fashion accessories, beauty deals, fashion store"
        />
        <meta name='author' content='Sheii Shop' />
        <meta name='robots' content='index, follow' />

        {/* Open Graph Tags */}
        <meta
          property='og:title'
          content='Sheii Shop | Trendy Fashion & Exclusive Deals'
        />
        <meta
          property='og:description'
          content="Shop the latest women's fashion, accessories, and beauty products at Sheii Shop. Enjoy exclusive offers and trending styles."
        />
        <meta
          property='og:image'
          content='https://www.sheiishop.com/assets/footer-logo.png'
        />
        <meta property='og:url' content='https://www.sheiishop.com' />
        <meta property='og:type' content='website' />
        <meta property='og:site_name' content='Sheii Shop' />

        {/* Optional: Twitter Cards */}
        <meta name='twitter:card' content='summary_large_image' />
        <meta
          name='twitter:title'
          content='Sheii Shop | Trendy Fashion & Exclusive Deals'
        />
        <meta
          name='twitter:description'
          content="Shop trendy and affordable fashion at Sheii Shop. Get exclusive offers on women's clothing, accessories, and more."
        />
        <meta
          name='twitter:image'
          content='https://www.sheiishop.com/assets/footer-logo.png'
        />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              url: 'https://www.sheiishop.com/',
              name: 'Sheii Shop',
              potentialAction: {
                '@type': 'SearchAction',
                target:
                  'https://www.sheiishop.com/search?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </Head>

      <div>
        <Navbar />
        <Hero />
        <Offer />
        <Trending />
        <Promo />
        <Refer />
        <Products />
        <Footer />
      </div>
    </>
  );
}

export default index;
