import React from 'react';
import { motion } from 'framer-motion';

const WeightInput = ({ value, onChange, unit = 'lbs', onUnitChange }) => {
  // Convert between kg and lbs
  const handleValueChange = (newValue) => {
    const numValue = parseFloat(newValue);
    if (isNaN(numValue)) {
      onChange('');
      return;
    }
    
    onChange(newValue);
  };

  const handleUnitToggle = () => {
    const newUnit = unit === 'kg' ? 'lbs' : 'kg';
    if (value) {
      // Convert value when changing units
      const numValue = parseFloat(value);
      const convertedValue = newUnit === 'kg' 
        ? (numValue * 0.453592).toFixed(1) // lbs to kg
        : (numValue * 2.20462).toFixed(1); // kg to lbs
      onChange(convertedValue);
    }
    onUnitChange(newUnit);
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        type="number"
        value={value}
        onChange={(e) => handleValueChange(e.target.value)}
        step="0.5"
        min="0"
        className="input-field flex-1"
        placeholder={`Ex: 10 ${unit}`}
      />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleUnitToggle}
        className="px-3 py-2 bg-dark-medium hover:bg-dark-light rounded-lg transition-colors"
      >
        {unit.toUpperCase()}
      </motion.button>
    </div>
  );
};

export default WeightInput;