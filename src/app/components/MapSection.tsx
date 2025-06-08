"use client";

import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// 클라이언트 사이드에서만 렌더링되도록 동적 임포트
const KakaoMap = dynamic(
  () => import('../(kakaoMap)/KakaoMap'),
  { ssr: false, loading: () => <MapLoading /> }
);

function MapLoading() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <p className="text-lg font-medium text-blue-600">지도를 불러오는 중...</p>
        <p className="text-sm text-gray-500 mt-2">잠시만 기다려주세요</p>
      </div>
    </div>
  );
}

export default function MapSection() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 서버 사이드 렌더링 시 컨텐츠 없음
  if (!isClient) {
    return <MapLoading />;
  }

  return (
    <Suspense fallback={<MapLoading />}>
      <KakaoMap />
    </Suspense>
  );
}