import { create } from 'zustand';

// Sistema de persistência manual mais robusto para iOS
const STORAGE_KEY = 'treinano-settings';

// Função para salvar no localStorage de forma segura
const saveToStorage = (data) => {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, serialized);
    console.log('✅ Configurações salvas no localStorage:', data);
    return true;
  } catch (error) {
    console.error('❌ Erro ao salvar no localStorage:', error);
    return false;
  }
};

// Função para carregar do localStorage de forma segura
const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('📱 Configurações carregadas do localStorage:', parsed);
      return parsed;
    }
  } catch (error) {
    console.error('❌ Erro ao carregar do localStorage:', error);
  }
  return null;
};

// Configurações padrão
const defaultSettings = {
  isDarkMode: true,
  accentColor: '#FF4500',
  fontSize: 'medium',
  soundEnabled: true,
  vibrationEnabled: true,
  keepScreenOn: false
};

export const useThemeStore = create((set, get) => ({
  // Estado inicial com valores padrão
  ...defaultSettings,
  
  // Flag para indicar se foi inicializado
  isInitialized: false,
  
  // Inicializar configurações
  initializeTheme: () => {
    console.log('🎨 === INICIALIZANDO TEMA ===');
    
    // Carregar configurações salvas
    const savedSettings = loadFromStorage();
    
    if (savedSettings) {
      console.log('📱 Aplicando configurações salvas:', savedSettings);
      
      // Aplicar configurações carregadas
      set({ 
        ...savedSettings,
        isInitialized: true 
      });
      
      // Aplicar tema ao DOM
      get().applyThemeToDOM(savedSettings);
    } else {
      console.log('🆕 Usando configurações padrão');
      set({ isInitialized: true });
      get().applyThemeToDOM(defaultSettings);
    }
  },
  
  // Aplicar tema ao DOM
  applyThemeToDOM: (settings) => {
    console.log('🎨 Aplicando tema ao DOM:', settings);
    
    // Aplicar tema ao body
    if (settings.isDarkMode) {
      document.body.className = 'bg-dark text-light';
    } else {
      document.body.className = 'bg-white text-gray-800';
    }
    
    // Aplicar cor de destaque
    document.documentElement.style.setProperty('--dynamic-accent-color', settings.accentColor);
    
    // Aplicar tamanho da fonte
    document.documentElement.setAttribute('data-font-size', settings.fontSize);
    
    // Atualizar cores do Tailwind dinamicamente
    const style = document.createElement('style');
    style.innerHTML = `
      :root {
        --tw-color-primary: ${settings.accentColor};
      }
      .bg-primary { background-color: ${settings.accentColor} !important; }
      .text-primary { color: ${settings.accentColor} !important; }
      .border-primary { border-color: ${settings.accentColor} !important; }
      .ring-primary { --tw-ring-color: ${settings.accentColor}; }
    `;
    
    // Remover estilo anterior se existir
    const oldStyle = document.getElementById('dynamic-accent-style');
    if (oldStyle) oldStyle.remove();
    
    style.id = 'dynamic-accent-style';
    document.head.appendChild(style);
    
    console.log('✅ Tema aplicado ao DOM com sucesso');
  },
  
  // Salvar todas as configurações
  saveSettings: async (newSettings) => {
    try {
      console.log('💾 === SALVANDO CONFIGURAÇÕES ===');
      console.log('📝 Novas configurações:', newSettings);
      
      // Aplicar configurações ao estado
      set(newSettings);
      
      // Aplicar ao DOM
      get().applyThemeToDOM(newSettings);
      
      // Salvar no localStorage
      const success = saveToStorage(newSettings);
      
      if (!success) {
        throw new Error('Falha ao salvar no localStorage');
      }
      
      // Verificar se foi salvo corretamente
      const verification = loadFromStorage();
      if (!verification || verification.accentColor !== newSettings.accentColor) {
        throw new Error('Verificação de salvamento falhou');
      }
      
      console.log('✅ Configurações salvas e verificadas com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error);
      throw error;
    }
  },
  
  // Métodos individuais (mantidos para compatibilidade)
  toggleTheme: () => {
    const newMode = !get().isDarkMode;
    const newSettings = { ...get(), isDarkMode: newMode };
    
    set({ isDarkMode: newMode });
    get().applyThemeToDOM(newSettings);
    saveToStorage(newSettings);
  },
  
  setAccentColor: (color) => {
    const newSettings = { ...get(), accentColor: color };
    
    set({ accentColor: color });
    get().applyThemeToDOM(newSettings);
    saveToStorage(newSettings);
  },
  
  setFontSize: (size) => {
    const newSettings = { ...get(), fontSize: size };
    
    set({ fontSize: size });
    get().applyThemeToDOM(newSettings);
    saveToStorage(newSettings);
  },
  
  setSoundEnabled: (enabled) => {
    const newSettings = { ...get(), soundEnabled: enabled };
    
    set({ soundEnabled: enabled });
    saveToStorage(newSettings);
  },
  
  setVibrationEnabled: (enabled) => {
    const newSettings = { ...get(), vibrationEnabled: enabled };
    
    set({ vibrationEnabled: enabled });
    saveToStorage(newSettings);
  },
  
  setKeepScreenOn: (enabled) => {
    const newSettings = { ...get(), keepScreenOn: enabled };
    
    set({ keepScreenOn: enabled });
    saveToStorage(newSettings);
  },
  
  // Resetar para configurações padrão
  resetToDefaults: () => {
    console.log('🔄 Resetando para configurações padrão');
    
    set(defaultSettings);
    get().applyThemeToDOM(defaultSettings);
    saveToStorage(defaultSettings);
  },
  
  // Verificar se há configurações salvas
  hasStoredSettings: () => {
    return loadFromStorage() !== null;
  }
}));