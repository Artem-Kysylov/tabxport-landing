'use client';

import { useEffect, useState } from 'react';

const getStandaloneState = (): boolean => {
  if (typeof window === 'undefined') return false;

  const isDisplayModeStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isIosStandalone = window.navigator.standalone === true;

  return isDisplayModeStandalone || isIosStandalone;
};

export const useStandaloneMode = (): boolean => {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const updateStandaloneState = () => {
      setIsStandalone(getStandaloneState());
    };

    updateStandaloneState();
    mediaQuery.addEventListener('change', updateStandaloneState);
    window.addEventListener('appinstalled', updateStandaloneState);

    return () => {
      mediaQuery.removeEventListener('change', updateStandaloneState);
      window.removeEventListener('appinstalled', updateStandaloneState);
    };
  }, []);

  return isStandalone;
};
