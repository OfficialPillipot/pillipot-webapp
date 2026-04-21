import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import Script from 'next/script'
import ScrollToTop from "@/components/common/ScrollToTop";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pillipot — Your Marketplace",
  description: "Shop the best products at unbeatable prices. Electronics, fashion, home & more with free delivery.",
};

// LoginModal moved to AuthProvider to support dynamic imports (client-only)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} font-sans h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Meta Pixel Script using next/script */}
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1641327153869995');
              fbq('track', 'PageView');
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-pp-surface" suppressHydrationWarning>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <ScrollToTop />
                {children}
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

