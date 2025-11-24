import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiRefreshCw } from 'react-icons/fi';
import { useThemeStore } from '../stores/themeStore';

const Timer = ({ time, type = 'workout', restTimeTotal, isExerciseRest = false }) => {
  const { soundEnabled, vibrationEnabled } = useThemeStore();
  
  const isRest = type === 'rest';
  const icon = isRest ? FiRefreshCw : FiClock;
  const title = isRest 
    ? isExerciseRest 
      ? 'Descanso Entre Exercícios'
      : 'Descanso Entre Séries'
    : 'Tempo de Treino';
  
  // Calcular porcentagem para timer de descanso
  const getRestProgress = () => {
    if (!isRest || !restTimeTotal) return 0;
    const [minutes, seconds] = time.split(':').map(Number);
    const currentSeconds = minutes * 60 + seconds;
    return ((restTimeTotal - currentSeconds) / restTimeTotal) * 100;
  };

  // Verificar se está nos últimos segundos
  const getTimeInSeconds = () => {
    const [minutes, seconds] = time.split(':').map(Number);
    return minutes * 60 + seconds;
  };

  const timeInSeconds = getTimeInSeconds();
  const isLastTenSeconds = isRest && timeInSeconds <= 10 && timeInSeconds > 0;
  const isLastThreeSeconds = isRest && timeInSeconds <= 3 && timeInSeconds > 0;

  // Função para tocar som respeitando configurações
  const playSound = (type = 'normal') => {
    if (!soundEnabled) return;
    
    try {
      // Usar Web Audio API para sons mais confiáveis
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      const createBeep = (frequency, duration, volume = 0.3) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
      };
      
      if (type === 'urgent') {
        // Som urgente: 3 beeps rápidos e agudos
        createBeep(1000, 0.2, 0.5);
        setTimeout(() => createBeep(1000, 0.2, 0.5), 250);
        setTimeout(() => createBeep(1000, 0.2, 0.5), 500);
      } else if (type === 'warning') {
        // Som de aviso: 2 beeps médios
        createBeep(800, 0.3, 0.4);
        setTimeout(() => createBeep(800, 0.3, 0.4), 400);
      } else {
        // Som normal: 1 beep suave
        createBeep(600, 0.4, 0.3);
      }
    } catch (error) {
      console.warn('Não foi possível reproduzir o som:', error);
      
      // Fallback: tentar com arquivo de áudio
      try {
        const audio = new Audio('/alert.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.warn('Fallback de áudio também falhou:', e));
      } catch (fallbackError) {
        console.warn('Fallback de áudio falhou:', fallbackError);
      }
    }
  };

  // Função para vibrar respeitando configurações
  const vibrate = (pattern = [200]) => {
    if (!vibrationEnabled) return;
    
    if (!('vibrate' in navigator)) {
      console.warn('Vibração não suportada neste navegador');
      return;
    }
    
    try {
      // Para iOS, usar padrões mais simples e compatíveis
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      if (isIOS) {
        // iOS prefere padrões mais simples
        const simplePattern = Array.isArray(pattern) ? pattern[0] || 200 : pattern;
        navigator.vibrate(simplePattern);
      } else {
        // Android e outros dispositivos suportam padrões complexos
        navigator.vibrate(pattern);
      }
    } catch (error) {
      console.warn('Vibração não suportada:', error);
    }
  };

  // Efeitos sonoros e de vibração baseados no tempo
  React.useEffect(() => {
    if (isLastTenSeconds && timeInSeconds === 10) {
      playSound('warning');
      vibrate([100, 100, 100]);
    } else if (isLastThreeSeconds && timeInSeconds <= 3 && timeInSeconds > 0) {
      playSound('urgent');
      vibrate([300]);
    } else if (timeInSeconds === 0 && isRest) {
      playSound('urgent');
      vibrate([500, 200, 500, 200, 500]);
    }
  }, [timeInSeconds, isLastTenSeconds, isLastThreeSeconds, isRest]);

  return (
    <>
      {/* Efeito de flash na tela inteira quando está nos últimos 3 segundos */}
      <AnimatePresence>
        {isLastThreeSeconds && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.3, 0],
              transition: { 
                duration: 0.5, 
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-red-500 pointer-events-none z-40"
          />
        )}
      </AnimatePresence>

      {/* Efeito de borda pulsante quando está nos últimos 10 segundos */}
      <AnimatePresence>
        {isLastTenSeconds && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.8, 0],
              scale: [1, 1.02, 1],
              transition: { 
                duration: 1, 
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 border-4 border-red-500 pointer-events-none z-30 rounded-lg"
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ 
          scale: isLastTenSeconds ? [1, 1.1, 1] : 1, 
          opacity: 1,
          y: isLastThreeSeconds ? [0, -5, 0] : 0
        }}
        transition={{ 
          duration: isLastTenSeconds ? 0.5 : 0.3,
          repeat: isLastTenSeconds ? Infinity : 0
        }}
        className={`
          fixed ${isRest ? 'top-24' : 'top-4'} left-1/2 -translate-x-1/2 z-50 
          px-8 py-4 rounded-2xl shadow-3d border backdrop-blur-sm
          ${isLastThreeSeconds 
            ? 'bg-red-600/90 border-red-400 shadow-red-500/50' 
            : isLastTenSeconds 
              ? 'bg-orange-600/90 border-orange-400 shadow-orange-500/30'
              : isRest 
                ? 'bg-dark-lighter/90 border-secondary' 
                : 'bg-dark-lighter/90 border-dark-medium'
          }
        `}
      >
        <div className="flex flex-col items-center">
          <motion.span 
            className={`text-sm mb-1 ${
              isLastThreeSeconds ? 'text-white font-bold' : 'text-light-darker'
            }`}
            animate={isLastThreeSeconds ? { 
              scale: [1, 1.1, 1],
              transition: { duration: 0.5, repeat: Infinity }
            } : {}}
          >
            {isLastThreeSeconds ? '⚠️ TEMPO ESGOTANDO!' : title}
          </motion.span>
          
          <div className="flex items-center justify-center space-x-4">
            <motion.div
              animate={isLastTenSeconds ? {
                rotate: [0, 10, -10, 0],
                transition: { duration: 0.5, repeat: Infinity }
              } : {}}
            >
              {React.createElement(icon, {
                className: isLastThreeSeconds 
                  ? 'text-white' 
                  : isLastTenSeconds 
                    ? 'text-orange-300'
                    : isRest ? 'text-secondary' : 'text-primary',
                size: isLastTenSeconds ? 40 : 32
              })}
            </motion.div>
            
            <motion.span
              className={`font-mono font-bold text-4xl ${
                isLastThreeSeconds 
                  ? 'text-white' 
                  : isLastTenSeconds 
                    ? 'text-orange-300'
                    : 'text-white'
              }`}
              animate={isLastThreeSeconds ? {
                scale: [1, 1.3, 1],
                textShadow: [
                  '0 0 10px rgba(255,255,255,0.8)',
                  '0 0 30px rgba(255,0,0,0.8)',
                  '0 0 10px rgba(255,255,255,0.8)'
                ],
                transition: { duration: 0.5, repeat: Infinity }
              } : isLastTenSeconds ? {
                scale: [1, 1.1, 1],
                textShadow: [
                  '0 0 5px rgba(255,165,0,0.5)',
                  '0 0 20px rgba(255,165,0,0.8)',
                  '0 0 5px rgba(255,165,0,0.5)'
                ],
                transition: { duration: 1, repeat: Infinity }
              } : { 
                textShadow: [
                  '0 0 5px rgba(255,255,255,0.5)',
                  '0 0 20px rgba(255,255,255,0.3)',
                  '0 0 5px rgba(255,255,255,0.5)'
                ],
                transition: { duration: 2, repeat: Infinity }
              }}
            >
              {time}
            </motion.span>
          </div>
          
          {isRest && (
            <div className="w-full h-2 bg-dark-medium rounded-full mt-2 overflow-hidden">
              <motion.div
                className={`h-full ${
                  isLastThreeSeconds 
                    ? 'bg-red-400' 
                    : isLastTenSeconds 
                      ? 'bg-orange-400'
                      : 'bg-secondary'
                }`}
                initial={{ width: '100%' }}
                animate={{ 
                  width: `${getRestProgress()}%`,
                  boxShadow: isLastTenSeconds ? [
                    '0 0 5px rgba(255,165,0,0.5)',
                    '0 0 15px rgba(255,165,0,0.8)',
                    '0 0 5px rgba(255,165,0,0.5)'
                  ] : undefined
                }}
                transition={{ 
                  width: { duration: 0.3 },
                  boxShadow: { duration: 0.5, repeat: Infinity }
                }}
              />
            </div>
          )}
          
          {/* Mensagem de urgência */}
          {isLastThreeSeconds && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: [0, 1, 0],
                y: [10, 0, -5],
                transition: { duration: 0.5, repeat: Infinity }
              }}
              className="mt-2 text-center"
            >
              <span className="text-white font-bold text-sm">
                🔥 PREPARE-SE! 🔥
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default Timer;