import React from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiCalendar } from 'react-icons/fi';

const ProgressChart = ({ exerciseHistory, exerciseName }) => {
  if (!exerciseHistory || exerciseHistory.length === 0) {
    return (
      <div className="card text-center py-8">
        <FiTrendingUp className="text-primary mx-auto mb-4" size={48} />
        <p className="text-light-darker">Nenhum dado de progresso ainda</p>
        <p className="text-sm text-light-darker mt-2">
          Complete alguns treinos para ver seu progresso
        </p>
      </div>
    );
  }

  // Preparar dados para o gráfico
  const chartData = exerciseHistory.slice(-10).map((entry, index) => ({
    date: new Date(entry.date).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    }),
    weight: entry.weight,
    reps: entry.reps,
    index
  }));

  const maxWeight = Math.max(...chartData.map(d => d.weight));
  const minWeight = Math.min(...chartData.map(d => d.weight));
  const weightRange = maxWeight - minWeight || 1;

  return (
    <div className="card">
      <div className="flex items-center mb-4">
        <FiTrendingUp className="text-primary mr-2" size={20} />
        <h3 className="font-bold">Progresso - {exerciseName}</h3>
      </div>

      {/* Chart Container */}
      <div className="relative h-48 bg-dark-light rounded-lg p-4 mb-4">
        <div className="absolute inset-4">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-light-darker">
            <span>{maxWeight}kg</span>
            <span>{Math.round((maxWeight + minWeight) / 2)}kg</span>
            <span>{minWeight}kg</span>
          </div>

          {/* Chart area */}
          <div className="ml-8 h-full relative">
            {/* Grid lines */}
            <div className="absolute inset-0">
              {[0, 25, 50, 75, 100].map(percent => (
                <div
                  key={percent}
                  className="absolute w-full border-t border-dark-medium opacity-30"
                  style={{ top: `${percent}%` }}
                />
              ))}
            </div>

            {/* Data points and line */}
            <svg className="w-full h-full">
              {/* Line */}
              <polyline
                fill="none"
                stroke="#FF4500"
                strokeWidth="2"
                points={chartData.map((point, index) => {
                  const x = (index / (chartData.length - 1)) * 100;
                  const y = 100 - ((point.weight - minWeight) / weightRange) * 100;
                  return `${x}%,${y}%`;
                }).join(' ')}
              />
              
              {/* Data points */}
              {chartData.map((point, index) => {
                const x = (index / (chartData.length - 1)) * 100;
                const y = 100 - ((point.weight - minWeight) / weightRange) * 100;
                return (
                  <motion.circle
                    key={index}
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="4"
                    fill="#FF4500"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  />
                );
              })}
            </svg>

            {/* X-axis labels */}
            <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-light-darker">
              {chartData.map((point, index) => (
                <span key={index}>{point.date}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-sm text-light-darker">Atual</p>
          <p className="font-bold text-primary">{chartData[chartData.length - 1]?.weight}kg</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-light-darker">Máximo</p>
          <p className="font-bold text-secondary">{maxWeight}kg</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-light-darker">Evolução</p>
          <p className="font-bold text-green-500">
            +{(chartData[chartData.length - 1]?.weight - chartData[0]?.weight || 0).toFixed(1)}kg
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;