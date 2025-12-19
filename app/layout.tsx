import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kye Beezy | Artist, Producer & Streamer",
  description: "Official Hub of Kye Beezy. Stream music, catch live Twitch vibes, and grab exclusive Dubby energy deals. The digital home of the next wave.",
  keywords: ["Kye Beezy", "Streamer", "Twitch", "Music Producer", "Beats", "Hip Hop", "Dubby Energy", "Content Creator"],
  authors: [{ name: "Kye Beezy", url: "https://kyebeezy.com" }],
  metadataBase: new URL('https://kyebeezy.com'),
  openGraph: {
    title: "Kye Beezy | Artist, Producer & Streamer",
    description: "Join the Squad. Listen to beats, watch live, and connect.",
    url: "https://kyebeezy.com",
    siteName: "Kye Beezy",
    images: [
      {
        url: "/kye-cutout-new.png", // Using the existing image as a fallback OG image
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kye Beezy",
    description: "Artist, Producer, Streamer.",
    images: ["/kye-cutout-new.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { ThemeProvider } from "@/components/theme-provider";
import Noise from "@/components/ui/noise";
import CustomCursor from "@/components/ui/custom-cursor";
import ScrollProgress from "@/components/ui/scroll-progress";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Noise />
          <CustomCursor />
          <ScrollProgress />
        </ThemeProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Kye Beezy",
              "url": "https://kyebeezy.com",
              "jobTitle": "Artist & Streamer",
              "sameAs": [
                "https://twitch.tv/realkyebeezylive",
                "https://discord.gg/JU3MNRGWXq"
              ]
            })
          }}
        />
      </body>
    </html>
  );
}
