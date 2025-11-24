import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLink, FiPlus, FiX, FiZap } from 'react-icons/fi';
import { GiWeightLiftingUp } from 'react-icons/gi';
import { toast } from 'react-toastify';

const SupersetManager = ({ exercises = [], onCreateSuperset, onRemoveSuperset }) => {
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [supersets, setSupersets] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [supersetName, setSupersetName] = useState('');

  const handleSelectExercise = (exercise) => {
    setSelectedExercises(prev => {
      const isSelected = prev.find(e => e.id === exercise.id);
      if (isSelected) {
        return prev.filter(e => e.id !== exercise.id);
      } else {
        if (prev.length >= 4) {
          toast.warning('Máximo 4 exercícios por superset');
          return prev;
        }
        return [...prev, exercise];
      }
    });
  };

  const createSuperset = () => {
    if (selectedExercises.length < 2) {
      toast.error('Selecione pelo menos 2 exercícios');
      return;
    }

    const newSuperset = {
      id: `superset-${Date.now()}`,
      name: supersetName || `Superset ${supersets.length + 1}`,
      exercises: selectedExercises,
      type: selectedExercises.length === 2 ? 'superset' : 'circuit',
      restBetweenExercises: 10, // segundos
      restBetweenRounds: 90 // segundos
    };

    setSupersets(prev => [...prev, newSuperset]);
    setSelectedExercises([]);
    setSupersetName('');
    setShowCreateModal(false);
    
    if (onCreateSuperset) {
      onCreateSuperset(newSuperset);
    }

    toast.success(`${newSuperset.type === 'superset' ? 'Superset' : 'Circuito'} criado!`);
  };

  const removeSuperset = (supersetId) => {
    setSupersets(prev => prev.filter(s => s.id !== supersetId));
    
    if (onRemoveSuperset) {
      onRemoveSuperset(supersetId);
    }
    
    toast.info('Superset removido');
  };

  const SupersetCard = ({ superset }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card border-l-4 border-secondary"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-secondary bg-opacity-20 flex items-center justify-center mr-3">
            <FiZap className="text-secondary" size={20} />
          </div>
          <div>
            <h3 className="font-bold">{superset.name}</h3>
            <p className="text-sm text-light-darker">
              {superset.type === 'superset' ? 'Superset' : 'Circuito'} • {superset.exercises.length} exercícios
            </p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => removeSuperset(superset.id)}
          className="p-2 rounded-full bg-dark-medium hover:bg-red-600 transition-colors"
        >
          <FiX className="text-red-500" size={16} />
        </motion.button>
      </div>

      <div className="space-y-2">
        {superset.exercises.map((exercise, index) => (
          <div key={exercise.id} className="flex items-center bg-dark-light p-3 rounded-lg">
            <div className="w-6 h-6 rounded-full bg-secondary text-white text-xs flex items-center justify-center mr-3">
              {index + 1}
            </div>
            
            {exercise.exercise.image_url && (
              <img 
                src={exercise.exercise.image_url} 
                alt={exercise.exercise.name}
                className="w-10 h-10 object-cover rounded mr-3"
              />
            )}
            
            <div className="flex-1">
              <h4 className="font-medium">{exercise.exercise.name}</h4>
              <p className="text-xs text-light-darker">
                {exercise.current_weight} {exercise.weight_unit || 'lbs'} • {exercise.current_sets}x{exercise.current_reps}
              </p>
            </div>
            
            {index < superset.exercises.length - 1 && (
              <div className="text-secondary">
                <FiLink size={16} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="bg-dark-light p-2 rounded text-center">
          <div className="text-light-darker">Entre exercícios</div>
          <div className="font-bold">{superset.restBetweenExercises}s</div>
        </div>
        <div className="bg-dark-light p-2 rounded text-center">
          <div className="text-light-darker">Entre rounds</div>
          <div className="font-bold">{Math.floor(superset.restBetweenRounds / 60)}:{(superset.restBetweenRounds % 60).toString().padStart(2, '0')}</div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FiLink className="text-secondary mr-2" size={24} />
          <div>
            <h2 className="text-xl font-bold">Supersets & Circuitos</h2>
            <p className="text-sm text-light-darker">Combine exercícios para treinos mais intensos</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="btn-secondary flex items-center"
        >
          <FiPlus className="mr-2" />
          Criar Superset
        </motion.button>
      </div>

      {/* Existing Supersets */}
      {supersets.length > 0 && (
        <div className="space-y-4 mb-6">
          {supersets.map(superset => (
            <SupersetCard key={superset.id} superset={superset} />
          ))}
        </div>
      )}

      {/* Create Superset Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-lighter rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Criar Superset/Circuito</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-dark-medium rounded-full transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Superset Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-light-darker mb-2">
                  Nome do Superset (opcional)
                </label>
                <input
                  type="text"
                  value={supersetName}
                  onChange={(e) => setSupersetName(e.target.value)}
                  className="input-field"
                  placeholder="Ex: Superset de Peito"
                />
              </div>

              {/* Selected Exercises */}
              {selectedExercises.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold mb-3">Exercícios Selecionados ({selectedExercises.length})</h3>
                  <div className="space-y-2">
                    {selectedExercises.map((exercise, index) => (
                      <motion.div
                        key={exercise.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center bg-dark-light p-3 rounded-lg"
                      >
                        <div className="w-6 h-6 rounded-full bg-secondary text-white text-xs flex items-center justify-center mr-3">
                          {index + 1}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-medium">{exercise.exercise.name}</h4>
                          <p className="text-xs text-light-darker">
                            {exercise.exercise.category} • {exercise.current_weight} {exercise.weight_unit || 'lbs'}
                          </p>
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleSelectExercise(exercise)}
                          className="p-1 rounded-full bg-dark-medium hover:bg-red-600 transition-colors"
                        >
                          <FiX className="text-red-500" size={14} />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Exercises */}
              <div className="mb-6">
                <h3 className="font-bold mb-3">Exercícios Disponíveis</h3>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                  {exercises.filter(ex => !selectedExercises.find(sel => sel.id === ex.id)).map(exercise => (
                    <motion.button
                      key={exercise.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectExercise(exercise)}
                      className="flex items-center p-3 bg-dark-medium hover:bg-dark-light rounded-lg transition-colors text-left"
                    >
                      {exercise.exercise.image_url && (
                        <img 
                          src={exercise.exercise.image_url} 
                          alt={exercise.exercise.name}
                          className="w-10 h-10 object-cover rounded mr-3"
                        />
                      )}
                      
                      <div className="flex-1">
                        <h4 className="font-medium">{exercise.exercise.name}</h4>
                        <p className="text-xs text-light-darker">
                          {exercise.exercise.category} • {exercise.current_weight} {exercise.weight_unit || 'lbs'}
                        </p>
                      </div>
                      
                      <FiPlus className="text-primary" size={16} />
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="bg-dark-light p-4 rounded-lg mb-6">
                <h4 className="font-medium mb-2">💡 Dicas:</h4>
                <ul className="text-sm text-light-darker space-y-1">
                  <li>• <strong>Superset (2 exercícios):</strong> Execute um após o outro sem descanso</li>
                  <li>• <strong>Circuito (3+ exercícios):</strong> Execute todos em sequência</li>
                  <li>• Combine exercícios de grupos musculares diferentes para melhor resultado</li>
                  <li>• Evite exercícios que usem os mesmos músculos em sequência</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 px-4 bg-dark-medium text-light rounded-lg"
                >
                  Cancelar
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={createSuperset}
                  disabled={selectedExercises.length < 2}
                  className="flex-1 btn-secondary disabled:opacity-50"
                >
                  Criar {selectedExercises.length === 2 ? 'Superset' : 'Circuito'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {supersets.length === 0 && !showCreateModal && (
        <div className="card text-center py-8">
          <FiLink className="text-light-darker mx-auto mb-4" size={48} />
          <p className="text-light-darker">Nenhum superset criado ainda</p>
          <p className="text-sm text-light-darker mt-2">
            Combine exercícios para treinos mais intensos e eficientes
          </p>
        </div>
      )}
    </div>
  );
};

export default SupersetManager;