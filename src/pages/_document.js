import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang='en'>
      <Head>
        <meta charSet='utf-8' />
        <meta name='theme-color' content='#3553b7' />

        {/* Favicon & App Icons */}
        <link rel='icon' href='/favicon.ico' sizes='any' />
        <link rel='icon' type='image/png' sizes='32x32' href='/favicon.ico' />
        <link rel='apple-touch-icon' href='/assets/new-logo.png' />

        {/* Stape Custom GTM Loader — must stay near top of <head> */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src="https://data.sheiishop.com/7rkxzywpkozt.js?"+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','58xvcd=HR5SLCQ6VDc%2BIjghQkMvXAJHXUVBUR0USQkHDhkeChIbCkEIHxo%3D');`,
          }}
        />

        {/* Fonts are served by next/font/google in _app.js — no external requests needed */}
      </Head>
      <body className='antialiased'>
        {/* Stape GTM noscript fallback — immediately after <body> */}
        <noscript>
          <iframe
            src='https://data.sheiishop.com/ns.html?id=GTM-MJXWJ24V'
            height='0'
            width='0'
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
