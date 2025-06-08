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
      <div className="h-16 bg-yellow-400 sticky bottom-0 left-0 right-0 flex justify-center items-center shadow-lg z-10">
        <button
          className={`${
            isRouletting 
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
          } text-white font-bold py-3 px-8 rounded-full flex items-center space-x-2 transition-all`}
          onClick={handleRouletteClick}
          disabled={isRouletting}
        >
          {isRouletting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2">룰렛 돌리는 중...</span>
            </>
          ) : (
            <>
              <Image src="/shuffle.svg" alt="셔플 아이콘" width={20} height={20} className="invert" />
              <span className="ml-2">오늘의 점심 찾기</span>
            </>
          )}
        </button>
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