import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSettings, FiDroplet, FiType, FiVolume2, FiBell, FiMoon, FiSun, FiSmartphone, FiSave, FiCheck } from 'react-icons/fi';
import { useThemeStore } from '../stores/themeStore';
import ThemeToggle from '../components/ThemeToggle';
import { toast } from 'react-toastify';

const Settings = () => {
  const { 
    isDarkMode, 
    accentColor, 
    fontSize, 
    soundEnabled,
    vibrationEnabled,
    keepScreenOn,
    saveSettings
  } = useThemeStore();

  // Estado local para as configurações temporárias
  const [tempSettings, setTempSettings] = useState({
    isDarkMode,
    accentColor,
    fontSize,
    soundEnabled,
    vibrationEnabled,
    keepScreenOn
  });
  
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Verificar se há mudanças
  React.useEffect(() => {
    const changes = 
      tempSettings.isDarkMode !== isDarkMode ||
      tempSettings.accentColor !== accentColor ||
      tempSettings.fontSize !== fontSize ||
      tempSettings.soundEnabled !== soundEnabled ||
      tempSettings.vibrationEnabled !== vibrationEnabled ||
      tempSettings.keepScreenOn !== keepScreenOn;
    
    setHasChanges(changes);
  }, [tempSettings, isDarkMode, accentColor, fontSize, soundEnabled, vibrationEnabled, keepScreenOn]);

  const accentColors = [
    { name: 'Laranja', value: '#FF4500' },
    { name: 'Azul', value: '#4A90E2' },
    { name: 'Verde', value: '#28A745' },
    { name: 'Roxo', value: '#6F42C1' },
    { name: 'Rosa', value: '#E91E63' },
    { name: 'Vermelho', value: '#DC3545' },
    { name: 'Amarelo', value: '#FFC107' },
    { name: 'Ciano', value: '#17A2B8' }
  ];

  const fontSizes = [
    { name: 'Pequeno', value: 'small' },
    { name: 'Médio', value: 'medium' },
    { name: 'Grande', value: 'large' }
  ];

  const handleColorChange = (color) => {
    setTempSettings(prev => ({ ...prev, accentColor: color }));
  };

  const handleFontSizeChange = (size) => {
    setTempSettings(prev => ({ ...prev, fontSize: size }));
  };

  const handleThemeToggle = () => {
    setTempSettings(prev => ({ ...prev, isDarkMode: !prev.isDarkMode }));
  };

  const handleSoundToggle = () => {
    setTempSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  const handleVibrationToggle = () => {
    setTempSettings(prev => ({ ...prev, vibrationEnabled: !prev.vibrationEnabled }));
  };

  const handleKeepScreenOnToggle = () => {
    setTempSettings(prev => ({ ...prev, keepScreenOn: !prev.keepScreenOn }));
  };

  // Salvar todas as configurações
  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      
      console.log('💾 === INICIANDO SALVAMENTO MANUAL ===');
      console.log('📝 Configurações a serem salvas:', tempSettings);
      
      // Aplicar configurações de wake lock se necessário
      if (tempSettings.keepScreenOn && !keepScreenOn) {
        if ('wakeLock' in navigator) {
          try {
            await navigator.wakeLock.request('screen');
            console.log('📱 Wake Lock ativado');
          } catch (error) {
            console.warn('Wake Lock não suportado:', error);
          }
        }
      }
      
      // Salvar todas as configurações
      await saveSettings(tempSettings);
      
      // Verificar se foi salvo corretamente
      const verification = localStorage.getItem('treinano-settings');
      console.log('🔍 Verificação pós-salvamento:', verification);
      
      if (verification) {
        const parsed = JSON.parse(verification);
        if (parsed.accentColor === tempSettings.accentColor) {
          console.log('✅ Salvamento verificado com sucesso!');
        } else {
          console.warn('⚠️ Verificação falhou - cores diferentes');
        }
      }
      
      toast.success('✅ Configurações salvas com sucesso!', {
        position: "top-center",
        autoClose: 3000,
      });
      
      setHasChanges(false);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('❌ Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  // Resetar configurações
  const handleResetSettings = () => {
    setTempSettings({
      isDarkMode,
      accentColor,
      fontSize,
      soundEnabled,
      vibrationEnabled,
      keepScreenOn
    });
    setHasChanges(false);
    toast.info('Alterações descartadas');
  };

  const testSound = () => {
    if (tempSettings.soundEnabled) {
      // Testar som usando Web Audio API
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800; // Frequência do beep
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        
        toast.success('🔊 Som de teste reproduzido!');
      } catch (error) {
        console.error('❌ Erro ao criar beep sintético:', error);
        
        // Fallback: tentar com arquivo de áudio
        try {
          const audio = new Audio('/alert.mp3');
          audio.volume = 0.5;
          audio.play().then(() => {
            toast.success('🔊 Som de teste reproduzido (fallback)!');
          }).catch(e => {
            toast.error('Som não suportado neste navegador');
          });
        } catch (fallbackError) {
          toast.error('Som não suportado neste navegador');
        }
      }
    } else {
      toast.info('Sons estão desativados');
    }
  };

  const testVibration = () => {
    if (!tempSettings.vibrationEnabled) {
      toast.info('Vibração está desativada');
      return;
    }

    // Verificar suporte à vibração
    if (!('vibrate' in navigator)) {
      toast.info('Vibração não suportada neste navegador');
      return;
    }

    // Para iOS, a vibração só funciona em contexto de interação do usuário
    // e precisa ser ativada de forma específica
    try {
      // Padrão de vibração mais compatível com iOS
      const vibrationPattern = [200, 100, 200];
      
      // Tentar vibração simples primeiro (mais compatível)
      const result = navigator.vibrate(vibrationPattern);
      
      if (result) {
        toast.success('📳 Vibração ativada!');
      } else {
        // Se falhar, tentar vibração simples
        const simpleResult = navigator.vibrate(200);
        if (simpleResult) {
          toast.success('📳 Vibração simples ativada!');
        } else {
          toast.warning('Vibração não funcionou - pode estar bloqueada pelo sistema');
        }
      }
    } catch (error) {
      console.error('Erro na vibração:', error);
      
      // Tentar método alternativo para iOS
      try {
        // Método alternativo que pode funcionar melhor no iOS
        if (window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function') {
          toast.info('📳 Para ativar vibração no iOS, permita acesso aos sensores de movimento');
        } else {
          navigator.vibrate(200);
          toast.info('📳 Tentativa de vibração enviada');
        }
      } catch (error) {
        toast.error('Vibração não suportada neste dispositivo');
      }
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold mb-1">Configurações</h1>
        <p className="text-light-darker">Personalize sua experiência</p>
      </motion.div>

      <div className="space-y-6">
        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center mb-4">
            <FiDroplet className="text-primary mr-2" size={24} />
            <h2 className="text-xl font-bold">Aparência</h2>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              {tempSettings.isDarkMode ? <FiMoon className="mr-2" /> : <FiSun className="mr-2" />}
              <div>
                <h3 className="font-medium">Tema</h3>
                <p className="text-sm text-light-darker">
                  {tempSettings.isDarkMode ? 'Modo escuro ativo' : 'Modo claro ativo'}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleThemeToggle}
              className={`
                relative w-14 h-8 rounded-full p-1 transition-colors duration-300
                ${tempSettings.isDarkMode ? 'bg-dark-medium' : 'bg-gray-400'}
              `}
            >
              <motion.div
                className={`
                  w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-300
                  ${tempSettings.isDarkMode ? 'bg-primary text-white' : 'bg-yellow-400 text-gray-800'}
                `}
                animate={{
                  x: tempSettings.isDarkMode ? 24 : 0
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30
                }}
              >
                {tempSettings.isDarkMode ? (
                  <FiMoon size={14} />
                ) : (
                  <FiSun size={14} />
                )}
              </motion.div>
            </motion.button>
          </div>

          {/* Accent Color */}
          <div className="mb-6">
            <h3 className="font-medium mb-3">Cor de Destaque</h3>
            <div className="grid grid-cols-4 gap-3">
              {accentColors.map((color) => (
                <motion.button
                  key={color.value}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleColorChange(color.value)}
                  className={`
                    w-12 h-12 rounded-full border-2 transition-all
                    ${tempSettings.accentColor === color.value ? 'border-white scale-110' : 'border-transparent'}
                  `}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <h3 className="font-medium mb-3">Tamanho da Fonte</h3>
            <div className="grid grid-cols-3 gap-3">
              {fontSizes.map((size) => (
                <motion.button
                  key={size.value}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleFontSizeChange(size.value)}
                  className={`
                    p-3 rounded-lg text-center transition-all
                    ${tempSettings.fontSize === size.value 
                      ? 'bg-primary text-white' 
                      : 'bg-dark-light hover:bg-dark-medium'
                    }
                  `}
                >
                  {size.name}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center mb-4">
            <FiVolume2 className="text-secondary mr-2" size={24} />
            <h2 className="text-xl font-bold">Notificações</h2>
          </div>

          {/* Sound */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FiVolume2 className="mr-2" />
              <div>
                <h3 className="font-medium">Sons</h3>
                <p className="text-sm text-light-darker">Alertas sonoros durante treinos</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={testSound}
                className="px-3 py-1 bg-dark-medium hover:bg-dark-light rounded text-sm"
              >
                Testar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSoundToggle}
                className={`
                  w-12 h-6 rounded-full p-1 transition-colors
                  ${tempSettings.soundEnabled ? 'bg-primary' : 'bg-dark-medium'}
                `}
              >
                <div
                  className={`
                    w-4 h-4 rounded-full bg-white transition-transform
                    ${tempSettings.soundEnabled ? 'translate-x-6' : 'translate-x-0'}
                  `}
                />
              </motion.button>
            </div>
          </div>

          {/* Vibration */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiBell className="mr-2" />
              <div>
                <h3 className="font-medium">Vibração</h3>
                <p className="text-sm text-light-darker">
                  Feedback tátil nos alertas
                  {/iPad|iPhone|iPod/.test(navigator.userAgent) && (
                    <span className="block text-xs text-yellow-500 mt-1">
                      ⚠️ iOS: Funciona apenas durante interações ativas
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={testVibration}
                className="px-3 py-1 bg-dark-medium hover:bg-dark-light rounded text-sm"
              >
                Testar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleVibrationToggle}
                className={`
                  w-12 h-6 rounded-full p-1 transition-colors
                  ${tempSettings.vibrationEnabled ? 'bg-primary' : 'bg-dark-medium'}
                `}
              >
                <div
                  className={`
                    w-4 h-4 rounded-full bg-white transition-transform
                    ${tempSettings.vibrationEnabled ? 'translate-x-6' : 'translate-x-0'}
                  `}
                />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Workout Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center mb-4">
            <FiSmartphone className="text-primary mr-2" size={24} />
            <h2 className="text-xl font-bold">Treino</h2>
          </div>

          {/* Auto Lock */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Manter Tela Ligada</h3>
              <p className="text-sm text-light-darker">Evita que a tela desligue durante treinos</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleKeepScreenOnToggle}
              className={`
                w-12 h-6 rounded-full p-1 transition-colors
                ${tempSettings.keepScreenOn ? 'bg-primary' : 'bg-dark-medium'}
              `}
            >
              <div
                className={`
                  w-4 h-4 rounded-full bg-white transition-transform
                  ${tempSettings.keepScreenOn ? 'translate-x-6' : 'translate-x-0'}
                `}
              />
            </motion.button>
          </div>
        </motion.div>

        {/* Save Button */}
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-6 left-4 right-4 z-50"
          >
            <div className="bg-dark-lighter rounded-xl p-4 shadow-3d border border-primary">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiSettings className="text-primary mr-2" size={20} />
                  <div>
                    <h3 className="font-medium">Configurações Alteradas</h3>
                    <p className="text-xs text-light-darker">Salve para manter as mudanças</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleResetSettings}
                    className="px-4 py-2 bg-dark-medium hover:bg-dark-light rounded-lg text-sm"
                  >
                    Descartar
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium flex items-center disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <FiSave className="mr-2" size={16} />
                        Salvar
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* About */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="card text-center"
        >
          <h2 className="text-xl font-bold mb-2">Treinano</h2>
          <p className="text-light-darker mb-4">Seu parceiro de treino</p>
          <p className="text-sm text-light-darker">Versão 1.0.0</p>
          
          {/* Status das configurações */}
          <div className="mt-4 pt-4 border-t border-dark-medium">
            <div className="flex items-center justify-center text-xs text-light-darker">
              <FiCheck className="mr-1" size={12} />
              <span>Configurações {hasChanges ? 'não salvas' : 'salvas'}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;