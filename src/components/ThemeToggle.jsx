import React from 'react';
import { motion } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useThemeStore } from '../stores/themeStore';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useThemeStore();

  const handleToggle = () => {
    console.log('🎨 Alternando tema:', { antes: isDarkMode, depois: !isDarkMode });
    toggleTheme();
    
    // Verificar se foi salvo
    setTimeout(() => {
      const saved = localStorage.getItem('theme-storage');
      console.log('💾 Configurações salvas no localStorage:', saved);
    }, 100);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleToggle}
      className={`
        relative w-14 h-8 rounded-full p-1 transition-colors duration-300
        ${isDarkMode ? 'bg-dark-medium' : 'bg-gray-400'}
      `}
    >
      <motion.div
        className={`
          w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-300
          ${isDarkMode ? 'bg-primary text-white' : 'bg-yellow-400 text-gray-800'}
        `}
        animate={{
          x: isDarkMode ? 24 : 0
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
      >
        {isDarkMode ? (
          <FiMoon size={14} />
        ) : (
          <FiSun size={14} />
        )}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;