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
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/icon.svg',
  },
  openGraph: {
    title: "Kye Beezy | Artist, Producer & Streamer",
    description: "Join the Squad. Listen to beats, watch live, and connect.",
    url: "https://kyebeezy.com",
    siteName: "Kye Beezy",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kye Beezy",
    description: "Artist, Producer, Streamer.",
    // images automatically handled by opengraph-image.tsx
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
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import GlobalAlert from "@/components/ui/global-alert";

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
        <AuthProvider>
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
            <GlobalAlert />
            <Toaster theme="dark" position="top-right" />
          </ThemeProvider>
        </AuthProvider>
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
                "https://www.twitch.tv/realkyebeezylive",
                "https://www.youtube.com/@KyeBeezyLiveOnTwitch",
                "https://www.bandlab.com/kyebeezy",
                "https://discord.com/invite/JU3MNRGWXq"
              ]
            })
          }}
        />
      </body>
    </html>
  );
}
