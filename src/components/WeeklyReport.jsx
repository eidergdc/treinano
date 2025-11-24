import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiTrendingUp, FiTarget, FiAward, FiClock } from 'react-icons/fi';
import { GiWeightLiftingUp } from 'react-icons/gi';

const WeeklyReport = ({ workoutHistory = [], userExercises = [] }) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekData, setWeekData] = useState(null);

  useEffect(() => {
    calculateWeekData();
  }, [workoutHistory, weekOffset]);

  const calculateWeekData = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() - (weekOffset * 7));
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Filtrar treinos da semana
    const weekWorkouts = workoutHistory.filter(workout => {
      const workoutDate = new Date(workout.start_time);
      return workoutDate >= startOfWeek && workoutDate <= endOfWeek;
    });

    // Calcular estatísticas
    const totalWorkouts = weekWorkouts.length;
    const totalTime = weekWorkouts.reduce((acc, workout) => acc + (workout.duration || 0), 0);
    const totalExercises = weekWorkouts.reduce((acc, workout) => acc + (workout.exercises?.length || 0), 0);
    
    // Grupos musculares treinados
    const muscleGroups = new Set();
    weekWorkouts.forEach(workout => {
      if (workout.category) {
        if (workout.category.includes(',')) {
          workout.category.split(',').forEach(group => muscleGroups.add(group.trim()));
        } else {
          muscleGroups.add(workout.category);
        }
      }
    });

    // Dias da semana com treinos
    const workoutDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      
      const dayWorkouts = weekWorkouts.filter(workout => {
        const workoutDate = new Date(workout.start_time);
        return workoutDate.toDateString() === day.toDateString();
      });

      workoutDays.push({
        date: day,
        workouts: dayWorkouts,
        hasWorkout: dayWorkouts.length > 0
      });
    }

    // Exercício mais treinado
    const exerciseCount = {};
    weekWorkouts.forEach(workout => {
      workout.exercises?.forEach(exercise => {
        const name = exercise.exerciseData?.exercise?.name;
        if (name) {
          exerciseCount[name] = (exerciseCount[name] || 0) + 1;
        }
      });
    });

    const mostTrainedExercise = Object.entries(exerciseCount)
      .sort(([,a], [,b]) => b - a)[0];

    setWeekData({
      startOfWeek,
      endOfWeek,
      totalWorkouts,
      totalTime,
      totalExercises,
      muscleGroups: Array.from(muscleGroups),
      workoutDays,
      mostTrainedExercise: mostTrainedExercise ? {
        name: mostTrainedExercise[0],
        count: mostTrainedExercise[1]
      } : null,
      weekWorkouts
    });
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getWeekTitle = () => {
    if (weekOffset === 0) return 'Esta Semana';
    if (weekOffset === -1) return 'Semana Passada';
    return `${Math.abs(weekOffset)} semanas atrás`;
  };

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  if (!weekData) return null;

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FiCalendar className="text-primary mr-2" size={24} />
          <div>
            <h2 className="text-xl font-bold">Relatório Semanal</h2>
            <p className="text-sm text-light-darker">
              {weekData.startOfWeek.toLocaleDateString('pt-BR')} - {weekData.endOfWeek.toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="p-2 rounded-full bg-dark-medium hover:bg-dark-light transition-colors"
          >
            ←
          </motion.button>
          
          <span className="text-sm font-medium min-w-[120px] text-center">
            {getWeekTitle()}
          </span>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setWeekOffset(weekOffset + 1)}
            disabled={weekOffset >= 0}
            className="p-2 rounded-full bg-dark-medium hover:bg-dark-light transition-colors disabled:opacity-50"
          >
            →
          </motion.button>
        </div>
      </div>

      {/* Week Overview */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {weekData.workoutDays.map((day, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              text-center p-3 rounded-lg transition-all
              ${day.hasWorkout ? 'bg-primary bg-opacity-20 border border-primary' : 'bg-dark-light'}
            `}
          >
            <div className="text-xs text-light-darker mb-1">{dayNames[index]}</div>
            <div className="font-bold text-sm">{day.date.getDate()}</div>
            {day.hasWorkout && (
              <div className="mt-1">
                <GiWeightLiftingUp className="text-primary mx-auto" size={12} />
                <div className="text-xs text-primary">{day.workouts.length}</div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-light p-4 rounded-lg text-center"
        >
          <FiTarget className="text-primary mx-auto mb-2" size={24} />
          <div className="text-2xl font-bold">{weekData.totalWorkouts}</div>
          <div className="text-xs text-light-darker">Treinos</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-dark-light p-4 rounded-lg text-center"
        >
          <FiClock className="text-secondary mx-auto mb-2" size={24} />
          <div className="text-2xl font-bold">{formatTime(weekData.totalTime)}</div>
          <div className="text-xs text-light-darker">Tempo Total</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-dark-light p-4 rounded-lg text-center"
        >
          <GiWeightLiftingUp className="text-primary mx-auto mb-2" size={24} />
          <div className="text-2xl font-bold">{weekData.totalExercises}</div>
          <div className="text-xs text-light-darker">Exercícios</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-dark-light p-4 rounded-lg text-center"
        >
          <FiTrendingUp className="text-secondary mx-auto mb-2" size={24} />
          <div className="text-2xl font-bold">{weekData.muscleGroups.length}</div>
          <div className="text-xs text-light-darker">Grupos</div>
        </motion.div>
      </div>

      {/* Detailed Info */}
      <div className="space-y-4">
        {/* Muscle Groups */}
        {weekData.muscleGroups.length > 0 && (
          <div>
            <h4 className="font-bold mb-2">Grupos Musculares Treinados</h4>
            <div className="flex flex-wrap gap-2">
              {weekData.muscleGroups.map((group, index) => (
                <motion.span
                  key={group}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="px-3 py-1 bg-primary bg-opacity-20 text-primary text-sm rounded-full"
                >
                  {group}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* Most Trained Exercise */}
        {weekData.mostTrainedExercise && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-dark-light p-4 rounded-lg"
          >
            <div className="flex items-center">
              <FiAward className="text-secondary mr-2" size={20} />
              <div>
                <h4 className="font-bold">Exercício Mais Treinado</h4>
                <p className="text-light-darker">
                  {weekData.mostTrainedExercise.name} • {weekData.mostTrainedExercise.count} vezes
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* No workouts message */}
        {weekData.totalWorkouts === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <FiTarget className="text-light-darker mx-auto mb-4" size={48} />
            <p className="text-light-darker">Nenhum treino registrado nesta semana</p>
            <p className="text-sm text-light-darker mt-2">
              {weekOffset === 0 ? 'Que tal começar hoje?' : 'Escolha outra semana para ver os dados'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WeeklyReport;