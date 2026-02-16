import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

function FloatingWhatsApp() {
  return (
    <>
      <style jsx global>{`
        @keyframes whatsapp-pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.5);
          }
          70% {
            box-shadow: 0 0 0 14px rgba(37, 211, 102, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(37, 211, 102, 0);
          }
        }
      `}</style>
      <a
        href='https://wa.me/8801814575428'
        target='_blank'
        rel='noreferrer'
        aria-label='Chat on WhatsApp'
        className='fixed bottom-6 right-6 z-50 bg-[#25D366] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-[#1ebe57] transition-colors'
        style={{ animation: 'whatsapp-pulse 2s infinite' }}
      >
        <FaWhatsapp className='text-3xl' />
      </a>
    </>
  );
}

export default FloatingWhatsApp;
