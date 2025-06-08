
import type { Metadata } from "next";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ActionButton from "./components/ActionButton";
import MapSection from "./components/MapSection";
import { RouletteProvider } from "./contexts/RouletteContext";

export const metadata: Metadata = {
  title: "RandomMe - 주변 음식점 랜덤 추천 룰렛",
  description: "현재 위치에서 반경 500m 내 음식점을 실시간으로 검색하고 랜덤으로 추천해주는 맛집 룰렛 서비스. 점심 메뉴 고민을 한 번에 해결하세요!",
  keywords: [
    "음식점 추천", "맛집 룰렛", "랜덤 메뉴 추천", "점심 메뉴", "주변 맛집", 
    "위치기반 맛집", "음식점 검색", "메뉴 선택", "랜덤 점심", "카카오맵 맛집"
  ],
  openGraph: {
    title: "RandomMe - 주변 음식점 랜덤 추천 룰렛",
    description: "현재 위치에서 반경 500m 내 음식점을 실시간으로 검색하고 랜덤으로 추천해주는 맛집 룰렛 서비스",
    url: "https://random-me.com",
    type: "website",
    images: [
      {
        url: "https://random-me.com/randome_logo.svg",
        width: 1200,
        height: 630,
        alt: "RandomMe 음식점 랜덤 추천 서비스",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RandomMe - 주변 음식점 랜덤 추천 룰렛",
    description: "현재 위치에서 반경 500m 내 음식점을 실시간으로 검색하고 랜덤으로 추천해주는 맛집 룰렛 서비스",
    images: ["https://random-me.com/randome_logo.svg"],
  },
  alternates: {
    canonical: "https://random-me.com",
  },
};

// JSON-LD 구조화된 데이터
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'RandomMe',
  description: '현재 위치 기반으로 주변 음식점을 찾아 랜덤으로 추천해주는 맛집 룰렛 서비스',
  url: 'https://random-me.com',
  applicationCategory: 'FoodAndDrink',
  operatingSystem: 'Web Browser',
  browserRequirements: 'Geolocation API support',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'KRW',
  },
  creator: {
    '@type': 'Organization',
    name: 'RandomMe Team',
  },
  audience: {
    '@type': 'Audience',
    audienceType: '음식점을 찾는 사용자',
  },
  featureList: [
    '위치 기반 음식점 검색',
    '랜덤 음식점 추천',
    '카카오맵 연동',
    '반경 500m 내 검색',
    '실시간 위치 기반 서비스'
  ],
};

export default function Home() {
  return (
    <RouletteProvider>
      {/* 구조화된 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="flex flex-col h-screen">
        <Header />
        <main className="flex-1 min-h-0 relative">
          <MapSection />
        </main>
        <Footer />
        <ActionButton />
      </div>
    </RouletteProvider>
  );
}
