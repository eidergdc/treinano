import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiPlus, FiTarget, FiX } from 'react-icons/fi';
import { GiWeightLiftingUp } from 'react-icons/gi';
import { toast } from 'react-toastify';

const ProgressionSuggestionModal = ({ 
  exercise, 
  onAcceptSuggestion, 
  onDecline, 
  onClose 
}) => {
  const [selectedOption, setSelectedOption] = useState('weight');
  const [customWeight, setCustomWeight] = useState('');
  const [customReps, setCustomReps] = useState('');

  if (!exercise) return null;

  // Calcular sugestões baseadas no progresso atual
  const getCurrentLevel = () => {
    const level = exercise.progressLevel || 0;
    if (level === 0) return { current: '3x8', next: '3x10' };
    if (level === 1) return { current: '3x10', next: '3x12' };
    if (level === 2) return { current: '3x12', next: 'Aumento de peso' };
    return { current: '3x8', next: '3x10' };
  };

  const { current, next } = getCurrentLevel();
  const currentWeight = exercise.currentWeight || 0;
  const weightUnit = exercise.weightUnit || 'lbs';
  
  // Sugestões automáticas
  const suggestions = {
    weight: {
      title: 'Aumentar Peso',
      description: 'Voltar para 3x8 com mais peso',
      icon: GiWeightLiftingUp,
      color: '#FF4500',
      newWeight: currentWeight + (weightUnit === 'kg' ? 2.5 : 5),
      newReps: 8,
      newLevel: 0
    },
    reps: {
      title: 'Aumentar Repetições',
      description: next === 'Aumento de peso' ? 'Manter peso e aumentar repetições' : `Evoluir para ${next}`,
      icon: FiTarget,
      color: '#4A90E2',
      newWeight: currentWeight,
      newReps: exercise.progressLevel === 0 ? 10 : exercise.progressLevel === 1 ? 12 : 15,
      newLevel: exercise.progressLevel < 2 ? exercise.progressLevel + 1 : 2
    },
    custom: {
      title: 'Personalizado',
      description: 'Definir peso e repetições manualmente',
      icon: FiPlus,
      color: '#28A745',
      newWeight: parseFloat(customWeight) || currentWeight,
      newReps: parseInt(customReps) || 8,
      newLevel: 0
    }
  };

  const handleAccept = () => {
    const suggestion = suggestions[selectedOption];
    
    if (selectedOption === 'custom') {
      if (!customWeight || !customReps) {
        toast.error('Preencha peso e repetições para opção personalizada');
        return;
      }
      if (parseFloat(customWeight) <= 0 || parseInt(customReps) <= 0) {
        toast.error('Peso e repetições devem ser maiores que zero');
        return;
      }
    }

    const progressionData = {
      newWeight: suggestion.newWeight,
      newReps: suggestion.newReps,
      newLevel: suggestion.newLevel,
      resetProgress: true // Resetar para 0/10 treinos
    };

    onAcceptSuggestion(progressionData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-dark-lighter rounded-xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mr-3">
              <FiTrendingUp className="text-primary" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Parabéns! 🎉</h2>
              <p className="text-sm text-light-darker">Você completou 10 treinos!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-medium rounded-full transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Exercise Info */}
        <div className="bg-dark-light p-4 rounded-lg mb-6">
          <h3 className="font-bold text-lg">{exercise.exercise?.name}</h3>
          <p className="text-light-darker">
            Nível atual: {current} • {currentWeight} {weightUnit}
          </p>
          <div className="mt-2 text-sm text-green-500">
            ✅ 10/10 treinos completados!
          </div>
        </div>

        {/* Progression Options */}
        <div className="space-y-3 mb-6">
          {Object.entries(suggestions).map(([key, suggestion]) => {
            const IconComponent = suggestion.icon;
            
            return (
              <motion.button
                key={key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedOption(key)}
                className={`
                  w-full p-4 rounded-lg border-2 transition-all text-left
                  ${selectedOption === key 
                    ? 'border-primary bg-primary bg-opacity-10' 
                    : 'border-dark-medium bg-dark-light hover:bg-dark-medium'
                  }
                `}
              >
                <div className="flex items-center">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                    style={{ 
                      backgroundColor: `${suggestion.color}20`, 
                      color: suggestion.color 
                    }}
                  >
                    <IconComponent size={20} />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-bold">{suggestion.title}</h4>
                    <p className="text-sm text-light-darker">{suggestion.description}</p>
                    
                    {key !== 'custom' && (
                      <p className="text-xs mt-1" style={{ color: suggestion.color }}>
                        Novo: {suggestion.newWeight} {weightUnit} • 3x{suggestion.newReps}
                      </p>
                    )}
                  </div>
                  
                  <div className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center
                    ${selectedOption === key ? 'border-primary bg-primary' : 'border-dark-medium'}
                  `}>
                    {selectedOption === key && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Custom Options */}
        {selectedOption === 'custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-dark-light p-4 rounded-lg mb-6 space-y-3"
          >
            <div>
              <label className="block text-sm font-medium text-light-darker mb-1">
                Novo Peso
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={customWeight}
                  onChange={(e) => setCustomWeight(e.target.value)}
                  step="0.5"
                  min="0"
                  className="input-field flex-1"
                  placeholder={`Ex: ${currentWeight + (weightUnit === 'kg' ? 2.5 : 5)}`}
                />
                <div className="px-3 py-2 bg-dark-medium rounded-lg text-sm">
                  {weightUnit}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-light-darker mb-1">
                Novas Repetições
              </label>
              <input
                type="number"
                value={customReps}
                onChange={(e) => setCustomReps(e.target.value)}
                min="1"
                max="50"
                className="input-field"
                placeholder="Ex: 8"
              />
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onDecline}
            className="flex-1 py-3 px-4 bg-dark-medium text-light rounded-lg font-medium"
          >
            Manter Atual
          </button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAccept}
            className="flex-1 btn-primary py-3"
          >
            Aplicar Progressão
          </motion.button>
        </div>

        {/* Info */}
        <div className="mt-4 p-3 bg-dark-light rounded-lg">
          <p className="text-xs text-light-darker">
            💡 <strong>Dica:</strong> A progressão é fundamental para o crescimento muscular. 
            Aumente gradualmente o peso ou repetições para continuar evoluindo.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProgressionSuggestionModal;