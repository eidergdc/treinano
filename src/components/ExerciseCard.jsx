import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronRight, FiBarChart2, FiVideo, FiTrash2 } from 'react-icons/fi';
import ProgressBar from './ProgressBar';

const ExerciseCard = ({ exercise, showProgress = true, onMediaClick, showDeleteButton = false, onDelete }) => {
  if (!exercise) return null;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Get the exercise data depending on whether it's a user exercise or regular exercise
  const exerciseData = exercise.exercise || exercise;
  const exerciseStats = exercise.exercise ? exercise : null;
  
  if (!exerciseData) return null;
  
  // Calculate progress based on level and completed workouts
  const getProgressInfo = () => {
    if (!exerciseStats) return { progressText: '', progressPercentage: 0 };
    
    const { 
      progressLevel = 0, 
      completedWorkouts = 0,
      current_sets,
      current_reps,
      currentSets,
      currentReps
    } = exerciseStats;
    
    // Usar os valores reais configurados pelo usuário
    const actualSets = current_sets || currentSets || 3;
    const actualReps = current_reps || currentReps || 8;
    const progressText = `${actualSets}x${actualReps}`;
    
    let progressPercentage = 0;
    
    // Calcular porcentagem baseada nos treinos completados
    progressPercentage = (completedWorkouts / 10) * 100;
    
    return { progressText, progressPercentage };
  };
  
  const { progressText, progressPercentage } = getProgressInfo();

  // Use the correct ID for navigation (user exercise ID if available)
  const linkId = exercise.id || exerciseData.id;

  const handleClick = (e) => {
    // Se tiver vídeo e onMediaClick for fornecido, abrir o modal
    if (exerciseData.video_url && onMediaClick) {
      e.preventDefault();
      onMediaClick(exerciseData);
    }
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(exercise.id);
    }
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <>
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card overflow-hidden"
    >
      <Link to={`/exercises/${linkId}`} className="block" onClick={handleClick}>
        <div className="flex items-center">
          <div className="relative">
            {exerciseData.image_url ? (
              <img 
                src={exerciseData.image_url} 
                alt={exerciseData.name} 
                className="w-16 h-16 object-cover rounded-lg mr-4"
              />
            ) : (
              <div className="w-16 h-16 bg-dark-medium rounded-lg mr-4 flex items-center justify-center">
                <FiBarChart2 className="text-primary" size={24} />
              </div>
            )}
            {exerciseData.video_url && (
              <div className="absolute top-1 right-5 bg-primary rounded-full p-1">
                <FiVideo className="text-white" size={12} />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-lg">{exerciseData.name}</h3>
            <p className="text-light-darker text-sm truncate">
              {exerciseData.description || 'Sem descrição'}
            </p>
            
            {showProgress && exerciseStats && (
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-secondary font-medium">{progressText}</span>
                  <span className="text-light-darker">
                    {exerciseStats.completedWorkouts || 0}/10 treinos
                  </span>
                </div>
                <ProgressBar 
                  value={exerciseStats.completedWorkouts || 0} 
                  max={10} 
                  showLabel={false}
                />
                
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-light-darker">
                    {exerciseStats.currentWeight || exerciseStats.current_weight || 0} {exerciseStats.weightUnit || exerciseStats.weight_unit || 'lbs'}
                  </span>
                  <span className="text-light-darker">
                    {Math.round(((exerciseStats.completedWorkouts || 0) / 10) * 100)}% completo
                  </span>
                </div>
                
                {/* Mostrar quando foi atualizado pela última vez */}
                {exerciseStats.updatedAt && (
                  <p className="text-xs text-light-darker mt-1">
                    Última atualização: {(() => {
                      const date = exerciseStats.updatedAt?.toDate?.() || new Date(exerciseStats.updatedAt);
                      const now = new Date();
                      const diffTime = Math.abs(now - date);
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      
                      if (diffDays === 1) {
                        return 'Hoje';
                      } else if (diffDays === 2) {
                        return 'Ontem';
                      } else if (diffDays <= 7) {
                        return `${diffDays - 1} dias atrás`;
                      } else {
                        return date.toLocaleDateString('pt-BR');
                      }
                    })()}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {showDeleteButton && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDeleteClick}
                className="p-2 bg-red-600 bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
              >
                <FiTrash2 size={18} className="text-red-500" />
              </motion.button>
            )}
            <FiChevronRight size={20} className="text-light-darker ml-2" />
          </div>
        </div>
      </Link>
    </motion.div>

    <AnimatePresence>
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleCancelDelete}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-dark-lighter rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Excluir Exercício</h2>

            <p className="mb-6 text-light-darker">
              Tem certeza que deseja excluir o exercício <span className="font-bold text-light">{exerciseData.name}</span>? Esta ação não pode ser desfeita e todo o histórico deste exercício será perdido.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 py-2 px-4 bg-dark-medium text-light rounded-lg"
              >
                Cancelar
              </button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
              >
                Excluir
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};

export default ExerciseCard;