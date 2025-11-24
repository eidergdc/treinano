import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTarget, FiClock, FiTrendingUp, FiAward, FiRefreshCw } from 'react-icons/fi';
import { GiWeightLiftingUp } from 'react-icons/gi';
import { toast } from 'react-toastify';
import ProgressBar from './ProgressBar';

const ChallengeSystem = ({ userExercises = [], workoutHistory = [], userId }) => {
  const [challenges, setChallenges] = useState([]);
  const [userProgress, setUserProgress] = useState({});

  useEffect(() => {
    generateChallenges();
  }, [userExercises, workoutHistory]);

  const generateChallenges = () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Treinos desta semana
    const thisWeekWorkouts = workoutHistory.filter(workout => {
      const workoutDate = new Date(workout.start_time);
      return workoutDate >= weekStart && workoutDate <= weekEnd;
    });

    const newChallenges = [
      // Desafio de frequência semanal
      {
        id: 'weekly-frequency',
        title: 'Frequência Semanal',
        description: 'Treine 4 vezes esta semana',
        type: 'frequency',
        target: 4,
        current: thisWeekWorkouts.length,
        timeframe: 'semanal',
        reward: 100,
        icon: FiTarget,
        color: '#FF4500',
        endDate: weekEnd
      },
      
      // Desafio de tempo total
      {
        id: 'weekly-time',
        title: 'Tempo de Treino',
        description: 'Acumule 3 horas de treino esta semana',
        type: 'time',
        target: 180, // 3 horas em minutos
        current: Math.floor(thisWeekWorkouts.reduce((acc, w) => acc + (w.duration || 0), 0) / 60),
        timeframe: 'semanal',
        reward: 150,
        icon: FiClock,
        color: '#4A90E2',
        endDate: weekEnd
      },

      // Desafio de variedade
      {
        id: 'muscle-variety',
        title: 'Variedade Muscular',
        description: 'Treine 5 grupos musculares diferentes',
        type: 'variety',
        target: 5,
        current: new Set(thisWeekWorkouts.map(w => w.category).filter(Boolean)).size,
        timeframe: 'semanal',
        reward: 120,
        icon: GiWeightLiftingUp,
        color: '#28A745',
        endDate: weekEnd
      },

      // Desafio de consistência
      {
        id: 'consistency',
        title: 'Consistência',
        description: 'Treine 3 dias consecutivos',
        type: 'streak',
        target: 3,
        current: calculateCurrentStreak(),
        timeframe: 'contínuo',
        reward: 200,
        icon: FiTrendingUp,
        color: '#6F42C1',
        endDate: null
      },

      // Desafio mensal de exercícios
      {
        id: 'monthly-exercises',
        title: 'Explorador Mensal',
        description: 'Use 15 exercícios diferentes este mês',
        type: 'exercises',
        target: 15,
        current: getMonthlyExerciseVariety(),
        timeframe: 'mensal',
        reward: 300,
        icon: FiAward,
        color: '#FD7E14',
        endDate: getEndOfMonth()
      }
    ];

    setChallenges(newChallenges);
  };

  const calculateCurrentStreak = () => {
    if (workoutHistory.length === 0) return 0;

    const sortedWorkouts = [...workoutHistory]
      .sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Verificar se treinou hoje
    const todayWorkouts = sortedWorkouts.filter(workout => {
      const workoutDate = new Date(workout.start_time);
      workoutDate.setHours(0, 0, 0, 0);
      return workoutDate.getTime() === currentDate.getTime();
    });

    if (todayWorkouts.length > 0) {
      streak = 1;
    } else {
      // Se não treinou hoje, verificar ontem
      currentDate.setDate(currentDate.getDate() - 1);
      const yesterdayWorkouts = sortedWorkouts.filter(workout => {
        const workoutDate = new Date(workout.start_time);
        workoutDate.setHours(0, 0, 0, 0);
        return workoutDate.getTime() === currentDate.getTime();
      });

      if (yesterdayWorkouts.length === 0) return 0;
      streak = 1;
    }

    // Contar dias consecutivos anteriores
    for (let i = 1; i < 30; i++) { // Máximo 30 dias
      currentDate.setDate(currentDate.getDate() - 1);
      const dayWorkouts = sortedWorkouts.filter(workout => {
        const workoutDate = new Date(workout.start_time);
        workoutDate.setHours(0, 0, 0, 0);
        return workoutDate.getTime() === currentDate.getTime();
      });

      if (dayWorkouts.length > 0) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const getMonthlyExerciseVariety = () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthWorkouts = workoutHistory.filter(workout => {
      const workoutDate = new Date(workout.start_time);
      return workoutDate >= monthStart;
    });

    const exerciseNames = new Set();
    monthWorkouts.forEach(workout => {
      workout.exercises?.forEach(exercise => {
        const name = exercise.exerciseData?.exercise?.name;
        if (name) exerciseNames.add(name);
      });
    });

    return exerciseNames.size;
  };

  const getEndOfMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  };

  const formatTimeRemaining = (endDate) => {
    if (!endDate) return 'Contínuo';
    
    const now = new Date();
    const diff = endDate - now;
    
    if (diff <= 0) return 'Expirado';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const claimReward = (challengeId) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge && challenge.current >= challenge.target) {
      toast.success(`🏆 Desafio completado! +${challenge.reward} XP`, {
        position: "top-center",
        autoClose: 5000,
      });
      
      // Marcar como completado (em uma implementação real, salvaria no backend)
      setChallenges(prev => prev.map(c => 
        c.id === challengeId ? { ...c, completed: true } : c
      ));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FiTarget className="text-primary mr-2" size={24} />
          <div>
            <h2 className="text-xl font-bold">Desafios</h2>
            <p className="text-sm text-light-darker">Complete desafios e ganhe XP</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={generateChallenges}
          className="p-2 rounded-full bg-dark-medium hover:bg-dark-light transition-colors"
        >
          <FiRefreshCw size={20} />
        </motion.button>
      </div>

      <div className="space-y-4">
        {challenges.map((challenge, index) => {
          const progress = Math.min((challenge.current / challenge.target) * 100, 100);
          const isCompleted = challenge.current >= challenge.target;
          const IconComponent = challenge.icon;

          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                card relative overflow-hidden
                ${isCompleted ? 'border border-primary bg-gradient-to-r from-primary/10 to-secondary/10' : ''}
              `}
            >
              {/* Background pattern for completed challenges */}
              {isCompleted && (
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary" />
                </div>
              )}

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
                      style={{ backgroundColor: `${challenge.color}20`, color: challenge.color }}
                    >
                      <IconComponent size={24} />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{challenge.title}</h3>
                      <p className="text-light-darker text-sm">{challenge.description}</p>
                      
                      <div className="flex items-center mt-2 space-x-4">
                        <span className="text-xs text-light-darker">
                          {challenge.timeframe}
                        </span>
                        {challenge.endDate && (
                          <span className="text-xs text-secondary">
                            {formatTimeRemaining(challenge.endDate)} restantes
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-light-darker">Recompensa</div>
                    <div className="font-bold text-primary">+{challenge.reward} XP</div>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progresso</span>
                    <span className="font-medium" style={{ color: challenge.color }}>
                      {challenge.current} / {challenge.target}
                    </span>
                  </div>
                  
                  <ProgressBar 
                    value={challenge.current} 
                    max={challenge.target} 
                    showLabel={false}
                  />
                </div>

                {/* Action Button */}
                {isCompleted && !challenge.completed && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => claimReward(challenge.id)}
                    className="w-full btn-primary flex items-center justify-center"
                  >
                    <FiAward className="mr-2" />
                    Resgatar Recompensa
                  </motion.button>
                )}

                {challenge.completed && (
                  <div className="w-full bg-dark-medium text-light-darker py-2 px-4 rounded-lg text-center">
                    ✅ Desafio Completado
                  </div>
                )}

                {!isCompleted && (
                  <div className="text-center text-light-darker text-sm">
                    {challenge.target - challenge.current} restantes para completar
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {challenges.length === 0 && (
        <div className="card text-center py-8">
          <FiTarget className="text-light-darker mx-auto mb-4" size={48} />
          <p className="text-light-darker">Nenhum desafio disponível</p>
          <p className="text-sm text-light-darker mt-2">
            Complete alguns treinos para desbloquear desafios
          </p>
        </div>
      )}
    </div>
  );
};

export default ChallengeSystem;