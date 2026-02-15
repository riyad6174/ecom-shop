import { store } from '@/store';
import '@/styles/globals.css';
import { Provider } from 'react-redux';
import { GoogleTagManager } from '@next/third-parties/google';

export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID || 'GTM-MJXWJ24V'} />
      <Component {...pageProps} />
    </Provider>
  );
}
