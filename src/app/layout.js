import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Velox Solar",
  description: "Energia solar que transforma seu mundo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Google Ads */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17791443438"
          strategy="afterInteractive"
        />
        <Script id="google-ads-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17791443438');
          `}
        </Script>

        {children}
      </body>
    </html>
  );
}
