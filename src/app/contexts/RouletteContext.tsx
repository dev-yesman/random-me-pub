"use client";

import { createContext, useContext, ReactNode, useState } from 'react';

interface RouletteContextType {
  startRoulette: (() => void) | null;
  setStartRoulette: (fn: (() => void) | null) => void;
  isRouletting: boolean;
  setIsRouletting: (value: boolean) => void;
}

const RouletteContext = createContext<RouletteContextType | undefined>(undefined);

export function RouletteProvider({ children }: { children: ReactNode }) {
  const [startRoulette, setStartRoulette] = useState<(() => void) | null>(null);
  const [isRouletting, setIsRouletting] = useState<boolean>(false);

  const value: RouletteContextType = {
    startRoulette,
    setStartRoulette,
    isRouletting,
    setIsRouletting,
  };

  return (
    <RouletteContext.Provider value={value}>
      {children}
    </RouletteContext.Provider>
  );
}

export function useRoulette() {
  const context = useContext(RouletteContext);
  if (context === undefined) {
    throw new Error('useRoulette must be used within a RouletteProvider');
  }
  return context;
}