import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiSearch, FiCheck, FiX, FiMenu, FiPlay } from 'react-icons/fi';
import { GiWeightLiftingUp } from 'react-icons/gi';
import { toast } from 'react-toastify';
import { useFirebaseAuthStore } from '../stores/firebaseAuthStore';
import { useWorkoutStore } from '../stores/workoutStore';
import ExerciseCard from '../components/ExerciseCard';
import ExerciseList from '../components/DraggableExerciseList';
import WorkoutTemplates from '../components/WorkoutTemplates';
import SupersetManager from '../components/SupersetManager';
import WorkoutNotes from '../components/WorkoutNotes';
import Timer from '../components/Timer';
import ProgressBar from '../components/ProgressBar';
import ProgressionSuggestionModal from '../components/ProgressionSuggestionModal';

const Workout = () => {
  const navigate = useNavigate();
  const { user } = useFirebaseAuthStore();
  const { 
    fetchUserExercises,
    userExercises, 
    currentWorkout,
    selectedGroups,
    categories,
    timer,
    formatTimer,
    startWorkout,
    addExerciseToWorkout,
    completeSet,
    finishWorkout,
    cancelWorkout,
    reorderExercises,
    applyProgression,
    loading,
    restTimer,
    restTimeBetweenSets,
    restTimeBetweenExercises,
    isExerciseRest,
    startRestTimer,
    stopRestTimer
  } = useWorkoutStore();
  
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(!currentWorkout && selectedGroups.length === 0);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showSupersetsModal, setShowSupersetsModal] = useState(false);
  const [showProgressionModal, setShowProgressionModal] = useState(false);
  const [progressionExercise, setProgressionExercise] = useState(null);
  const [selectedGroupsTemp, setSelectedGroupsTemp] = useState([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [error, setError] = useState('');
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Estado local para exercícios filtrados
  const [filteredExercises, setFilteredExercises] = useState([]);
  
  useEffect(() => {
    if (!currentWorkout && selectedGroups.length === 0) {
      setShowGroupModal(true);
    }
  }, [currentWorkout, selectedGroups]);

  useEffect(() => {
    if (user?.uid && selectedGroups.length > 0) {
      console.log('Fetching exercises for groups:', selectedGroups);
      console.log('User ID:', user.uid);
      console.log('Selected groups:', selectedGroups);
      
      // Buscar todos os exercícios primeiro
      fetchUserExercises(user.uid);
    }
  }, [user?.uid, selectedGroups, fetchUserExercises]);

  // Filtrar exercícios quando userExercises ou selectedGroups mudam
  useEffect(() => {
    if (userExercises && selectedGroups.length > 0) {
      const filtered = userExercises.filter(exercise => 
        selectedGroups.includes(exercise.exercise.category)
      );
      setFilteredExercises(filtered);
      console.log('Filtered exercises for', selectedGroups, ':', filtered);
    }
  }, [userExercises, selectedGroups]);

  const handleToggleGroup = (category) => {
    setSelectedGroupsTemp(prev => {
      if (prev.includes(category)) {
        return prev.filter(group => group !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handleConfirmGroup = () => {
    if (selectedGroupsTemp.length === 0) {
      toast.error('Selecione pelo menos um grupo muscular');
      return;
    }
    console.log('Confirming groups selection:', selectedGroupsTemp);
    startWorkout(selectedGroupsTemp);
    setShowGroupModal(false);
    const groupsText = selectedGroupsTemp.length === 1 
      ? selectedGroupsTemp[0] 
      : `${selectedGroupsTemp.length} grupos`;
    toast.success(`Treino de ${groupsText} iniciado!`);
    setSelectedGroupsTemp([]);
  };

  const handleSelectTemplate = (template) => {
    setSelectedGroupsTemp(template.categories);
    setShowTemplatesModal(false);
    setShowGroupModal(true);
  };
  const handleSelectAllExercises = () => {
    const exercisesToAdd = availableExercises.filter(exercise => 
      !currentWorkout.exercises.some(e => e.userExerciseId === exercise.id)
    );
    
    exercisesToAdd.forEach(exercise => {
      addExerciseToWorkout(exercise.id, exercise);
    });
    
    if (exercisesToAdd.length > 0) {
      toast.success(`${exercisesToAdd.length} exercícios adicionados ao treino`);
    }
  };
  const handleAddExerciseToWorkout = (exercise) => {
    addExerciseToWorkout(exercise.id, exercise);
    toast.success(`${exercise.exercise.name} adicionado ao treino`);
  };

  const handleCompleteSet = (exerciseIndex, setIndex) => {
    completeSet(exerciseIndex, setIndex);
    
    // Auto-avançar para o próximo exercício se todas as séries foram completadas
    const exercise = currentWorkout.exercises[exerciseIndex];
    const allSetsCompleted = exercise.sets.every(set => set.completed);
    
    if (allSetsCompleted && exerciseIndex < currentWorkout.exercises.length - 1) {
      setCurrentExerciseIndex(exerciseIndex + 1);
    }
  };

  const handleSetCurrentExercise = (exerciseIndex) => {
    setCurrentExerciseIndex(exerciseIndex);
    toast.success(`Exercício ${exerciseIndex + 1} selecionado como atual`);
  };

  const handleShowMedia = (exercise) => {
    setSelectedExercise(exercise);
    setShowMediaModal(true);
  };

  const handleFinishWorkout = async () => {
    try {
      console.log('🎯 === INICIANDO HANDLEFINISHWORKOUT ===');
      console.log('🔍 Estado atual completo:', {
        currentWorkout: !!currentWorkout,
        exercisesLength: currentWorkout?.exercises?.length || 0,
        loading,
        user: !!user,
        showFinishModal,
        currentWorkoutData: currentWorkout
      });
      
      setError('');

      if (!currentWorkout?.exercises?.length) {
        console.error('❌ Nenhum exercício no treino');
        setError('Adicione pelo menos um exercício antes de finalizar o treino');
        return;
      }

      const hasCompletedSets = currentWorkout.exercises.some(exercise => 
        exercise.sets?.some(set => set.completed)
      );
      
      console.log('🔍 Verificação de séries completadas:', {
        hasCompletedSets,
        exercisesWithSets: currentWorkout.exercises.map(ex => ({
          name: ex.exerciseData?.exercise?.name,
          setsCount: ex.sets?.length,
          completedSets: ex.sets?.filter(s => s.completed).length
        }))
      });
      
      if (!hasCompletedSets) {
        console.error('❌ Nenhuma série completada');
        setError('Complete pelo menos uma série antes de finalizar o treino');
        return;
      }
      
      console.log('🛑 Parando timer de descanso...');
      stopRestTimer();
      
      console.log('💾 Chamando finishWorkout...');
      
      // Adicionar timeout para evitar travamento
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: Operação demorou mais de 30 segundos')), 30000);
      });
      
      const finishPromise = finishWorkout(user?.uid);
      
      const result = await Promise.race([finishPromise, timeoutPromise]);
      console.log('✅ finishWorkout retornou:', result);
      
      // Verificar se algum exercício atingiu 10 treinos e deve mostrar modal de progressão
      if (result && result.progressionSuggestions && result.progressionSuggestions.length > 0) {
        console.log('🎯 Exercícios que atingiram 10 treinos:', result.progressionSuggestions);
        
        // Mostrar modal para o primeiro exercício que atingiu 10 treinos
        const firstProgression = result.progressionSuggestions[0];
        setProgressionExercise(firstProgression);
        setShowProgressionModal(true);
      }
      
      setShowFinishModal(false);
      console.log('🎉 Treino finalizado com sucesso!');
      toast.success('Treino finalizado com sucesso!');
      
      // Só navegar se não houver modal de progressão para mostrar
      if (!result?.progressionSuggestions?.length) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('❌ === ERRO NO HANDLEFINISHWORKOUT ===');
      console.error('❌ Erro:', error);
      console.error('❌ Mensagem:', error.message);
      
      // Definir mensagem de erro mais específica
      let errorMessage = 'Erro ao finalizar treino';
      
      if (error.message?.includes('Timeout')) {
        errorMessage = 'A operação demorou muito para responder. Tente novamente.';
      } else if (error.message?.includes('Failed to fetch')) {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      } else if (error.message?.includes('permission')) {
        errorMessage = 'Erro de permissão. Faça login novamente.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      // Não fechar o modal em caso de erro para mostrar a mensagem
    }
  };

  const handleCancelWorkout = () => {
    // Stop rest timer before canceling workout
    stopRestTimer();
    cancelWorkout();
    setShowCancelModal(false);
    toast.info('Treino cancelado');
    navigate('/dashboard');
  };

  // Aceitar sugestão de progressão
  const handleAcceptProgression = async (progressionData) => {
    try {
      await applyProgression(progressionExercise.userExerciseId, progressionData);
      
      // Recarregar exercícios do usuário
      await fetchUserExercises(user.uid);
      
      setShowProgressionModal(false);
      setProgressionExercise(null);
      
      const weightText = progressionData.newWeight !== progressionExercise.currentWeight 
        ? ` • Peso: ${progressionData.newWeight} ${progressionExercise.weightUnit}`
        : '';
      
      toast.success(`🎯 Progressão aplicada! 3x${progressionData.newReps}${weightText}`);
      navigate('/dashboard');
    } catch (error) {
      toast.error('Erro ao aplicar progressão');
    }
  };

  // Recusar sugestão de progressão
  const handleDeclineProgression = () => {
    setShowProgressionModal(false);
    setProgressionExercise(null);
    toast.info('Progressão mantida. Continue treinando!');
    navigate('/dashboard');
  };

  const availableExercises = filteredExercises.filter(exercise => {
    if (!currentWorkout) return true;
    return !currentWorkout.exercises.some(e => e.userExerciseId === exercise.id);
  });

  console.log('🎯 === ESTADO ATUAL DO WORKOUT ===');
  console.log('Current state:', {
    selectedGroups,
    currentWorkout: !!currentWorkout,
    filteredExercisesCount: filteredExercises.length,
    availableExercisesCount: availableExercises.length,
    userExercisesTotal: userExercises.length,
    filteredExercisesList: filteredExercises.map(ex => ({ 
      name: ex.exercise.name, 
      category: ex.exercise.category 
    })),
    availableExercisesList: availableExercises.map(ex => ({ 
      name: ex.exercise.name, 
      category: ex.exercise.category 
    })),
    loading
  });
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold mb-1">Treino</h1>
        <p className="text-light-darker">
          {currentWorkout 
            ? `Treino de ${selectedGroups.length === 1 ? selectedGroups[0] : `${selectedGroups.length} grupos`} em andamento` 
            : 'Selecione grupos musculares para iniciar'}
        </p>
      </motion.div>

      {/* Timers Display */}
      {currentWorkout && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-6 flex gap-4"
        >
          <Timer time={formatTimer()} type="workout" />
          {restTimer !== null && (
            <Timer 
              time={formatTimer(restTimer)} 
              type="rest" 
              restTimeTotal={isExerciseRest ? restTimeBetweenExercises : restTimeBetweenSets}
              isExerciseRest={isExerciseRest}
            />
          )}
        </motion.div>
      )}

      {/* Group Selection Modal */}
      <AnimatePresence>
        {showGroupModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => navigate('/dashboard')}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-lighter rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">Selecione os Grupos Musculares</h2>
              
              <p className="text-sm text-light-darker mb-4">
                Você pode selecionar múltiplos grupos para um treino mais completo
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                {categories.map((category) => (
                  <motion.button
                    key={category}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleToggleGroup(category)}
                    className={`p-3 rounded-lg text-center transition-all ${
                      selectedGroupsTemp.includes(category)
                        ? 'bg-primary text-white'
                        : 'bg-dark-light text-light-darker hover:bg-dark-medium'
                    }`}
                  >
                    {category}
                    {selectedGroupsTemp.includes(category) && (
                      <div className="mt-1 text-xs">✓ Selecionado</div>
                    )}
                  </motion.button>
                ))}
              </div>
              
              {selectedGroupsTemp.length > 0 && (
                <div className="mb-4 p-3 bg-dark-light rounded-lg">
                  <p className="text-sm text-light-darker mb-2">Grupos selecionados:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedGroupsTemp.map((group) => (
                      <span key={group} className="px-2 py-1 bg-primary text-white text-xs rounded-full">
                        {group}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 py-2 px-4 bg-dark-medium text-light rounded-lg"
                >
                  Cancelar
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setShowGroupModal(false);
                    setShowTemplatesModal(true);
                  }}
                  className="flex-1 btn-secondary"
                >
                  Templates
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleConfirmGroup}
                  className="flex-1 btn-primary"
                  disabled={selectedGroupsTemp.length === 0}
                >
                  Iniciar Treino
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Templates Modal */}
      <AnimatePresence>
        {showTemplatesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowTemplatesModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-lighter rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <WorkoutTemplates 
                onSelectTemplate={handleSelectTemplate}
                userExercises={userExercises}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Supersets Modal */}
      <AnimatePresence>
        {showSupersetsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowSupersetsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-lighter rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <SupersetManager 
                exercises={filteredExercises}
                onCreateSuperset={(superset) => {
                  console.log('Superset created:', superset);
                  setShowSupersetsModal(false);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Available Exercises */}
      {currentWorkout && availableExercises.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              Exercícios Disponíveis
              {selectedGroups.length === 1 && ` - ${selectedGroups[0]}`}
              {selectedGroups.length > 1 && ` (${selectedGroups.length} grupos)`}
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSelectAllExercises}
              className="px-4 py-2 bg-secondary text-white rounded-lg text-sm font-medium"
              disabled={availableExercises.length === 0}
            >
              Selecionar Todos ({availableExercises.length})
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSupersetsModal(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium"
            >
              Supersets
            </motion.button>
          </div>
          
          <div className="space-y-3">
            {availableExercises.map((exercise) => (
              <motion.div
                key={exercise.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="card cursor-pointer"
                onClick={() => handleAddExerciseToWorkout(exercise)}
              >
                <div className="flex items-center">
                  {exercise.exercise.image_url && (
                    <img 
                      src={exercise.exercise.image_url} 
                      alt={exercise.exercise.name}
                      className="w-16 h-16 object-cover rounded-lg mr-4"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold">{exercise.exercise.name}</h3>
                    <p className="text-sm text-light-darker">
                      {exercise.exercise.category} • {exercise.currentWeight || exercise.current_weight || 0} {exercise.weightUnit || exercise.weight_unit || 'lbs'} • {exercise.currentSets || exercise.current_sets || 3}x{exercise.currentReps || exercise.current_reps || 8}
                    </p>
                    {exercise.exercise.description && (
                      <p className="text-xs text-light-darker mt-1 truncate">
                        {exercise.exercise.description}
                      </p>
                    )}
                  </div>
                  <FiPlus className="text-primary ml-2" size={20} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Current Exercises */}
      {currentWorkout && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Exercícios do Treino</h2>
            <div className="bg-primary bg-opacity-20 border border-primary rounded-lg px-3 py-2">
              <div className="flex items-center text-sm font-medium text-primary">
                <FiPlay className="mr-2 animate-pulse" size={18} />
                <span>Clique no ícone play para marcar como atual</span>
              </div>
            </div>
          </div>
          
          {currentWorkout.exercises.length > 0 ? (
            <ExerciseList
              exercises={currentWorkout.exercises}
              onCompleteSet={handleCompleteSet}
              onShowMedia={handleShowMedia}
              currentExerciseIndex={currentExerciseIndex}
              onSetCurrentExercise={handleSetCurrentExercise}
            />
          ) : (
            <div className="card text-center py-6">
              <p className="text-light-darker">
                {availableExercises.length > 0 
                  ? `Selecione exercícios de ${selectedGroups.join(', ')} acima para começar`
                  : `Você não tem exercícios cadastrados para ${selectedGroups.join(', ')}. Vá para a página de Exercícios para adicionar alguns.`
                }
              </p>
              {availableExercises.length === 0 && (
                <Link to="/exercises" className="inline-block mt-4">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="btn-secondary"
                  >
                    <FiPlus className="mr-2" />
                    Adicionar Exercícios
                  </motion.button>
                </Link>
              )}
            </div>
          )}
          
          {/* Workout Controls */}
          {currentWorkout?.exercises?.length > 0 && (
            <div className="flex space-x-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  console.log('🎯 Botão Finalizar clicado!');
                  console.log('Estado atual:', {
                    currentWorkout: !!currentWorkout,
                    exercisesCount: currentWorkout?.exercises?.length || 0,
                    showFinishModal,
                    hasExercises: currentWorkout?.exercises?.length > 0,
                    exercisesList: currentWorkout?.exercises?.map(ex => ex.exerciseData?.exercise?.name)
                  });
                  
                  // Verificar se há exercícios antes de abrir o modal
                  if (!currentWorkout?.exercises?.length) {
                    console.error('❌ Tentativa de finalizar sem exercícios');
                    toast.error('Adicione pelo menos um exercício antes de finalizar');
                    return;
                  }
                  
                  console.log('✅ Abrindo modal de finalização...');
                  setShowFinishModal(true);
                }}
                className="flex-1 btn-primary"
                disabled={!currentWorkout?.exercises?.length}
              >
                <FiCheck className="mr-2" />
                Finalizar Treino
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowCancelModal(true)}
                className="flex-1 bg-dark-medium text-light-darker rounded-lg flex items-center justify-center"
              >
                <FiX className="mr-2" />
                Cancelar
              </motion.button>
            </div>
          )}
        </motion.div>
      )}

      {/* Media Modal */}
      <AnimatePresence>
        {showMediaModal && selectedExercise && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
            onClick={() => setShowMediaModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-lighter rounded-xl p-6 w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{selectedExercise.name}</h2>
                <button
                  onClick={() => setShowMediaModal(false)}
                  className="p-2 hover:bg-dark-medium rounded-full transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {selectedExercise.video_url ? (
                  <div className="relative pt-[56.25%]">
                    <iframe
                      src={selectedExercise.video_url}
                      className="absolute inset-0 w-full h-full rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : selectedExercise.image_url ? (
                  <img
                    src={selectedExercise.image_url}
                    alt={selectedExercise.name}
                    className="w-full rounded-lg"
                  />
                ) : (
                  <div className="w-full h-64 bg-dark-medium rounded-lg flex items-center justify-center">
                    <GiWeightLiftingUp className="text-primary" size={64} />
                  </div>
                )}

                {selectedExercise.description && (
                  <p className="text-light-darker">
                    {selectedExercise.description}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Finish Workout Modal */}
      <AnimatePresence>
        {showFinishModal && currentWorkout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={(e) => {
              console.log('🎯 Clique no overlay do modal - NÃO deve fechar');
              e.stopPropagation();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-lighter rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Finalizar Treino</h2>
                <button
                  onClick={() => {
                    console.log('🎯 Fechando modal pelo X');
                    setShowFinishModal(false);
                    setError('');
                  }}
                  className="p-2 hover:bg-dark-medium rounded-full transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>
              
              
              {error && (
                <div className="mb-4 p-4 bg-red-600 bg-opacity-10 border border-red-600 rounded-lg text-red-500">
                  <div className="font-bold mb-2">❌ Erro ao finalizar treino:</div>
                  <div>{error}</div>
                  <div className="mt-2 text-sm">
                    💡 <strong>Dicas:</strong>
                    <ul className="list-disc list-inside mt-1">
                      <li>Verifique sua conexão com a internet</li>
                      <li>Tente fazer logout e login novamente</li>
                      <li>Se o problema persistir, tente cancelar e refazer o treino</li>
                    </ul>
                  </div>
                </div>
              )}
              
              <div className="mb-6">
                <p className="mb-4">
                  Tem certeza que deseja finalizar o treino atual?
                </p>
                
               {/* Mostrar resumo de exercícios completos vs incompletos */}
               {currentWorkout && (
                 <div className="mb-4 p-4 bg-dark-light rounded-lg">
                   <h4 className="font-bold mb-2">Resumo do Treino:</h4>
                   {currentWorkout.exercises.map((exercise, index) => {
                     const totalSets = exercise.sets?.length || 0;
                     const completedSets = exercise.sets?.filter(set => set.completed).length || 0;
                     const isComplete = completedSets === totalSets && totalSets > 0;
                     
                     return (
                       <div key={index} className="flex justify-between items-center py-1">
                         <span className="text-sm">{exercise.exerciseData.exercise.name}</span>
                         <span className={`text-sm font-medium ${
                           isComplete ? 'text-green-500' : 
                           completedSets > 0 ? 'text-yellow-500' : 'text-light-darker'
                         }`}>
                           {completedSets}/{totalSets} séries
                           {isComplete ? ' ✅' : completedSets > 0 ? ' ⚠️' : ' ❌'}
                         </span>
                       </div>
                     );
                   })}
                   
                   <div className="mt-3 pt-3 border-t border-dark-medium">
                     <p className="text-xs text-light-darker">
                       💡 <strong>Lembrete:</strong> Apenas exercícios com todas as séries completadas contarão para seu progresso.
                     </p>
                   </div>
                 </div>
               )}
               
                <div className="bg-dark-light p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <span>Tempo de treino: {formatTimer()}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span>
                      Exercícios: {currentWorkout?.exercises.length || 0}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    console.log('🎯 Botão Cancelar clicado no modal');
                    setShowFinishModal(false);
                    setError('');
                  }}
                  disabled={loading}
                  className="flex-1 py-2 px-4 bg-dark-medium text-light rounded-lg disabled:opacity-50"
                >
                  Cancelar
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    console.log('🎯 Botão Finalizar clicado no modal!');
                    console.log('🔍 Estado antes de finalizar:', {
                      currentWorkout: !!currentWorkout,
                      exercisesCount: currentWorkout?.exercises?.length,
                      loading,
                      showFinishModal
                    });
                    handleFinishWorkout();
                  }}
                  disabled={loading}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      <span>Finalizando...</span>
                    </div>
                  ) : (
                    'Finalizar'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel Workout Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCancelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-lighter rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">Cancelar Treino</h2>
              
              <p className="mb-6">
                Tem certeza que deseja cancelar o treino atual? Todo o progresso será perdido.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-2 px-4 bg-dark-medium text-light rounded-lg"
                >
                  Voltar
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCancelWorkout}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
                >
                  Cancelar Treino
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progression Suggestion Modal */}
      <AnimatePresence>
        {showProgressionModal && progressionExercise && (
          <ProgressionSuggestionModal
            exercise={progressionExercise}
            onAcceptSuggestion={handleAcceptProgression}
            onDecline={handleDeclineProgression}
            onClose={handleDeclineProgression}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Workout;