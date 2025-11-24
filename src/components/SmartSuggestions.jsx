import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiAlertCircle, FiTarget, FiZap } from 'react-icons/fi';
import { GiWeightLiftingUp } from 'react-icons/gi';

const SmartSuggestions = ({ userExercises = [], workoutHistory = [] }) => {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    generateSuggestions();
  }, [userExercises, workoutHistory]);

  const generateSuggestions = () => {
    const newSuggestions = [];

    // Analisar progresso dos exercícios
    userExercises.forEach(exercise => {
      const { progress_level, completed_workouts, current_weight, exercise: exerciseData } = exercise;
      
      // Sugestão de aumento de peso
      if (progress_level === 2 && completed_workouts >= 8) {
        newSuggestions.push({
          id: `weight-increase-${exercise.id}`,
          type: 'weight-increase',
          title: 'Hora de Aumentar o Peso!',
          description: `${exerciseData.name}: Você está dominando 3x12. Que tal aumentar para ${current_weight + 2.5}kg e voltar para 3x8?`,
          priority: 'high',
          icon: FiTrendingUp,
          color: '#28A745',
          action: 'Aumentar Peso',
          exerciseId: exercise.id
        });
      }

      // Sugestão de progressão
      if (completed_workouts >= 7 && completed_workouts < 10) {
        newSuggestions.push({
          id: `progression-${exercise.id}`,
          type: 'progression',
          title: 'Quase Evoluindo!',
          description: `${exerciseData.name}: Faltam apenas ${10 - completed_workouts} treinos para o próximo nível!`,
          priority: 'medium',
          icon: FiTarget,
          color: '#FD7E14',
          action: 'Continuar Treinando'
        });
      }
    });

    // Detectar platô
    const recentWorkouts = workoutHistory.slice(0, 10);
    if (recentWorkouts.length >= 5) {
      const avgDuration = recentWorkouts.reduce((acc, w) => acc + (w.duration || 0), 0) / recentWorkouts.length;
      const recentAvg = recentWorkouts.slice(0, 3).reduce((acc, w) => acc + (w.duration || 0), 0) / 3;
      
      if (recentAvg < avgDuration * 0.8) {
        newSuggestions.push({
          id: 'plateau-warning',
          type: 'plateau',
          title: 'Possível Platô Detectado',
          description: 'Seus treinos estão mais curtos. Considere variar exercícios ou aumentar a intensidade.',
          priority: 'high',
          icon: FiAlertCircle,
          color: '#DC3545',
          action: 'Ver Sugestões'
        });
      }
    }

    // Sugestão de descanso
    const lastWorkout = workoutHistory[0];
    if (lastWorkout) {
      const daysSinceLastWorkout = Math.floor((new Date() - new Date(lastWorkout.start_time)) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastWorkout >= 3) {
        newSuggestions.push({
          id: 'rest-reminder',
          type: 'rest',
          title: 'Hora de Voltar aos Treinos!',
          description: `Você não treina há ${daysSinceLastWorkout} dias. Que tal retomar hoje?`,
          priority: 'medium',
          icon: FiZap,
          color: '#FF4500',
          action: 'Iniciar Treino'
        });
      }
    }

    // Sugestão de variedade
    const recentCategories = workoutHistory.slice(0, 5).map(w => w.category).filter(Boolean);
    const uniqueCategories = new Set(recentCategories);
    
    if (recentCategories.length >= 3 && uniqueCategories.size === 1) {
      newSuggestions.push({
        id: 'variety-suggestion',
        type: 'variety',
        title: 'Varie Seus Treinos',
        description: `Você tem treinado muito ${Array.from(uniqueCategories)[0]}. Que tal treinar outros grupos musculares?`,
        priority: 'low',
        icon: GiWeightLiftingUp,
        color: '#6F42C1',
        action: 'Ver Exercícios'
      });
    }

    // Sugestão baseada em performance
    if (workoutHistory.length >= 10) {
      const last5Workouts = workoutHistory.slice(0, 5);
      const previous5Workouts = workoutHistory.slice(5, 10);
      
      const recentAvgTime = last5Workouts.reduce((acc, w) => acc + (w.duration || 0), 0) / 5;
      const previousAvgTime = previous5Workouts.reduce((acc, w) => acc + (w.duration || 0), 0) / 5;
      
      if (recentAvgTime > previousAvgTime * 1.2) {
        newSuggestions.push({
          id: 'performance-improvement',
          type: 'performance',
          title: 'Performance Melhorando!',
          description: 'Seus treinos estão mais longos e intensos. Continue assim!',
          priority: 'low',
          icon: FiTrendingUp,
          color: '#28A745',
          action: 'Ver Progresso'
        });
      }
    }

    // Ordenar por prioridade
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    newSuggestions.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

    setSuggestions(newSuggestions.slice(0, 5)); // Máximo 5 sugestões
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-500';
      case 'medium': return 'border-yellow-500';
      case 'low': return 'border-green-500';
      default: return 'border-dark-medium';
    }
  };

  const handleSuggestionAction = (suggestion) => {
    switch (suggestion.type) {
      case 'weight-increase':
        // Navegar para o exercício específico
        break;
      case 'rest':
        // Navegar para iniciar treino
        break;
      case 'variety':
        // Navegar para exercícios
        break;
      default:
        break;
    }
  };

  if (suggestions.length === 0) {
    return (
      <div className="card text-center py-8">
        <FiTarget className="text-light-darker mx-auto mb-4" size={48} />
        <p className="text-light-darker">Nenhuma sugestão no momento</p>
        <p className="text-sm text-light-darker mt-2">
          Continue treinando para receber sugestões personalizadas
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <FiTarget className="text-primary mr-2" size={24} />
        <div>
          <h2 className="text-xl font-bold">Sugestões Inteligentes</h2>
          <p className="text-sm text-light-darker">Baseadas no seu progresso e histórico</p>
        </div>
      </div>

      <div className="space-y-4">
        {suggestions.map((suggestion, index) => {
          const IconComponent = suggestion.icon;
          
          return (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`card border-l-4 ${getPriorityColor(suggestion.priority)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0"
                    style={{ backgroundColor: `${suggestion.color}20`, color: suggestion.color }}
                  >
                    <IconComponent size={20} />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold">{suggestion.title}</h3>
                    <p className="text-light-darker text-sm mt-1">{suggestion.description}</p>
                    
                    <div className="flex items-center mt-2">
                      <span 
                        className={`
                          text-xs px-2 py-1 rounded-full
                          ${suggestion.priority === 'high' ? 'bg-red-500 bg-opacity-20 text-red-400' : ''}
                          ${suggestion.priority === 'medium' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' : ''}
                          ${suggestion.priority === 'low' ? 'bg-green-500 bg-opacity-20 text-green-400' : ''}
                        `}
                      >
                        {suggestion.priority === 'high' ? 'Alta Prioridade' : ''}
                        {suggestion.priority === 'medium' ? 'Média Prioridade' : ''}
                        {suggestion.priority === 'low' ? 'Baixa Prioridade' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSuggestionAction(suggestion)}
                  className="px-4 py-2 bg-dark-medium hover:bg-dark-light rounded-lg text-sm font-medium transition-colors"
                  style={{ color: suggestion.color }}
                >
                  {suggestion.action}
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SmartSuggestions;