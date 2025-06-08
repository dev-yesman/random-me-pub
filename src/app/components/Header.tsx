"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Toast from './Toast';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  return (
    <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* 로고 */}
        <div className="flex items-center space-x-2">
          <Image 
            src="/randome_logo.svg" 
            alt="랜덤미 로고" 
            width={40} 
            height={40} 
            priority 
            className="transform translate-y-0.5"
          />
          <h1 className="text-2xl font-bold">랜덤미</h1>
        </div>
        
        {/* 데스크톱 메뉴 */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="hover:text-yellow-300 transition-colors">홈</Link>
          <button 
            onClick={() => showToast('즐겨찾기 기능은 준비 중입니다.')}
            className="text-white hover:text-yellow-300 transition-colors bg-transparent border-none p-0 font-normal"
          >
            즐겨찾기
          </button>
          <button 
            onClick={() => showToast('히스토리 기능은 준비 중입니다.')}
            className="text-white hover:text-yellow-300 transition-colors bg-transparent border-none p-0 font-normal"
          >
            히스토리
          </button>
          <button 
            onClick={() => showToast('로그인 기능은 준비 중입니다.')}
            className="bg-yellow-400 hover:bg-yellow-300 text-blue-800 font-medium px-4 py-2 rounded-full transition-colors"
          >
            로그인
          </button>
        </nav>
        
        {/* 모바일 메뉴 토글 버튼 */}
        <button 
          className="md:hidden text-white focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
      
      {/* 모바일 메뉴 */}
      {isMenuOpen && (
        <div className="md:hidden bg-blue-600 px-4 py-2">
          <nav className="flex flex-col space-y-3 pb-3">
            <Link href="/" className="text-white hover:text-yellow-300 py-2 transition-colors">홈</Link>
            <button 
              onClick={() => showToast('즐겨찾기 기능은 준비 중입니다.')}
              className="text-white hover:text-yellow-300 py-2 transition-colors text-left bg-transparent border-none"
            >
              즐겨찾기
            </button>
            <button 
              onClick={() => showToast('히스토리 기능은 준비 중입니다.')}
              className="text-white hover:text-yellow-300 py-2 transition-colors text-left bg-transparent border-none"
            >
              히스토리
            </button>
            <button 
              onClick={() => showToast('로그인 기능은 준비 중입니다.')}
              className="bg-yellow-400 hover:bg-yellow-300 text-blue-800 font-medium px-4 py-2 rounded-full transition-colors self-start"
            >
              로그인
            </button>
          </nav>
        </div>
      )}
      
      {/* 토스트 메시지 */}
      <Toast 
        message={toast.message} 
        isVisible={toast.isVisible} 
        onClose={hideToast} 
        duration={2000}
      />
    </header>
  );
}