/**
 * Gerenciador de Service Worker para notificações em background
 */

class ServiceWorkerManager {
  constructor() {
    this.registration = null;
    this.isSupported = 'serviceWorker' in navigator;
  }

  async initialize() {
    if (!this.isSupported) {
      console.warn('Service Worker não suportado neste navegador');
      return false;
    }

    try {
      // Registrar service worker se ainda não estiver registrado
      if (!navigator.serviceWorker.controller) {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker registrado:', this.registration);
      } else {
        this.registration = await navigator.serviceWorker.ready;
        console.log('✅ Service Worker já ativo:', this.registration);
      }

      // Solicitar permissão para notificações
      await this.requestNotificationPermission();
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar Service Worker:', error);
      return false;
    }
  }

  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.warn('Notificações não suportadas neste navegador');
      return false;
    }

    if (Notification.permission === 'granted') {
      console.log('✅ Permissão para notificações já concedida');
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('❌ Permissão para notificações negada');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('📱 Permissão para notificações:', permission);
      return permission === 'granted';
    } catch (error) {
      console.error('❌ Erro ao solicitar permissão:', error);
      return false;
    }
  }

  async scheduleNotification(title, body, delay) {
    if (!this.registration) {
      console.warn('Service Worker não disponível para notificações');
      return false;
    }

    if (Notification.permission !== 'granted') {
      console.warn('Permissão para notificações não concedida');
      return false;
    }

    try {
      // Agendar notificação
      const notificationData = {
        title,
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'workout-timer',
        requireInteraction: true,
        actions: [
          {
            action: 'view',
            title: 'Ver App'
          }
        ]
      };

      // Para iOS, usar setTimeout em vez de service worker
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      if (isIOS) {
        setTimeout(() => {
          if (document.hidden) {
            new Notification(title, {
              body,
              icon: '/icon-192.png',
              tag: 'workout-timer'
            });
          }
        }, delay * 1000);
      } else {
        // Android e outros navegadores
        setTimeout(() => {
          this.registration.showNotification(title, notificationData);
        }, delay * 1000);
      }

      console.log(`📱 Notificação agendada para ${delay}s:`, title);
      return true;
    } catch (error) {
      console.error('❌ Erro ao agendar notificação:', error);
      return false;
    }
  }

  async showNotification(title, body) {
    if (Notification.permission !== 'granted') return false;

    try {
      if (this.registration) {
        await this.registration.showNotification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: 'workout-timer',
          requireInteraction: true
        });
      } else {
        new Notification(title, {
          body,
          icon: '/icon-192.png',
          tag: 'workout-timer'
        });
      }
      return true;
    } catch (error) {
      console.error('❌ Erro ao mostrar notificação:', error);
      return false;
    }
  }
}

export default new ServiceWorkerManager();