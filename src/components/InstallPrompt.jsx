import React from 'react';
import { motion } from 'framer-motion';

const InstallPrompt = ({ onClose }) => {
  const handleInstall = () => {
    // Lógica para instalar o PWA
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      window.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('Usuário aceitou a instalação do A2HS');
        } else {
          console.log('Usuário recusou a instalação do A2HS');
        }
        window.deferredPrompt = null;
      });
    }
    onClose();
  };

  return (
    <motion.div
      className="fixed bottom-4 left-4 right-4 z-50 p-4 bg-background-paper rounded-lg shadow-lg border border-primary-DEFAULT"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-2">Instalar GymProgress</h3>
          <p className="text-text-secondary text-sm">
            Instale nosso app para uma experiência completa, mesmo offline!
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-background-elevated"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="mt-4 flex space-x-3">
        <button
          onClick={handleInstall}
          className="flex-1 py-2 px-4 bg-primary-DEFAULT text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
        >
          Instalar
        </button>
        <button
          onClick={onClose}
          className="py-2 px-4 bg-background-elevated rounded-lg hover:bg-background-DEFAULT transition-colors"
        >
          Agora não
        </button>
      </div>
    </motion.div>
  );
};

export default InstallPrompt;