import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiChevronLeft, FiChevronRight, FiTarget } from 'react-icons/fi';
import { GiWeightLiftingUp } from 'react-icons/gi';

const WorkoutCalendar = ({ workoutHistory = [], onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // Obter primeiro e último dia do mês atual
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();

  // Criar array de dias do mês
  const daysInMonth = [];
  const totalDays = lastDayOfMonth.getDate();

  // Adicionar dias vazios do início
  for (let i = 0; i < firstDayOfWeek; i++) {
    daysInMonth.push(null);
  }

  // Adicionar dias do mês
  for (let day = 1; day <= totalDays; day++) {
    daysInMonth.push(day);
  }

  // Criar mapa de treinos por data
  const workoutsByDate = {};
  workoutHistory.forEach(workout => {
    const date = new Date(workout.start_time);
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    
    if (!workoutsByDate[dateKey]) {
      workoutsByDate[dateKey] = [];
    }
    workoutsByDate[dateKey].push(workout);
  });

  // Verificar se uma data tem treino
  const hasWorkout = (day) => {
    if (!day) return false;
    const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`;
    return workoutsByDate[dateKey] && workoutsByDate[dateKey].length > 0;
  };

  // Obter treinos de uma data
  const getWorkoutsForDate = (day) => {
    if (!day) return [];
    const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`;
    return workoutsByDate[dateKey] || [];
  };

  // Navegar entre meses
  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  // Selecionar data
  const handleDateSelect = (day) => {
    if (!day) return;
    
    const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(selected);
    
    if (onDateSelect) {
      onDateSelect(selected, getWorkoutsForDate(day));
    }
  };

  // Calcular estatísticas do mês
  const monthStats = {
    totalWorkouts: Object.values(workoutsByDate).flat().filter(workout => {
      const workoutDate = new Date(workout.start_time);
      return workoutDate.getMonth() === currentDate.getMonth() && 
             workoutDate.getFullYear() === currentDate.getFullYear();
    }).length,
    workoutDays: Object.keys(workoutsByDate).filter(dateKey => {
      const [year, month] = dateKey.split('-').map(Number);
      return month === currentDate.getMonth() && year === currentDate.getFullYear();
    }).length
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FiCalendar className="text-primary mr-2" size={24} />
          <div>
            <h2 className="text-xl font-bold">Calendário de Treinos</h2>
            <p className="text-sm text-light-darker">
              {monthStats.totalWorkouts} treinos em {monthStats.workoutDays} dias
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigateMonth(-1)}
            className="p-2 rounded-full bg-dark-medium hover:bg-dark-light transition-colors"
          >
            <FiChevronLeft size={20} />
          </motion.button>
          
          <h3 className="text-lg font-bold min-w-[140px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigateMonth(1)}
            className="p-2 rounded-full bg-dark-medium hover:bg-dark-light transition-colors"
          >
            <FiChevronRight size={20} />
          </motion.button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {/* Day headers */}
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-light-darker py-2">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {daysInMonth.map((day, index) => {
          const isToday = day && 
            new Date().getDate() === day && 
            new Date().getMonth() === currentDate.getMonth() &&
            new Date().getFullYear() === currentDate.getFullYear();
          
          const hasWorkoutToday = hasWorkout(day);
          const workouts = getWorkoutsForDate(day);
          const isSelected = selectedDate && 
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === currentDate.getMonth() &&
            selectedDate.getFullYear() === currentDate.getFullYear();

          return (
            <motion.div
              key={index}
              whileHover={day ? { scale: 1.05 } : {}}
              whileTap={day ? { scale: 0.95 } : {}}
              onClick={() => handleDateSelect(day)}
              className={`
                aspect-square flex flex-col items-center justify-center text-sm cursor-pointer rounded-lg relative
                ${day ? 'hover:bg-dark-medium' : ''}
                ${isToday ? 'bg-primary text-white font-bold' : ''}
                ${isSelected ? 'ring-2 ring-secondary' : ''}
                ${hasWorkoutToday && !isToday ? 'bg-dark-light' : ''}
              `}
            >
              {day && (
                <>
                  <span className={isToday ? 'text-white' : ''}>{day}</span>
                  
                  {hasWorkoutToday && (
                    <div className="absolute bottom-1 flex space-x-1">
                      {workouts.slice(0, 3).map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 h-1 rounded-full ${
                            isToday ? 'bg-white' : 'bg-primary'
                          }`}
                        />
                      ))}
                      {workouts.length > 3 && (
                        <span className={`text-xs ${isToday ? 'text-white' : 'text-primary'}`}>
                          +{workouts.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Selected Date Info */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-light p-4 rounded-lg"
        >
          <h4 className="font-bold mb-2">
            {selectedDate.toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h4>
          
          {getWorkoutsForDate(selectedDate.getDate()).length > 0 ? (
            <div className="space-y-2">
              {getWorkoutsForDate(selectedDate.getDate()).map((workout, index) => {
                const startTime = new Date(workout.start_time);
                const duration = Math.floor(workout.duration / 60);
                const exerciseCount = workout.exercises?.length || 0;
                
                return (
                  <div key={index} className="flex items-center justify-between bg-dark-medium p-2 rounded">
                    <div className="flex items-center">
                      <GiWeightLiftingUp className="text-primary mr-2" size={16} />
                      <div>
                        <p className="font-medium">{workout.category || 'Treino'}</p>
                        <p className="text-xs text-light-darker">
                          {startTime.toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })} • {duration}min • {exerciseCount} exercícios
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4">
              <FiTarget className="text-light-darker mx-auto mb-2" size={24} />
              <p className="text-light-darker">Nenhum treino neste dia</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mt-4 text-xs text-light-darker">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
          <span>Hoje</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-dark-light rounded-full mr-2"></div>
          <span>Com treino</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 border-2 border-secondary rounded-full mr-2"></div>
          <span>Selecionado</span>
        </div>
      </div>
    </div>
  );
};

export default WorkoutCalendar;