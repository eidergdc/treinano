import React from 'react';
import { motion } from 'framer-motion';
import { FiAward } from 'react-icons/fi';

const AchievementNotification = ({ achievement, onClose }) => {
  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="fixed top-20 right-4 z-50 p-4 bg-dark-lighter rounded-lg shadow-3d border border-primary max-w-xs"
    >
      <div className="flex items-start">
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mr-3 flex-shrink-0">
          <FiAward className="text-white" size={24} />
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-lg">Conquista Desbloqueada!</h3>
          <p className="text-primary font-medium">{achievement.name}</p>
          <p className="text-sm text-light-darker mt-1">{achievement.description}</p>
          
          <div className="mt-2 text-sm">
            <span className="text-secondary">+{achievement.experience_reward} XP</span>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="ml-2 text-light-darker hover:text-light"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

export default AchievementNotification;