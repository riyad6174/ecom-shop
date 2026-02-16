import React from 'react';
import CustomSection from '../layout/CustomSection';
import ProductCard from '../product/ProductCard';
import { FaArrowRight } from 'react-icons/fa6';
import products from '@/utils/products';
import Link from 'next/link';

function Trending() {
  // Filter products with sectionType: "hot"
  const hotProducts = products.filter(
    (product) => product.sectionType === 'hot'
  );

  return (
    <CustomSection>
      <div className='md:bg-[#FFEBE2] px-6 md:px-10 md:py-6 rounded-2xl'>
        <div className='flex items-center justify-between py-3 md:py-8'>
          <div className='flex items-center justify-start gap-4'>
            <h2 className='text-md md:text-2xl font-semibold text-[#212B36]'>
              New Arrivals
            </h2>
          </div>
          <Link
            href={'/products'}
            className='flex items-center justify-center gap-3 text-xs font-semibold'
          >
            <span>More</span>
            <span>
              <FaArrowRight />
            </span>
          </Link>
        </div>

        <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
          {hotProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </CustomSection>
  );
}

export default Trending;
