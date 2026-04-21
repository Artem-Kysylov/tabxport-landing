import type { BeforeInstallPromptEvent } from '@/types/pwa';

type Listener = () => void;

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<Listener>();
let listenersAttached = false;

function emit(): void {
  listeners.forEach((listener) => {
    listener();
  });
}

export function subscribeDeferredInstallPrompt(listener: Listener): () => void {
  attachGlobalInstallPromptListeners();
  listeners.add(listener);
  listener();
  return () => {
    listeners.delete(listener);
  };
}

export function getDeferredInstallPrompt(): BeforeInstallPromptEvent | null {
  return deferred;
}

export function attachGlobalInstallPromptListeners(): void {
  if (typeof window === 'undefined' || listenersAttached) {
    return;
  }
  listenersAttached = true;

  window.addEventListener('beforeinstallprompt', (event: Event) => {
    event.preventDefault();
    deferred = event as BeforeInstallPromptEvent;
    emit();
  });

  window.addEventListener('appinstalled', () => {
    deferred = null;
    emit();
  });
}

export async function triggerNativeInstallPrompt(): Promise<{
  outcome: 'accepted' | 'dismissed' | 'unavailable';
}> {
  attachGlobalInstallPromptListeners();
  
  // Give a small delay for prompt to potentially appear if it was just captured
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const promptEvent = deferred;
  if (!promptEvent) {
    return { outcome: 'unavailable' };
  }

  // Clear the deferred prompt since we're about to use it
  deferred = null;
  emit();

  try {
    // Trigger the native install prompt
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    return { outcome: choice.outcome === 'accepted' ? 'accepted' : 'dismissed' };
  } catch (error) {
    console.warn('PWA install prompt error:', error);
    return { outcome: 'unavailable' };
  }
}
