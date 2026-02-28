import { useRouter } from 'next/router';
import { store } from '@/store';
import '@/styles/globals.css';
import { Provider } from 'react-redux';
import FloatingWhatsApp from '@/components/common/FloatingWhatsApp';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isAdminPage = router.pathname.startsWith('/admin');

  return (
    <Provider store={store}>
      <Component {...pageProps} />
      {!isAdminPage && <FloatingWhatsApp />}
    </Provider>
  );
}
