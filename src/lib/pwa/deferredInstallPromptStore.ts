import type { BeforeInstallPromptEvent } from '@/types/pwa';

type Listener = () => void;

// Extend Window to expose the early-captured prompt
declare global {
  interface Window {
    __deferredInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

const listeners = new Set<Listener>();
let storeListenersAttached = false;

function emit(): void {
  listeners.forEach((l) => l());
}

function readWindowPrompt(): BeforeInstallPromptEvent | null {
  if (typeof window === 'undefined') return null;
  return window.__deferredInstallPrompt ?? null;
}

function clearWindowPrompt(): void {
  if (typeof window !== 'undefined') {
    window.__deferredInstallPrompt = null;
  }
}

export function getDeferredInstallPrompt(): BeforeInstallPromptEvent | null {
  return readWindowPrompt();
}

export function attachGlobalInstallPromptListeners(): void {
  if (typeof window === 'undefined' || storeListenersAttached) return;
  storeListenersAttached = true;

  // The inline <head> script already listens for beforeinstallprompt and stores it
  // in window.__deferredInstallPrompt. We listen for our custom signal event and
  // also set up a fallback listener in case the script ran before this code loaded.

  window.addEventListener('tx_pwa_prompt_ready', () => {
    emit();
  });

  // Fallback: register our own listener too (belt-and-suspenders)
  window.addEventListener('beforeinstallprompt', (event: Event) => {
    event.preventDefault();
    window.__deferredInstallPrompt = event as BeforeInstallPromptEvent;
    emit();
  });

  window.addEventListener('appinstalled', () => {
    window.__deferredInstallPrompt = null;
    emit();
  });

  // If the prompt was already captured before this ran, notify immediately
  if (readWindowPrompt()) {
    emit();
  }
}

export function subscribeDeferredInstallPrompt(listener: Listener): () => void {
  attachGlobalInstallPromptListeners();
  listeners.add(listener);
  // Fire immediately so component can sync its state on mount
  listener();
  return () => {
    listeners.delete(listener);
  };
}

export async function triggerNativeInstallPrompt(): Promise<{
  outcome: 'accepted' | 'dismissed' | 'unavailable';
}> {
  attachGlobalInstallPromptListeners();

  const promptEvent = readWindowPrompt();

  if (!promptEvent) {
    return { outcome: 'unavailable' };
  }

  // Consume the event — Chrome only allows calling .prompt() once
  clearWindowPrompt();
  emit();

  try {
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    return { outcome: choice.outcome === 'accepted' ? 'accepted' : 'dismissed' };
  } catch (error) {
    console.warn('[PWA] install prompt error:', error);
    return { outcome: 'unavailable' };
  }
}
