'use client';

import React, { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { GoogleAuthPopup } from '@/components/auth/GoogleAuthPopup';

interface GoogleAuthUiContextValue {
  openGoogleAuthPopup: () => void;
}

const GoogleAuthUiContext = createContext<GoogleAuthUiContextValue | null>(null);

export function GoogleAuthUiProvider({ children }: { readonly children: ReactNode }) {
  const [popupOpen, setPopupOpen] = useState(false);

  const openGoogleAuthPopup = useCallback(() => {
    setPopupOpen(true);
  }, []);

  const value = useMemo(
    () => ({
      openGoogleAuthPopup,
    }),
    [openGoogleAuthPopup],
  );

  return (
    <GoogleAuthUiContext.Provider value={value}>
      {children}
      <GoogleAuthPopup trigger={popupOpen} onClose={() => setPopupOpen(false)} />
    </GoogleAuthUiContext.Provider>
  );
}

export function useGoogleAuthUi(): GoogleAuthUiContextValue {
  const ctx = useContext(GoogleAuthUiContext);
  if (!ctx) {
    throw new Error('useGoogleAuthUi must be used within GoogleAuthUiProvider');
  }
  return ctx;
}
