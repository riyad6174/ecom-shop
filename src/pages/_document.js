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

        {/* Preconnect to Google Fonts origin — must come before stylesheet links */}
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />

        {/*
          Google Fonts — consolidated into ONE request.
          Only the weights actually used in tailwind.config are loaded:
            Inter       → default sans (body text): 400, 500, 600, 700
            Montserrat  → font-mont (headings/buttons): 400, 600, 700
            Noto Serif Bengali → font-noto (Bengali text): 400, 600
          Removed: Josefin Sans, Nanum Myeongjo, Poppins, Roboto Condensed
                   (not referenced in tailwind config as active font stacks)
          &display=optional avoids invisible text flash; browser uses cached
          fallback immediately and swaps only if font arrives in time.
        */}
        <link
          rel='preload'
          as='style'
          href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@400;600;700&family=Noto+Serif+Bengali:wght@400;600&display=optional'
        />
        <link
          href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@400;600;700&family=Noto+Serif+Bengali:wght@400;600&display=optional'
          rel='stylesheet'
        />
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
