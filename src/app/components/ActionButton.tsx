"use client";

import Image from 'next/image';
import { useState } from 'react';
import Toast from './Toast';
import { useRoulette } from '../contexts/RouletteContext';

export default function ActionButton() {
  const { startRoulette, isRouletting } = useRoulette();
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
  });

  const showToast = (message: string) => {
    setToast({
      isVisible: true,
      message,
    });
  };

  const hideToast = () => {
    setToast({
      ...toast,
      isVisible: false,
    });
  };

  const handleRouletteClick = () => {
    console.log('Button clicked, startRoulette:', startRoulette);
    if (startRoulette) {
      startRoulette();
    } else {
      showToast('지도가 아직 준비되지 않았습니다.');
    }
  };

  return (
    <>
      <div className="h-16 bg-yellow-400 sticky bottom-0 left-0 right-0 flex justify-center items-center shadow-lg z-10" role="toolbar" aria-label="음식점 추천 도구">
        <button
          className={`${
            isRouletting 
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 focus:ring-4 focus:ring-blue-300'
          } text-white font-bold py-3 px-8 rounded-full flex items-center space-x-2 transition-all focus:outline-none`}
          onClick={handleRouletteClick}
          disabled={isRouletting}
          aria-label={isRouletting ? "룰렛 진행 중입니다. 잠시만 기다려주세요." : "주변 음식점 중에서 랜덤으로 추천받기"}
          aria-describedby="roulette-description"
        >
          {isRouletting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2">룰렛 돌리는 중...</span>
            </>
          ) : (
            <>
              <Image src="/shuffle.svg" alt="" width={20} height={20} className="invert" aria-hidden="true" />
              <span className="ml-2">오늘의 점심 찾기</span>
            </>
          )}
        </button>
        <div id="roulette-description" className="sr-only">
          이 버튼을 클릭하면 현재 위치 주변 500m 내의 음식점들 중에서 랜덤으로 하나를 선택해서 추천해드립니다.
        </div>
      </div>

      {/* 토스트 메시지 */}
      <Toast 
        message={toast.message} 
        isVisible={toast.isVisible} 
        onClose={hideToast} 
        duration={2000}
      />
    </>
  );
}