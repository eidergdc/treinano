import { registerSW } from 'virtual:pwa-register';

export const registerSW = () => {
  if ('serviceWorker' in navigator) {
    // Register the service worker
    registerSW({
      onRegistered(r) {
        console.log('Service worker has been registered');
      },
      onRegisterError(error) {
        console.error('Service worker registration failed:', error);
      },
    });
  }
};