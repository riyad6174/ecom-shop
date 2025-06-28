import React from 'react';
import CustomSection from '../layout/CustomSection';

function Offer() {
  return (
    <CustomSection>
      <div className='hidden md:grid grid-cols-2 gap-6 font-mont'>
        <div className='bg-white px-10 py-10 flex flex-col gap-3 rounded-lg'>
          <span className='font-semibold text-gray-500'>Keyboard</span>
          <span className='text-2xl font-bold'>Sale 20% off</span>
          <div className='flex'>
            <button className='bg-dark text-white px-3 py-2 text-xs rounded-lg'>
              Shop Now
            </button>
          </div>
        </div>
        <div className='bg-white px-10 py-10 flex flex-col gap-3 rounded-lg'>
          <span className='font-semibold text-gray-500'>Keyboard</span>
          <span className='text-2xl font-bold'>Sale 20% off</span>
          <div className='flex'>
            <button className='bg-dark text-white px-3 py-2 text-xs rounded-lg'>
              Shop Now
            </button>
          </div>
        </div>
      </div>
    </CustomSection>
  );
}

export default Offer;
