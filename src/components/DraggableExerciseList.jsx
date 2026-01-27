import React from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiPlay, FiEdit2 } from 'react-icons/fi';
import { GiWeightLiftingUp } from 'react-icons/gi';
import ProgressBar from './ProgressBar';

const ExerciseList = ({ exercises, onCompleteSet, onShowMedia, currentExerciseIndex, onSetCurrentExercise, onEditExercise }) => {
  // Função para determinar a cor baseada nas repetições
  const getRepColorClass = (reps, isCompleted, isCurrentExercise) => {
    if (isCompleted) {
      // Cores para séries completadas
      if (reps >= 12) return 'bg-emerald-500 text-white border-emerald-600';
      if (reps >= 10) return 'bg-blue-500 text-white border-blue-600';
      if (reps >= 8) return 'bg-amber-500 text-white border-amber-600';
      return 'bg-primary text-white border-primary';
    }

    if (isCurrentExercise) {
      // Cores para exercício atual (não completado)
      if (reps >= 12) return 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500';
      if (reps >= 10) return 'bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white border border-blue-500';
      if (reps >= 8) return 'bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-white border border-amber-500';
      return 'bg-secondary bg-opacity-20 text-secondary hover:bg-secondary hover:text-white border border-secondary';
    }

    // Cores para exercícios não iniciados
    return 'bg-dark-light text-light-darker hover:bg-dark-medium';
  };

  // Função para determinar a cor do badge de peso baseada nas repetições
  const getWeightBadgeColorClass = (reps, isCurrentExercise) => {
    if (isCurrentExercise) {
      if (reps >= 12) return 'bg-emerald-500 text-white';
      if (reps >= 10) return 'bg-blue-500 text-white';
      if (reps >= 8) return 'bg-amber-500 text-white';
    }

    if (reps >= 12) return 'bg-emerald-500 bg-opacity-20 text-emerald-400';
    if (reps >= 10) return 'bg-blue-500 bg-opacity-20 text-blue-400';
    if (reps >= 8) return 'bg-amber-500 bg-opacity-20 text-amber-400';
    return 'bg-primary bg-opacity-20 text-primary';
  };

  return (
    <div className="space-y-4">
      {exercises.map((workoutExercise, exerciseIndex) => {
        const isCurrentExercise = currentExerciseIndex === exerciseIndex;
        const exerciseData = workoutExercise.exerciseData;

        // Normalizar campos para compatibilidade
        // Usar os dados reais das séries ao invés do exerciseData para mostrar valores atuais
        const currentWeight = workoutExercise.sets[0]?.weight || exerciseData.currentWeight || exerciseData.current_weight || 0;
        const weightUnit = exerciseData.weightUnit || exerciseData.weight_unit || 'lbs';
        const currentSets = workoutExercise.sets.length;
        const currentReps = workoutExercise.sets[0]?.reps || exerciseData.currentReps || exerciseData.current_reps || 8;
        
        return (
          <motion.div
            key={workoutExercise.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * exerciseIndex }}
            className={`card relative transition-all duration-300 ${
              isCurrentExercise 
                ? 'ring-2 ring-primary bg-gradient-to-r from-primary/10 to-secondary/10 shadow-lg' 
                : 'hover:shadow-lg'
            }`}
          >
            {/* Exercise Order Number & Edit Button */}
            <div className="absolute top-2 right-2 flex items-center space-x-2">
              {onEditExercise && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onEditExercise(exerciseIndex)}
                  className="p-2 bg-secondary hover:bg-secondary-dark rounded-full transition-colors"
                  title="Editar exercício"
                >
                  <FiEdit2 className="text-white" size={14} />
                </motion.button>
              )}
              <div className="w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">
                {exerciseIndex + 1}
              </div>
            </div>

            {/* Current Exercise Indicator */}
            {isCurrentExercise && (
              <div className="absolute top-2 left-2 flex items-center bg-primary text-white px-2 py-1 rounded-full text-xs font-bold">
                <FiPlay className="mr-1" size={12} />
                ATUAL
              </div>
            )}

            {/* Set Current Exercise Button */}
            {!isCurrentExercise && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onSetCurrentExercise(exerciseIndex)}
                className="absolute top-2 left-2 p-2 bg-dark-medium hover:bg-primary rounded-full transition-colors"
                title="Marcar como exercício atual"
              >
                <FiPlay className="text-light-darker hover:text-white" size={16} />
              </motion.button>
            )}

            <div className="mt-8">
              <div className="flex items-center mb-4">
                {exerciseData.exercise.image_url ? (
                  <motion.img 
                    src={exerciseData.exercise.image_url} 
                    alt={exerciseData.exercise.name}
                    className="w-24 h-24 object-cover rounded-lg mr-4 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    onClick={() => onShowMedia && onShowMedia(exerciseData.exercise)}
                  />
                ) : (
                  <div className="w-24 h-24 bg-dark-medium rounded-lg mr-4 flex items-center justify-center">
                    <GiWeightLiftingUp className="text-primary" size={32} />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className={`text-lg font-bold ${isCurrentExercise ? 'text-primary' : ''}`}>
                    {exerciseData.exercise.name}
                  </h3>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`px-3 py-1 rounded-full ${getWeightBadgeColorClass(currentReps, isCurrentExercise)}`}>
                      <span className="font-bold text-lg">
                        {currentWeight}
                      </span>
                      <span className="font-medium text-sm ml-1">
                        {weightUnit}
                      </span>
                    </div>
                    <div className={`font-medium px-2 py-1 rounded ${
                      currentReps >= 12
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : currentReps >= 10
                        ? 'bg-blue-500/20 text-blue-400'
                        : currentReps >= 8
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'text-secondary'
                    }`}>
                      {currentSets}x{currentReps}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-light-darker mb-2">
                    <span>
                      {workoutExercise.sets.filter(set => set.completed).length} de {workoutExercise.sets.length} séries
                    </span>
                    {/* Indicador se o exercício será contado como concluído */}
                    {workoutExercise.sets.filter(set => set.completed).length === workoutExercise.sets.length ? (
                      <span className="text-green-500 font-medium">✅ Concluído</span>
                    ) : workoutExercise.sets.some(set => set.completed) ? (
                      <span className="text-yellow-500 font-medium">⚠️ Incompleto</span>
                    ) : (
                      <span className="text-light-darker">Não iniciado</span>
                    )}
                  </div>
                  <ProgressBar 
                    value={workoutExercise.sets.filter(set => set.completed).length} 
                    max={workoutExercise.sets.length} 
                    showLabel={false}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {workoutExercise.sets.map((set, setIndex) => (
                  <motion.button
                    key={setIndex}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onCompleteSet(exerciseIndex, setIndex)}
                    disabled={set.completed}
                    className={`p-3 rounded-lg flex flex-col items-center justify-center transition-all ${
                      getRepColorClass(set.reps, set.completed, isCurrentExercise)
                    }`}
                  >
                    <span className="text-sm">Série {setIndex + 1}</span>
                    <span className="font-bold">{set.reps} reps</span>
                    {set.completed && <FiCheck className="mt-1" />}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ExerciseList;