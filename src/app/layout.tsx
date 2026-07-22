import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans, Inter, Sora } from "next/font/google";
import "./globals.css";
import Script from 'next/script'
import Providers from "./providers";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pillipot — Your Next Favorite Thing Is Just a Moment Away...",
  description: "Your Next Favorite Thing Is Just a Moment Away... Shop the best products at unbeatable prices.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
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
      className={`${outfit.variable} ${jakarta.variable} ${inter.variable} ${sora.variable} font-sans h-full antialiased`}
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
