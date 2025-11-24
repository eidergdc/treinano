import ServiceWorkerManager from './ServiceWorkerManager';

/**
 * Sistema de timer que funciona em background
 * Usa Web Workers e localStorage para manter precisão mesmo quando o app está minimizado
 */

class BackgroundTimer {
  constructor(onTick, onComplete) {
    this.onTick = onTick;
    this.onComplete = onComplete;
    this.startTime = null;
    this.duration = 0;
    this.isRunning = false;
    this.intervalId = null;
    this.storageKey = null;
    this.type = 'timer';
    
    // Bind methods
    this.tick = this.tick.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handlePageShow = this.handlePageShow.bind(this);
    
    // Listen for visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('pageshow', this.handlePageShow);
    window.addEventListener('focus', this.handlePageShow);
  }

  start(duration, type = 'timer', storageKey = null) {
    console.log(`🚀 Iniciando ${type} timer:`, { duration, storageKey });
    
    this.duration = duration;
    this.type = type;
    this.storageKey = storageKey || `treinano-${type}-${Date.now()}`;
    this.startTime = Date.now();
    this.isRunning = true;
    
    // Salvar no localStorage para recuperação
    this.saveToStorage();
    
    // Iniciar timer
    this.intervalId = setInterval(this.tick, 1000);
    
    // Tick inicial
    this.tick();
  }

  tick() {
    if (!this.isRunning) return;
    
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const remaining = Math.max(0, this.duration - elapsed);
    
    // Atualizar localStorage
    this.saveToStorage();
    
    // Callback
    if (this.onTick) {
      this.onTick(remaining, elapsed);
    }
    
    // Agendar notificação para quando o timer terminar (apenas uma vez)
    if (remaining === 10 && this.type.includes('rest')) {
      this.scheduleEndNotification(remaining);
    }
    
    // Verificar se terminou
    if (remaining <= 0) {
      this.complete();
    }
  }

  scheduleEndNotification(remaining) {
    // Agendar notificação apenas uma vez quando chegar em 10 segundos
    if (!this.notificationScheduled && remaining === 10) {
      this.notificationScheduled = true;
      ServiceWorkerManager.scheduleNotification(
        '⏰ Descanso Terminando',
        'Prepare-se para a próxima série!',
        10
      );
    }
  }

  complete() {
    console.log(`✅ Timer ${this.type} completado`);
    
    this.stop();
    
    if (this.onComplete) {
      this.onComplete();
    }
  }

  stop() {
    console.log(`🛑 Parando timer ${this.type}`);
    
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    // Limpar do localStorage
    if (this.storageKey) {
      localStorage.removeItem(this.storageKey);
    }
  }

  pause() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.saveToStorage();
  }

  resume() {
    if (this.isRunning && !this.intervalId) {
      this.intervalId = setInterval(this.tick, 1000);
    }
  }

  saveToStorage() {
    if (!this.storageKey || !this.isRunning) return;
    
    const data = {
      startTime: this.startTime,
      duration: this.duration,
      type: this.type,
      isRunning: this.isRunning,
      savedAt: Date.now()
    };
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Erro ao salvar timer no localStorage:', error);
    }
  }

  loadFromStorage(storageKey) {
    try {
      const data = localStorage.getItem(storageKey);
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      
      // Verificar se o timer ainda é válido (não muito antigo)
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 horas
      
      if (now - parsed.savedAt > maxAge) {
        localStorage.removeItem(storageKey);
        return null;
      }
      
      return parsed;
    } catch (error) {
      console.warn('Erro ao carregar timer do localStorage:', error);
      return null;
    }
  }

  handleVisibilityChange() {
    if (document.hidden) {
      console.log('📱 App foi para background - pausando timer visual');
      this.pause();
    } else {
      console.log('📱 App voltou para foreground - resumindo timer');
      this.checkAndResume();
    }
  }

  handlePageShow(event) {
    // Evento pageshow é mais confiável no iOS
    if (!event.persisted) return;
    
    console.log('📱 Página restaurada do cache - verificando timers');
    this.checkAndResume();
  }

  checkAndResume() {
    if (!this.isRunning || !this.storageKey) return;
    
    // Verificar se o timer ainda deve estar rodando
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const remaining = Math.max(0, this.duration - elapsed);
    
    if (remaining > 0) {
      console.log(`🔄 Resumindo timer ${this.type} - ${remaining}s restantes`);
      this.resume();
      
      // Atualizar imediatamente
      this.tick();
    } else {
      console.log(`⏰ Timer ${this.type} expirou enquanto estava em background`);
      this.complete();
    }
  }

  // Método estático para recuperar timers perdidos
  static recoverTimers() {
    const recoveredTimers = [];
    
    // Procurar por timers salvos no localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('treinano-')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data && data.isRunning) {
            const elapsed = Math.floor((Date.now() - data.startTime) / 1000);
            const remaining = Math.max(0, data.duration - elapsed);
            
            if (remaining > 0) {
              recoveredTimers.push({
                key,
                data,
                remaining,
                elapsed
              });
            } else {
              // Timer expirado, limpar
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          console.warn('Erro ao recuperar timer:', key, error);
          localStorage.removeItem(key);
        }
      }
    }
    
    return recoveredTimers;
  }

  destroy() {
    this.stop();
    
    // Remover event listeners
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('pageshow', this.handlePageShow);
    window.removeEventListener('focus', this.handlePageShow);
  }
}

export default BackgroundTimer;