"use client";

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  duration?: number;
  isVisible: boolean;
  onClose: () => void;
}

export default function Toast({ message, duration = 2000, isVisible, onClose }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-fade-in-down">
        {message}
      </div>
    </div>
  );
}