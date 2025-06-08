import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: {
    default: "RandomMe - 주변 음식점 랜덤 추천 룰렛",
    template: "%s | RandomMe"
  },
  description: "현재 위치 기반으로 주변 500m 내 음식점을 찾아 랜덤으로 추천해주는 맛집 룰렛 서비스. 점심 메뉴 고민 끝! 카카오맵 연동으로 정확한 위치와 정보를 제공합니다.",
  keywords: [
    "음식점 추천", "맛집 룰렛", "랜덤 메뉴", "점심 메뉴", "주변 맛집", 
    "위치 기반", "음식점 검색", "메뉴 고민", "랜덤 추천", "카카오맵",
    "restaurant recommendation", "food roulette", "lunch menu", "nearby restaurants"
  ],
  authors: [{ name: "RandomMe Team" }],
  creator: "RandomMe",
  publisher: "RandomMe",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://random-me.com",
    siteName: "RandomMe",
    title: "RandomMe - 주변 음식점 랜덤 추천 룰렛",
    description: "현재 위치 기반으로 주변 음식점을 찾아 랜덤으로 추천해주는 맛집 룰렛 서비스",
    images: [
      {
        url: "https://random-me.com/randome_logo.svg",
        width: 1200,
        height: 630,
        alt: "RandomMe - 음식점 랜덤 추천 서비스",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RandomMe - 주변 음식점 랜덤 추천 룰렛",
    description: "현재 위치 기반으로 주변 음식점을 찾아 랜덤으로 추천해주는 맛집 룰렛 서비스",
    images: ["https://random-me.com/randome_logo.svg"],
    creator: "@randomme_app",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  verification: {
    google: "google-site-verification-code", // 나중에 Google Search Console에서 발급받은 코드로 교체
    other: {
      "naver-site-verification": "369db38af9a9e2f5e68aaade7e4ef18bd307cb86",
    },
  },
  alternates: {
    canonical: "https://random-me.com",
  },
  icons: {
    icon: [
      { url: '/randome_logo.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' }
    ],
    apple: '/randome_logo.svg',
  },
  manifest: "/manifest.json", // PWA를 위한 매니페스트
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
