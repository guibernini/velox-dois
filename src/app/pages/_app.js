import '../styles/globals.css'; // se tiver estilos globais
import Script from 'next/script';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      {/* Google Ads gtag.js */}
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=AW-17791443438"
      />
      <Script id="google-ads" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-17791443438');
        `}
      </Script>

      <Component {...pageProps} />
    </>
  );
}
