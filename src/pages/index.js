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

function Index() {
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
          content="Sheii Shop, trendy fashion, affordable clothing, women's fashion, online boutique, fashion accessories, beauty deals, fashion store, smart watches, gadgets, Bangladesh"
        />
        <meta name='author' content='Sheii Shop' />
        <meta
          name='robots'
          content='index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        />
        <link rel='canonical' href='https://www.sheiishop.com/' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />

        {/* Preload LCP hero image — critical for paint score */}
        <link
          rel='preload'
          as='image'
          href='/assets/banner/banner-tag.png'
          fetchPriority='high'
        />

        {/* Open Graph Tags */}
        <meta property='og:locale' content='en_US' />
        <meta property='og:type' content='website' />
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
          content='https://www.sheiishop.com/assets/new-logo.png'
        />
        <meta property='og:image:width' content='1200' />
        <meta property='og:image:height' content='630' />
        <meta property='og:url' content='https://www.sheiishop.com' />
        <meta property='og:site_name' content='Sheii Shop' />

        {/* Twitter Cards */}
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
          content='https://www.sheiishop.com/assets/new-logo.png'
        />

        {/* JSON-LD: WebSite + SearchAction */}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              url: 'https://www.sheiishop.com/',
              name: 'Sheii Shop',
              description:
                'Discover stylish and affordable fashion at Sheii Shop. Shop the latest trends in clothing, accessories, and beauty.',
              potentialAction: {
                '@type': 'SearchAction',
                target:
                  'https://www.sheiishop.com/products?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />

        {/* JSON-LD: Organization */}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Sheii Shop',
              url: 'https://www.sheiishop.com',
              logo: 'https://www.sheiishop.com/assets/new-logo.png',
              sameAs: [],
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+8801814575428',
                contactType: 'customer service',
                areaServed: 'BD',
                availableLanguage: ['English', 'Bengali'],
              },
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Road 12A, Uttora Sector 10',
                addressLocality: 'Dhaka',
                addressCountry: 'BD',
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

export default Index;
