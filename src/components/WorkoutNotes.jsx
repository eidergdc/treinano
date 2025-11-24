import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiEdit3, FiSave, FiX } from 'react-icons/fi';

const WorkoutNotes = ({ workoutId, initialNotes = '', onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(initialNotes);
  const [tempNotes, setTempNotes] = useState(initialNotes);

  const handleSave = () => {
    setNotes(tempNotes);
    setIsEditing(false);
    if (onSave) {
      onSave(tempNotes);
    }
  };

  const handleCancel = () => {
    setTempNotes(notes);
    setIsEditing(false);
  };

  const moodEmojis = [
    { emoji: '💪', label: 'Forte', value: 'strong' },
    { emoji: '😊', label: 'Bem', value: 'good' },
    { emoji: '😐', label: 'Normal', value: 'normal' },
    { emoji: '😴', label: 'Cansado', value: 'tired' },
    { emoji: '🔥', label: 'Motivado', value: 'motivated' }
  ];

  const quickNotes = [
    'Treino excelente!',
    'Aumentei o peso hoje',
    'Senti dificuldade',
    'Muito cansado',
    'Novo recorde pessoal!',
    'Preciso melhorar a forma',
    'Treino mais longo que o normal',
    'Foco total hoje'
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold">Notas do Treino</h3>
        {!isEditing && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsEditing(true)}
            className="p-2 rounded-full bg-dark-medium hover:bg-dark-light transition-colors"
          >
            <FiEdit3 className="text-primary" size={16} />
          </motion.button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          {/* Mood Selection */}
          <div>
            <label className="block text-sm font-medium text-light-darker mb-2">
              Como você se sentiu?
            </label>
            <div className="flex space-x-2">
              {moodEmojis.map((mood) => (
                <motion.button
                  key={mood.value}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    const moodText = `${mood.emoji} ${mood.label}`;
                    if (!tempNotes.includes(moodText)) {
                      setTempNotes(prev => prev ? `${prev}\n${moodText}` : moodText);
                    }
                  }}
                  className="p-2 rounded-lg bg-dark-medium hover:bg-dark-light transition-colors text-center"
                  title={mood.label}
                >
                  <div className="text-2xl">{mood.emoji}</div>
                  <div className="text-xs text-light-darker">{mood.label}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Quick Notes */}
          <div>
            <label className="block text-sm font-medium text-light-darker mb-2">
              Notas rápidas
            </label>
            <div className="grid grid-cols-2 gap-2">
              {quickNotes.map((note, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (!tempNotes.includes(note)) {
                      setTempNotes(prev => prev ? `${prev}\n• ${note}` : `• ${note}`);
                    }
                  }}
                  className="p-2 text-left text-sm bg-dark-medium hover:bg-dark-light rounded-lg transition-colors"
                >
                  {note}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Custom Notes */}
          <div>
            <label className="block text-sm font-medium text-light-darker mb-2">
              Suas observações
            </label>
            <textarea
              value={tempNotes}
              onChange={(e) => setTempNotes(e.target.value)}
              placeholder="Como foi o treino? Alguma observação especial?"
              className="input-field min-h-[100px] resize-none"
              rows={4}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCancel}
              className="flex-1 py-2 px-4 bg-dark-medium text-light rounded-lg flex items-center justify-center"
            >
              <FiX className="mr-2" />
              Cancelar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              className="flex-1 btn-primary flex items-center justify-center"
            >
              <FiSave className="mr-2" />
              Salvar
            </motion.button>
          </div>
        </div>
      ) : (
        <div>
          {notes ? (
            <div className="bg-dark-light p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{notes}</pre>
            </div>
          ) : (
            <div className="text-center py-6 text-light-darker">
              <FiEdit3 className="mx-auto mb-2" size={24} />
              <p>Nenhuma nota ainda</p>
              <p className="text-xs mt-1">Clique no ícone para adicionar suas observações</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkoutNotes;