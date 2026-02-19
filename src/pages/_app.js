import { store } from '@/store';
import '@/styles/globals.css';
import { Provider } from 'react-redux';
import FloatingWhatsApp from '@/components/common/FloatingWhatsApp';

export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
      <FloatingWhatsApp />
    </Provider>
  );
}
