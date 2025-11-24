import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(true); // Por padrão, modo escuro
  const [accentColor, setAccentColor] = useState('#FF5722'); // Cor de destaque padrão

  useEffect(() => {
    // Aplicar tema ao body
    document.body.classList.toggle('dark-theme', darkMode);
    
    // Definir variáveis CSS para cores de destaque
    document.documentElement.style.setProperty('--accent-color', accentColor);
  }, [darkMode, accentColor]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const changeAccentColor = (color) => {
    setAccentColor(color);
  };

  const value = {
    darkMode,
    accentColor,
    toggleDarkMode,
    changeAccentColor,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};