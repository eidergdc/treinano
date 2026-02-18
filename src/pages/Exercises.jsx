import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiSearch } from 'react-icons/fi';
import { useFirebaseAuthStore } from '../stores/firebaseAuthStore';
import { useWorkoutStore } from '../stores/workoutStore';
import ExerciseCard from '../components/ExerciseCard';
import ImageUpload from '../components/ImageUpload';
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

const Exercises = () => {
  const { user } = useFirebaseAuthStore();
  const {
    fetchUserExercises,
    createCustomExercise,
    deleteUserExercise,
    userExercises,
    loading
  } = useWorkoutStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [newExercise, setNewExercise] = useState({
    name: '',
    description: '',
    category: '',
    imageUrl: '',
    videoUrl: '',
    initialWeight: '',
    weightUnit: 'lbs'
  });

  useEffect(() => {
    if (user) {
      console.log('🔄 Exercises page: Carregando exercícios do usuário...');
      fetchUserExercises(user.uid);
    }
  }, [user]);

  // Filtrar exercícios
  const filteredExercises = userExercises.filter(exercise => {
    const matchesSearch = exercise.exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' ? true : exercise.exercise.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Criar exercício personalizado
  const handleCreateExercise = async () => {
    console.log('🚀 === CRIANDO EXERCÍCIO PERSONALIZADO ===');
    console.log('📝 Dados do exercício:', newExercise);
    console.log('👤 Usuário:', user?.uid);

    if (!newExercise.name || !newExercise.category || !newExercise.initialWeight) {
      console.error('❌ Campos obrigatórios não preenchidos');
      toast.error('Por favor, preencha os campos obrigatórios');
      return;
    }

    try {
      const exerciseData = {
        name: newExercise.name,
        description: newExercise.description,
        category: newExercise.category,
        imageUrl: newExercise.imageUrl,
        videoUrl: newExercise.videoUrl,
        initialWeight: parseFloat(newExercise.initialWeight),
        weightUnit: newExercise.weightUnit
      };

      console.log('📤 Enviando dados para createCustomExercise:', exerciseData);
      const result = await createCustomExercise(user.uid, exerciseData);
      console.log('✅ Exercício criado com sucesso:', result);

      setShowCreateModal(false);
      setNewExercise({
        name: '',
        description: '',
        category: '',
        imageUrl: '',
        videoUrl: '',
        initialWeight: '',
        weightUnit: 'lbs'
      });

      toast.success('Exercício personalizado criado com sucesso');
    } catch (error) {
      console.error('❌ === ERRO AO CRIAR EXERCÍCIO ===');
      console.error('❌ Erro completo:', error);
      toast.error('Erro ao criar exercício personalizado');
    }
  };

  // Excluir exercício
  const handleDeleteExercise = async (exerciseId) => {
    try {
      console.log('🗑️ Excluindo exercício:', exerciseId);
      await deleteUserExercise(user.uid, exerciseId);
      toast.success('Exercício excluído com sucesso');
    } catch (error) {
      console.error('❌ Erro ao excluir exercício:', error);
      toast.error('Erro ao excluir exercício');
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
        <h1 className="text-2xl font-bold mb-1">Exercícios</h1>
        <p className="text-light-darker">Gerencie seus exercícios de treino</p>
      </motion.div>

      {/* Create Exercise Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-6"
      >
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowCreateModal(true)}
          className="btn-primary w-full flex items-center justify-center py-4"
        >
          <FiPlus className="mr-2" size={24} />
          Criar Novo Exercício
        </motion.button>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="mb-6"
      >
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-light-darker" />
          </div>
          <input
            type="text"
            placeholder="Buscar exercícios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory('Todos')}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              selectedCategory === 'Todos'
                ? 'bg-primary text-white'
                : 'bg-dark-light text-light-darker'
            }`}
          >
            Todos
          </motion.button>
          
          {categories.map((category) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-dark-light text-light-darker'
              }`}
            >
              {category}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Exercise List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredExercises.length > 0 ? (
          <div className="space-y-3">
            {filteredExercises.map((exercise) => (
              <ExerciseCard 
                key={exercise.id}
                exercise={exercise} 
                showProgress={true}
              />
            ))}
          </div>
        ) : (
          <div className="card text-center py-8">
            <p className="text-light-darker mb-4">
              {searchTerm || selectedCategory !== 'Todos' 
                ? 'Nenhum exercício encontrado com os filtros atuais'
                : 'Você ainda não tem exercícios'}
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <FiPlus className="mr-2 inline" />
              Criar Primeiro Exercício
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Create Exercise Modal */}
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
              <h2 className="text-xl font-bold mb-4">Criar Novo Exercício</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-light-darker mb-1">
                    Nome do Exercício *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={newExercise.name}
                    onChange={(e) => setNewExercise({...newExercise, name: e.target.value})}
                    className="input-field"
                    placeholder="Ex: Supino Reto"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-light-darker mb-1">
                    Descrição
                  </label>
                  <textarea
                    id="description"
                    value={newExercise.description}
                    onChange={(e) => setNewExercise({...newExercise, description: e.target.value})}
                    className="input-field min-h-[80px]"
                    placeholder="Descreva como realizar o exercício..."
                  />
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-light-darker mb-1">
                    Categoria *
                  </label>
                  <select
                    id="category"
                    value={newExercise.category}
                    onChange={(e) => setNewExercise({...newExercise, category: e.target.value})}
                    className="input-field"
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-light-darker mb-1">
                    Imagem e Vídeo
                  </label>
                  <ImageUpload
                    onImageSelect={async (url) => {
                      if (!url) {
                        setNewExercise(prev => ({ ...prev, imageUrl: '' }));
                        return;
                      }
                      setNewExercise(prev => ({ ...prev, imageUrl: url }));
                    }}
                    onVideoSelect={(url) => {
                      setNewExercise(prev => ({ ...prev, videoUrl: url }));
                    }}
                    currentImage={newExercise.imageUrl}
                    bucket="exercises"
                  />
                </div>
                
                <div>
                  <label htmlFor="initialWeight" className="block text-sm font-medium text-light-darker mb-1">
                    Peso Inicial *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      id="initialWeight"
                      type="number"
                      value={newExercise.initialWeight}
                      onChange={(e) => setNewExercise({...newExercise, initialWeight: e.target.value})}
                      className="input-field flex-1"
                      placeholder={newExercise.weightUnit === 'kg' ? "Ex: 10" : "Ex: 22"}
                      step="0.5"
                      min="0"
                      required
                    />
                    <select
                      value={newExercise.weightUnit}
                      onChange={(e) => {
                        const newUnit = e.target.value;
                        let convertedWeight = newExercise.initialWeight;
                        
                        // Converter peso se já houver um valor
                        if (convertedWeight && !isNaN(convertedWeight)) {
                          if (newUnit === 'kg' && newExercise.weightUnit === 'lbs') {
                            // lbs para kg
                            convertedWeight = (parseFloat(convertedWeight) * 0.453592).toFixed(1);
                          } else if (newUnit === 'lbs' && newExercise.weightUnit === 'kg') {
                            // kg para lbs
                            convertedWeight = (parseFloat(convertedWeight) * 2.20462).toFixed(1);
                          }
                        }
                        
                        setNewExercise({
                          ...newExercise, 
                          weightUnit: newUnit,
                          initialWeight: convertedWeight
                        });
                      }}
                      className="input-field w-20"
                    >
                      <option value="lbs">lbs</option>
                      <option value="kg">kg</option>
                    </select>
                  </div>
                  <p className="text-xs text-light-darker mt-1">
                    {newExercise.weightUnit === 'lbs' 
                      ? 'Peso em libras (padrão americano)'
                      : 'Peso em quilogramas (padrão métrico)'
                    }
                  </p>
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
                  onClick={handleCreateExercise}
                  className="flex-1 btn-primary"
                >
                  Criar Exercício
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Exercises;