import { useRouter } from 'next/router';
import { store } from '@/store';
import '@/styles/globals.css';
import { Provider } from 'react-redux';
import dynamic from 'next/dynamic';
import { Inter, Montserrat, Noto_Serif_Bengali } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'optional',
  variable: '--font-inter',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'optional',
  variable: '--font-montserrat',
});

const notoSerifBengali = Noto_Serif_Bengali({
  subsets: ['latin', 'bengali'],
  weight: ['400', '600'],
  display: 'optional',
  variable: '--font-noto',
});

const FloatingWhatsApp = dynamic(
  () => import('@/components/common/FloatingWhatsApp'),
  { ssr: false },
);

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isAdminPage = router.pathname.startsWith('/admin');

  return (
    <div
      className={`${inter.variable} ${montserrat.variable} ${notoSerifBengali.variable}`}
    >
      <Provider store={store}>
        <Component {...pageProps} />
        {!isAdminPage && <FloatingWhatsApp />}
      </Provider>
    </div>
  );
}
