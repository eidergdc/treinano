import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiActivity, FiAward, FiCalendar, FiClock, FiPlus, FiTrendingUp } from 'react-icons/fi';
import { GiWeightLiftingUp } from 'react-icons/gi';
import { useFirebaseAuthStore } from '../stores/firebaseAuthStore';
import { useWorkoutStore } from '../stores/workoutStore';
import ExerciseCard from '../components/ExerciseCard';
import SmartSuggestions from '../components/SmartSuggestions';
import ChallengeSystem from '../components/ChallengeSystem';
import MotivationalMessage from '../components/MotivationalMessage';
import ProgressBar from '../components/ProgressBar';
import { toast } from 'react-toastify';

const categories = [
  'Peito',
  'Costas', 
  'Pernas',
  'Ombros',
  'Bíceps',
  'Tríceps',
  'Antebraço',
  'Abdômen',
  'Glúteos',
  'Panturrilha',
  'Cardio',
  'Outro'
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useFirebaseAuthStore();
  const { 
    fetchUserExercises,
    fetchWorkoutHistory,
    userExercises, 
    workoutHistory,
    startWorkout,
    loading 
  } = useWorkoutStore();

  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalExercises: 0,
    totalTime: 0,
    streakDays: 0
  });

  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState([]);

  const handleToggleGroup = (category) => {
    setSelectedGroups(prev => {
      if (prev.includes(category)) {
        return prev.filter(group => group !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  useEffect(() => {
    if (user) {
      console.log('🔄 Dashboard: Carregando dados do usuário...');
      fetchUserExercises(user.uid);
      fetchWorkoutHistory(user.uid);
    }
  }, [user]);

  useEffect(() => {
    if (workoutHistory.length > 0) {
      // Calcular estatísticas
      const totalWorkouts = workoutHistory.length;
      const totalExercises = userExercises.length;
      const totalTime = workoutHistory.reduce((acc, workout) => acc + (workout.duration || 0), 0);
      
      // Calcular dias consecutivos de treino (streak)
      let streakDays = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const workoutDates = workoutHistory.map(workout => {
        const date = new Date(workout.start_time);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      }).sort((a, b) => b - a); // Ordenar datas em ordem decrescente
      
      // Verificar se treinou hoje
      const todayTime = today.getTime();
      if (workoutDates[0] === todayTime) {
        streakDays = 1;
        
        // Verificar dias anteriores
        for (let i = 1; i < workoutDates.length; i++) {
          const prevDay = new Date(today);
          prevDay.setDate(today.getDate() - i);
          prevDay.setHours(0, 0, 0, 0);
          
          if (workoutDates.includes(prevDay.getTime())) {
            streakDays++;
          } else {
            break;
          }
        }
      }
      
      setStats({
        totalWorkouts,
        totalExercises,
        totalTime,
        streakDays
      });
    }
  }, [workoutHistory, userExercises]);

  // Iniciar treino
  const handleStartWorkout = () => {
    setShowGroupModal(true);
  };

  // Confirmar seleção do grupo e iniciar treino
  const handleConfirmGroup = () => {
    if (selectedGroups.length === 0) {
      toast.error('Selecione pelo menos um grupo muscular');
      return;
    }
    startWorkout(selectedGroups);
    setShowGroupModal(false);
    const groupsText = selectedGroups.length === 1 
      ? selectedGroups[0] 
      : `${selectedGroups.length} grupos`;
    toast.success(`Treino de ${groupsText} iniciado!`);
    setSelectedGroups([]);
    navigate('/workout');
  };

  // Formatar tempo total em horas e minutos
  const formatTotalTime = () => {
    const hours = Math.floor(stats.totalTime / 3600);
    const minutes = Math.floor((stats.totalTime % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Obter os últimos treinos
  const recentWorkouts = workoutHistory.slice(0, 3);

  // Obter exercícios com maior progresso
  // Obter exercícios mais recentemente treinados
  const recentExercises = [...userExercises]
    .sort((a, b) => {
      // Primeiro, ordenar por data de atualização (mais recente primeiro)
      const dateA = new Date(a.updated_at || a.created_at || 0);
      const dateB = new Date(b.updated_at || b.created_at || 0);
      if (dateB - dateA !== 0) {
        return dateB - dateA;
      }
      
      // Se as datas forem iguais, ordenar por progresso
      if (a.progress_level !== b.progress_level) {
        return b.progress_level - a.progress_level;
      }
      return b.completed_workouts - a.completed_workouts;
    })
    .slice(0, 3);

  // Obter exercícios com maior progresso para uma seção separada
  const topProgressExercises = [...userExercises]
    .sort((a, b) => {
      // Ordenar por nível de progresso e treinos completados
      if (a.progress_level !== b.progress_level) {
        return b.progress_level - a.progress_level;
      }
      return b.completed_workouts - a.completed_workouts;
    })
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-primary">
            {user?.profile?.avatar_url ? (
              <img 
                src={user.profile.avatar_url} 
                alt="Foto do perfil" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary bg-opacity-20 flex items-center justify-center">
                <span className="text-primary font-bold text-xl">
                  {(user?.profile?.username || user?.displayName || user?.user_metadata?.name || user?.email?.split('@')[0] || 'A').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {user?.profile?.username || user?.displayName || user?.user_metadata?.name || 'Dashboard'}
            </h1>
            <p className="text-light-darker">Acompanhe seu progresso e estatísticas</p>
          </div>
        </div>
      </motion.div>

      {/* Motivational Message */}
      <MotivationalMessage 
        user={user}
        workoutHistory={workoutHistory}
        userExercises={userExercises}
      />

      {/* Start Workout Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-primary rounded-xl p-8 text-center shadow-3d"
      >
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            transition: { duration: 2, repeat: Infinity }
          }}
          className="mb-4"
        >
          <GiWeightLiftingUp className="text-white mx-auto" size={64} />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-4">Pronto para treinar?</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStartWorkout}
          className="bg-white text-primary font-bold py-4 px-8 rounded-lg shadow-md text-lg flex items-center justify-center mx-auto"
        >
          <GiWeightLiftingUp className="mr-2" size={24} />
          Iniciar Treino
        </motion.button>
      </motion.div>

      {/* Group Selection Modal */}
      <AnimatePresence>
        {showGroupModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowGroupModal(false)}
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
                      selectedGroups.includes(category)
                        ? 'bg-primary text-white'
                        : 'bg-dark-light text-light-darker hover:bg-dark-medium'
                    }`}
                  >
                    {category}
                    {selectedGroups.includes(category) && (
                      <div className="mt-1 text-xs">✓ Selecionado</div>
                    )}
                  </motion.button>
                ))}
              </div>
              
              {selectedGroups.length > 0 && (
                <div className="mb-4 p-3 bg-dark-light rounded-lg">
                  <p className="text-sm text-light-darker mb-2">Grupos selecionados:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedGroups.map((group) => (
                      <span key={group} className="px-2 py-1 bg-primary text-white text-xs rounded-full">
                        {group}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowGroupModal(false)}
                  className="flex-1 py-2 px-4 bg-dark-medium text-light rounded-lg"
                >
                  Cancelar
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleConfirmGroup}
                  className="flex-1 btn-primary"
                  disabled={selectedGroups.length === 0}
                >
                  Iniciar Treino
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {/* Last Workout Info */}
        {recentWorkouts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="card mb-6 border border-primary bg-gradient-to-r from-primary/10 to-secondary/10 col-span-2"
          >
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mr-4">
                  <GiWeightLiftingUp className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Último Treino</h3>
                  <p className="text-light-darker text-sm">
                    {(() => {
                      const lastWorkout = recentWorkouts[0];
                      const date = new Date(lastWorkout.start_time);
                      const today = new Date();
                      const diffTime = Math.abs(today - date);
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      
                      let timeAgo = '';
                      if (diffDays === 1) {
                        timeAgo = 'Hoje';
                      } else if (diffDays === 2) {
                        timeAgo = 'Ontem';
                      } else if (diffDays <= 7) {
                        timeAgo = `${diffDays - 1} dias atrás`;
                      } else {
                        timeAgo = date.toLocaleDateString('pt-BR');
                      }
                      
                      return timeAgo;
                    })()}
                  </p>
                </div>
              </div>
              
              <div className="bg-dark-light p-3 rounded-lg">
                <div className="text-center mb-2">
                  <div className="text-xl font-bold text-primary">
                  {recentWorkouts[0].category || 'Treino'}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-sm text-light-darker">Duração</div>
                    <div className="font-bold text-secondary">
                      {(() => {
                        const minutes = Math.floor((recentWorkouts[0].duration || 0) / 60);
                        const seconds = (recentWorkouts[0].duration || 0) % 60;
                        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
                      })()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-light-darker">Exercícios</div>
                    <div className="font-bold text-secondary">
                      {recentWorkouts[0].exercises?.length || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div 
          className="card"
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mr-3">
              <FiActivity className="text-primary" size={20} />
            </div>
            <div>
              <h3 className="text-sm text-light-darker">Treinos</h3>
              <p className="text-xl font-bold">{stats.totalWorkouts}</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="card"
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 rounded-full bg-secondary bg-opacity-20 flex items-center justify-center mr-3">
              <GiWeightLiftingUp className="text-secondary" size={20} />
            </div>
            <div>
              <h3 className="text-sm text-light-darker">Exercícios</h3>
              <p className="text-xl font-bold">{stats.totalExercises}</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="card"
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mr-3">
              <FiClock className="text-primary" size={20} />
            </div>
            <div>
              <h3 className="text-sm text-light-darker">Tempo Total</h3>
              <p className="text-xl font-bold">{formatTotalTime()}</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="card"
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 rounded-full bg-secondary bg-opacity-20 flex items-center justify-center mr-3">
              <FiTrendingUp className="text-secondary" size={20} />
            </div>
            <div>
              <h3 className="text-sm text-light-darker">Sequência</h3>
              <p className="text-xl font-bold">{stats.streakDays} dias</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Recent Workouts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Treinos Recentes</h2>
          {workoutHistory.length > 3 && (
            <Link to="/profile" className="text-primary text-sm">
              Ver todos
            </Link>
          )}
        </div>

        {recentWorkouts.length > 0 ? (
          <div className="space-y-3">
            {recentWorkouts.map((workout) => {
              const startDate = new Date(workout.start_time);
              const formattedDate = startDate.toLocaleDateString('pt-BR');
              const formattedTime = startDate.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              });
              
              // Formatar duração
              const minutes = Math.floor(workout.duration / 60);
              const seconds = workout.duration % 60;
              const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
              
              // Contar exercícios
              const exerciseCount = workout.exercises?.length || 0;
              
              return (
                <motion.div 
                  key={workout.id}
                  className="card"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex justify-between items-center">
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
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="card text-center py-6">
            <p className="text-light-darker">Nenhum treino registrado ainda</p>
            <Link to="/workout" className="text-primary block mt-2">
              Comece seu primeiro treino
            </Link>
          </div>
        )}
      </motion.div>

      {/* Top Exercises */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Exercícios Recentes</h2>
          <Link to="/exercises" className="text-primary text-sm">
            Ver todos
          </Link>
        </div>

        {recentExercises.length > 0 ? (
          <div className="space-y-3">
            {recentExercises.map((exercise, index) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <ExerciseCard exercise={exercise} showProgress={true} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-6">
            <p className="text-light-darker">Nenhum exercício adicionado</p>
            <Link to="/exercises" className="text-primary block mt-2">
              Adicionar exercícios
            </Link>
          </div>
        )}
        
        <Link to="/exercises">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="btn-secondary w-full mt-4 flex items-center justify-center"
          >
            <FiPlus className="mr-2" />
            Adicionar Exercício
          </motion.button>
        </Link>
      </motion.div>

      {/* Top Progress Exercises */}
      {topProgressExercises.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Maior Progresso</h2>
            <Link to="/exercises" className="text-primary text-sm">
              Ver todos
            </Link>
          </div>

          <div className="space-y-3">
            {topProgressExercises.map((exercise, index) => {
              // Calcular informações de progresso
              const { progressLevel, completedWorkouts } = exercise;
              
              let progressText = '';
              let nextProgressText = '';
              
              if (progressLevel === 0) {
                progressText = '3x8';
                nextProgressText = '3x10';
              } else if (progressLevel === 1) {
                progressText = '3x10';
                nextProgressText = '3x12';
              } else if (progressLevel === 2) {
                progressText = '3x12';
                nextProgressText = `Aumento de peso`;
              }
              
              return (
                <motion.div
                  key={exercise.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  className="card"
                >
                  <Link to={`/exercises/${exercise.id}`} className="block">
                    <div className="flex items-center">
                      <div className="relative">
                        {exercise.exercise.image_url ? (
                          <img 
                            src={exercise.exercise.image_url} 
                            alt={exercise.exercise.name} 
                            className="w-16 h-16 object-cover rounded-lg mr-4"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-dark-medium rounded-lg mr-4 flex items-center justify-center">
                            <GiWeightLiftingUp className="text-primary" size={24} />
                          </div>
                        )}
                        
                        {/* Badge de nível */}
                        <div className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                          {progressLevel + 1}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{exercise.exercise.name}</h3>
                        <p className="text-light-darker text-sm">
                          {exercise.exercise.category} • {exercise.currentWeight} {exercise.weightUnit || 'lbs'}
                        </p>
                        
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-secondary font-medium">
                              Nível {progressLevel + 1}: {progressText}
                            </span>
                            <span className="text-light-darker">
                              {completedWorkouts}/10 treinos
                            </span>
                          </div>
                          <ProgressBar 
                            value={completedWorkouts} 
                            max={10} 
                            showLabel={false}
                          />
                          
                          {completedWorkouts >= 8 && (
                            <p className="text-xs text-primary mt-1 font-medium">
                              🔥 Próximo: {nextProgressText}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <FiTrendingUp size={20} className="text-secondary ml-2" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
        className="grid grid-cols-2 gap-4"
      >
        <Link to="/exercises">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="btn-secondary w-full flex items-center justify-center py-4"
          >
            <FiPlus className="mr-2" />
            Adicionar Exercício
          </motion.button>
        </Link>
        
        <Link to="/analytics">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="bg-dark-light text-light hover:bg-dark-medium w-full flex items-center justify-center py-4 rounded-lg font-medium transition-colors"
          >
            <FiTrendingUp className="mr-2" />
            Analytics
          </motion.button>
        </Link>
      </motion.div>

      {/* Smart Suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
      >
        <SmartSuggestions 
          userExercises={userExercises}
          workoutHistory={workoutHistory}
        />
      </motion.div>

      {/* Challenges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.8 }}
      >
        <ChallengeSystem 
          userExercises={userExercises}
          workoutHistory={workoutHistory}
          userId={user?.uid}
        />
      </motion.div>
    </div>
  );
};

export default Dashboard;