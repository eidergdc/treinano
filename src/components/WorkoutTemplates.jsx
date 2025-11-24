import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlay, FiEdit2, FiTrash2, FiPlus, FiCopy } from 'react-icons/fi';
import { GiWeightLiftingUp } from 'react-icons/gi';
import { toast } from 'react-toastify';

const defaultTemplates = [
  {
    id: 'push',
    name: 'Push (Empurrar)',
    description: 'Peito, Ombros e Tríceps',
    categories: ['Peito', 'Ombros', 'Tríceps'],
    color: '#FF4500',
    estimatedTime: 45
  },
  {
    id: 'pull',
    name: 'Pull (Puxar)',
    description: 'Costas e Bíceps',
    categories: ['Costas', 'Bíceps'],
    color: '#4A90E2',
    estimatedTime: 40
  },
  {
    id: 'legs',
    name: 'Legs (Pernas)',
    description: 'Pernas completo',
    categories: ['Pernas', 'Glúteos', 'Panturrilha'],
    color: '#28A745',
    estimatedTime: 50
  },
  {
    id: 'upper',
    name: 'Upper Body',
    description: 'Parte superior completa',
    categories: ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps'],
    color: '#6F42C1',
    estimatedTime: 60
  },
  {
    id: 'fullbody',
    name: 'Full Body',
    description: 'Corpo inteiro',
    categories: ['Peito', 'Costas', 'Pernas', 'Ombros'],
    color: '#FD7E14',
    estimatedTime: 70
  }
];

const WorkoutTemplates = ({ onSelectTemplate, userExercises = [] }) => {
  const [customTemplates, setCustomTemplates] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    categories: [],
    color: '#FF4500'
  });

  const allTemplates = [...defaultTemplates, ...customTemplates];

  // Contar exercícios disponíveis para cada template
  const getAvailableExercises = (categories) => {
    return userExercises.filter(exercise => 
      categories.includes(exercise.exercise.category)
    ).length;
  };

  const handleSelectTemplate = (template) => {
    const availableExercises = getAvailableExercises(template.categories);
    
    if (availableExercises === 0) {
      toast.error(`Você não tem exercícios cadastrados para ${template.name}`);
      return;
    }

    onSelectTemplate(template);
    toast.success(`Template "${template.name}" selecionado!`);
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.name || newTemplate.categories.length === 0) {
      toast.error('Nome e pelo menos uma categoria são obrigatórios');
      return;
    }

    const template = {
      id: `custom-${Date.now()}`,
      ...newTemplate,
      isCustom: true,
      estimatedTime: newTemplate.categories.length * 15
    };

    setCustomTemplates(prev => [...prev, template]);
    setShowCreateModal(false);
    setNewTemplate({
      name: '',
      description: '',
      categories: [],
      color: '#FF4500'
    });
    toast.success('Template personalizado criado!');
  };

  const handleDeleteTemplate = (templateId) => {
    setCustomTemplates(prev => prev.filter(t => t.id !== templateId));
    toast.success('Template removido');
  };

  const categories = [
    'Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 
    'Tríceps', 'Antebraço', 'Abdômen', 'Glúteos', 'Panturrilha', 'Cardio'
  ];

  const colors = [
    '#FF4500', '#4A90E2', '#28A745', '#6F42C1', 
    '#FD7E14', '#DC3545', '#20C997', '#6610F2'
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">Templates de Treino</h2>
          <p className="text-light-darker text-sm">Escolha um template ou crie o seu próprio</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="btn-secondary flex items-center"
        >
          <FiPlus className="mr-2" />
          Criar Template
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allTemplates.map((template) => {
          const availableExercises = getAvailableExercises(template.categories);
          
          return (
            <motion.div
              key={template.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="card relative group cursor-pointer"
              style={{ borderLeft: `4px solid ${template.color}` }}
              onClick={() => handleSelectTemplate(template)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{template.name}</h3>
                  <p className="text-light-darker text-sm">{template.description}</p>
                </div>
                
                {template.isCustom && (
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTemplate(template.id);
                      }}
                      className="p-1 rounded-full bg-dark-medium hover:bg-red-600 transition-colors"
                    >
                      <FiTrash2 className="text-red-500" size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {template.categories.map((category) => (
                  <span
                    key={category}
                    className="px-2 py-1 bg-dark-light text-xs rounded-full"
                    style={{ color: template.color }}
                  >
                    {category}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center text-light-darker">
                  <GiWeightLiftingUp className="mr-1" size={16} />
                  <span>{availableExercises} exercícios</span>
                </div>
                <div className="flex items-center text-light-darker">
                  <span>~{template.estimatedTime}min</span>
                </div>
              </div>

              {availableExercises === 0 && (
                <div className="absolute inset-0 bg-dark-medium bg-opacity-80 rounded-lg flex items-center justify-center">
                  <p className="text-light-darker text-center">
                    Nenhum exercício<br />disponível
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Create Template Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-lighter rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">Criar Template Personalizado</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-light-darker mb-1">
                    Nome do Template
                  </label>
                  <input
                    type="text"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                    className="input-field"
                    placeholder="Ex: Meu Treino ABC"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-light-darker mb-1">
                    Descrição
                  </label>
                  <input
                    type="text"
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                    className="input-field"
                    placeholder="Ex: Treino focado em força"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-light-darker mb-2">
                    Grupos Musculares
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <motion.button
                        key={category}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          const isSelected = newTemplate.categories.includes(category);
                          setNewTemplate({
                            ...newTemplate,
                            categories: isSelected
                              ? newTemplate.categories.filter(c => c !== category)
                              : [...newTemplate.categories, category]
                          });
                        }}
                        className={`p-2 rounded-lg text-sm transition-all ${
                          newTemplate.categories.includes(category)
                            ? 'bg-primary text-white'
                            : 'bg-dark-light text-light-darker hover:bg-dark-medium'
                        }`}
                      >
                        {category}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-light-darker mb-2">
                    Cor do Template
                  </label>
                  <div className="flex space-x-2">
                    {colors.map((color) => (
                      <motion.button
                        key={color}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setNewTemplate({...newTemplate, color})}
                        className={`w-8 h-8 rounded-full border-2 ${
                          newTemplate.color === color ? 'border-white' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 px-4 bg-dark-medium text-light rounded-lg"
                >
                  Cancelar
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCreateTemplate}
                  className="flex-1 btn-primary"
                >
                  Criar Template
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkoutTemplates;