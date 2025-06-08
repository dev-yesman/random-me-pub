"use client";

import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-800 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* 로고 및 서비스명 */}
          <div className="flex items-center space-x-2">
            <Image 
              src="/randome_logo.svg" 
              alt="랜덤미 로고" 
              width={28} 
              height={28} 
            />
            <span className="text-base font-semibold">랜덤미</span>
          </div>
          
          {/* 약관 링크들 */}
          <div className="flex gap-x-4 text-sm">
            <Link href="#" className="text-gray-300 hover:text-yellow-300 transition-colors">
              이용약관
            </Link>
            <Link href="#" className="text-gray-300 hover:text-yellow-300 transition-colors">
              개인정보처리방침
            </Link>
          </div>
        </div>
        
        {/* 카피라이트 */}
        <div className="mt-2">
          <p className="text-xs text-gray-300 text-center">
            © {new Date().getFullYear()} 랜덤미. 모든 권리 보유.
          </p>
        </div>
      </div>
    </footer>
  );
}