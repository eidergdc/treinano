import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBarChart2, FiTrendingUp, FiCalendar, FiTarget } from 'react-icons/fi';
import { useFirebaseAuthStore } from '../stores/firebaseAuthStore';
import { useWorkoutStore } from '../stores/workoutStore';
import ProgressChart from '../components/ProgressChart';
import WeeklyReport from '../components/WeeklyReport';
import WorkoutCalendar from '../components/WorkoutCalendar';

const Analytics = () => {
  const { user } = useFirebaseAuthStore();
  const { fetchUserExercises, fetchWorkoutHistory, userExercises, workoutHistory } = useWorkoutStore();
  const [selectedView, setSelectedView] = useState('overview');
  const [selectedExercise, setSelectedExercise] = useState(null);

  useEffect(() => {
    if (user) {
      fetchUserExercises(user.uid);
      fetchWorkoutHistory(user.uid);
    }
  }, [user]);

  const views = [
    { id: 'overview', label: 'Visão Geral', icon: FiBarChart2 },
    { id: 'progress', label: 'Progresso', icon: FiTrendingUp },
    { id: 'calendar', label: 'Calendário', icon: FiCalendar },
    { id: 'reports', label: 'Relatórios', icon: FiTarget }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center"
        >
          <div className="text-2xl font-bold text-primary">{workoutHistory.length}</div>
          <div className="text-sm text-light-darker">Total de Treinos</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card text-center"
        >
          <div className="text-2xl font-bold text-secondary">{userExercises.length}</div>
          <div className="text-sm text-light-darker">Exercícios</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card text-center"
        >
          <div className="text-2xl font-bold text-primary">
            {Math.floor(workoutHistory.reduce((acc, w) => acc + (w.duration || 0), 0) / 3600)}h
          </div>
          <div className="text-sm text-light-darker">Tempo Total</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card text-center"
        >
          <div className="text-2xl font-bold text-secondary">
            {workoutHistory.length > 0 ? Math.floor(workoutHistory.reduce((acc, w) => acc + (w.duration || 0), 0) / workoutHistory.length / 60) : 0}min
          </div>
          <div className="text-sm text-light-darker">Tempo Médio</div>
        </motion.div>
      </div>

      {/* Recent Activity Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <WeeklyReport workoutHistory={workoutHistory} userExercises={userExercises} />
      </motion.div>
    </div>
  );

  const renderProgress = () => (
    <div className="space-y-6">
      {/* Exercise Selection */}
      <div className="card">
        <h3 className="font-bold mb-4">Selecione um Exercício</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {userExercises.map(exercise => (
            <motion.button
              key={exercise.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedExercise(exercise)}
              className={`
                p-3 rounded-lg text-left transition-all
                ${selectedExercise?.id === exercise.id 
                  ? 'bg-primary text-white' 
                  : 'bg-dark-light hover:bg-dark-medium'
                }
              `}
            >
              <div className="font-medium">{exercise.exercise.name}</div>
              <div className="text-sm opacity-75">
                {exercise.exercise.category} • {exercise.current_weight} {exercise.weight_unit || 'lbs'}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Progress Chart */}
      {selectedExercise && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ProgressChart 
            exerciseHistory={[]} // Implementar histórico do exercício
            exerciseName={selectedExercise.exercise.name}
          />
        </motion.div>
      )}
    </div>
  );

  const renderCalendar = () => (
    <WorkoutCalendar 
      workoutHistory={workoutHistory}
      onDateSelect={(date, workouts) => {
        console.log('Selected date:', date, 'Workouts:', workouts);
      }}
    />
  );

  const renderReports = () => (
    <div className="space-y-6">
      <WeeklyReport workoutHistory={workoutHistory} userExercises={userExercises} />
      
      {/* Monthly Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h3 className="font-bold mb-4">Resumo Mensal</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-dark-light p-4 rounded-lg text-center">
            <div className="text-xl font-bold text-primary">
              {workoutHistory.filter(w => {
                const date = new Date(w.start_time);
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <div className="text-sm text-light-darker">Treinos Este Mês</div>
          </div>
          
          <div className="bg-dark-light p-4 rounded-lg text-center">
            <div className="text-xl font-bold text-secondary">
              {new Set(workoutHistory.filter(w => {
                const date = new Date(w.start_time);
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
              }).map(w => w.category)).size}
            </div>
            <div className="text-sm text-light-darker">Grupos Diferentes</div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderContent = () => {
    switch (selectedView) {
      case 'overview': return renderOverview();
      case 'progress': return renderProgress();
      case 'calendar': return renderCalendar();
      case 'reports': return renderReports();
      default: return renderOverview();
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold mb-1">Analytics</h1>
        <p className="text-light-darker">Analise seu progresso e performance</p>
      </motion.div>

      {/* View Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {views.map((view) => {
            const IconComponent = view.icon;
            return (
              <motion.button
                key={view.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedView(view.id)}
                className={`
                  px-4 py-2 rounded-full whitespace-nowrap flex items-center
                  ${selectedView === view.id
                    ? 'bg-primary text-white'
                    : 'bg-dark-light text-light-darker hover:bg-dark-medium'
                  }
                `}
              >
                <IconComponent className="mr-2" size={16} />
                {view.label}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        key={selectedView}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderContent()}
      </motion.div>
    </div>
  );
};

export default Analytics;