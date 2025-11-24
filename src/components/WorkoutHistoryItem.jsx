import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiClock, FiEdit2, FiTrash2, FiX, FiCheck } from 'react-icons/fi';
import { GiWeightLiftingUp } from 'react-icons/gi';
import { toast } from 'react-toastify';
import { useWorkoutStore } from '../stores/workoutStore';

const WorkoutHistoryItem = ({ workout, userId }) => {
  const { deleteWorkout, updateWorkout } = useWorkoutStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedExercises, setEditedExercises] = useState(workout.exercises || []);
  
  // Format date and time
  const date = new Date(workout.start_time);
  const formattedDate = date.toLocaleDateString('pt-BR');
  const formattedTime = date.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  // Format duration
  const minutes = Math.floor((workout.duration || 0) / 60);
  const seconds = (workout.duration || 0) % 60;
  const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  // Count exercises
  const exerciseCount = workout.exercises?.length || 0;

  const handleDelete = async () => {
    try {
      await deleteWorkout(userId, workout.id);
      toast.success('Treino excluído com sucesso');
      setShowDeleteModal(false);
    } catch (error) {
      toast.error('Erro ao excluir treino');
    }
  };

  const handleUpdate = async () => {
    try {
      await updateWorkout(userId, workout.id, {
        ...workout,
        exercises: editedExercises,
      });
      toast.success('Treino atualizado com sucesso');
      setShowEditModal(false);
    } catch (error) {
      toast.error('Erro ao atualizar treino');
    }
  };

  const handleExerciseChange = (exerciseIndex, field, value) => {
    const updatedExercises = [...editedExercises];
    updatedExercises[exerciseIndex] = {
      ...updatedExercises[exerciseIndex],
      [field]: value,
    };
    setEditedExercises(updatedExercises);
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="card relative group"
      >
        {/* Workout Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-dark-medium flex items-center justify-center mr-3">
              <FiCalendar className="text-primary" size={18} />
            </div>
            <div>
              <h3 className="font-medium">Treino em {formattedDate}</h3>
              <p className="text-sm text-light-darker">
                {formattedTime} • {formattedDuration} • {exerciseCount} exercícios
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowEditModal(true)}
              className="p-2 rounded-full bg-dark-medium hover:bg-dark-light transition-colors"
            >
              <FiEdit2 className="text-primary" size={16} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowDeleteModal(true)}
              className="p-2 rounded-full bg-dark-medium hover:bg-dark-light transition-colors"
            >
              <FiTrash2 className="text-red-500" size={16} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-lighter rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">Excluir Treino</h2>
              <p className="mb-6">
                Tem certeza que deseja excluir este treino? Esta ação não pode ser desfeita.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2 px-4 bg-dark-medium text-light rounded-lg"
                >
                  Cancelar
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Excluir
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-lighter rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Editar Treino</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-dark-medium rounded-full transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Workout Details */}
                <div className="bg-dark-light p-4 rounded-lg">
                  <div className="flex items-center space-x-4 mb-4">
                    <FiCalendar className="text-primary" size={20} />
                    <span>{formattedDate} às {formattedTime}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <FiClock className="text-primary" size={20} />
                    <span>Duração: {formattedDuration}</span>
                  </div>
                </div>

                {/* Exercises List */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg">Exercícios</h3>
                  {editedExercises.map((exercise, index) => (
                    <div key={exercise.id} className="bg-dark-light p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{exercise.exerciseData.exercise.name}</h4>
                        <div className="flex items-center space-x-2">
                          <GiWeightLiftingUp className="text-primary" />
                          <input
                            type="number"
                            value={exercise.sets[0].weight}
                            onChange={(e) => handleExerciseChange(index, 'weight', parseFloat(e.target.value))}
                            className="w-20 bg-dark-medium px-2 py-1 rounded"
                          />
                          <span>kg</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {exercise.sets.map((set, setIndex) => (
                          <div key={setIndex} className="flex items-center space-x-2 bg-dark-medium p-2 rounded">
                            <span className="text-sm">Série {setIndex + 1}</span>
                            <input
                              type="number"
                              value={set.reps}
                              onChange={(e) => {
                                const newSets = [...exercise.sets];
                                newSets[setIndex].reps = parseInt(e.target.value);
                                handleExerciseChange(index, 'sets', newSets);
                              }}
                              className="w-16 bg-dark-light px-2 py-1 rounded"
                            />
                            <span className="text-sm">reps</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-2 px-4 bg-dark-medium text-light rounded-lg"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleUpdate}
                    className="flex-1 btn-primary"
                  >
                    <FiCheck className="mr-2" />
                    Salvar Alterações
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WorkoutHistoryItem;