import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ value, max, showLabel = true, height = 'h-2', className = '' }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs text-light-darker mb-1">
          <span>{value} de {max}</span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className={`progress-bar ${height}`}>
        <motion.div
          className="progress-value"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;