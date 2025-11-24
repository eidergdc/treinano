import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiTrendingUp } from 'react-icons/fi';
import Confetti from 'react-confetti';

const LevelUpModal = ({ level, onClose }) => {
  useEffect(() => {
    // Fechar automaticamente após 5 segundos
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <Confetti recycle={false} numberOfPieces={300} />
      
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          transition: { 
            type: "spring",
            stiffness: 300,
            damping: 20
          }
        }}
        exit={{ scale: 0.5, opacity: 0 }}
        className="bg-dark-lighter rounded-xl p-8 w-full max-w-md text-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Efeitos de fundo */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0.1 }}
            animate={{ 
              opacity: [0.1, 0.2, 0.1],
              transition: { duration: 3, repeat: Infinity }
            }}
            className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-primary opacity-10"
          />
          <motion.div
            initial={{ opacity: 0.1 }}
            animate={{ 
              opacity: [0.1, 0.2, 0.1],
              transition: { duration: 4, repeat: Infinity, delay: 1 }
            }}
            className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-secondary opacity-10"
          />
        </div>
        
        <motion.div
          initial={{ y: -20 }}
          animate={{ 
            y: [0, -10, 0],
            transition: { duration: 2, repeat: Infinity }
          }}
          className="mb-6"
        >
          <div className="w-24 h-24 rounded-full bg-primary mx-auto flex items-center justify-center">
            <FiAward className="text-white" size={48} />
          </div>
        </motion.div>
        
        <motion.h2
          initial={{ scale: 0.9 }}
          animate={{ 
            scale: [1, 1.05, 1],
            transition: { duration: 2, repeat: Infinity }
          }}
          className="text-3xl font-bold mb-2 neon-text"
        >
          NÍVEL {level}
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.5 } }}
          className="text-light-darker mb-6"
        >
          Parabéns! Você alcançou um novo nível!
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.8 } }}
          className="bg-dark-light p-4 rounded-lg mb-6"
        >
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <FiTrendingUp className="text-primary mr-2" />
              <span>Força +{level}</span>
            </div>
            <div className="flex items-center">
              <FiAward className="text-secondary mr-2" />
              <span>Resistência +{level}</span>
            </div>
          </div>
        </motion.div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="btn-primary w-full"
        >
          Continuar
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default LevelUpModal;