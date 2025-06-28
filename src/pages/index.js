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
  );
}

export default index;
