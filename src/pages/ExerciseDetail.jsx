import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiBarChart2, FiCheck, FiEdit2, FiTrash2, FiX, FiVideo } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useFirebaseAuthStore } from '../stores/firebaseAuthStore';
import { useWorkoutStore } from '../stores/workoutStore';
import ProgressBar from '../components/ProgressBar';

const ExerciseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useFirebaseAuthStore();
  const { 
    fetchUserExercises, 
    userExercises, 
    loading,
    updateExerciseProgress,
    deleteUserExercise,
    updateUserExercise
  } = useWorkoutStore();
  
  const [userExercise, setUserExercise] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [editTab, setEditTab] = useState('training'); // 'training' ou 'details'
  const [editForm, setEditForm] = useState({
    weight: '',
    sets: '',
    reps: '',
    weightUnit: 'lbs',
    name: '',
    description: '',
    category: '',
    imageUrl: '',
    videoUrl: ''
  });

  useEffect(() => {
    if (user) {
      fetchUserExercises(user.uid);
    }
  }, [user]);

  useEffect(() => {
    if (userExercises.length > 0) {
      const exercise = userExercises.find(ex => ex.id === id);
      if (exercise) {
        setUserExercise(exercise);
        setEditForm({
          weight: exercise.current_weight,
          sets: exercise.current_sets,
          reps: exercise.current_reps,
          weightUnit: exercise.weight_unit || 'lbs',
          name: exercise.exercise.name,
          description: exercise.exercise.description || '',
          category: exercise.exercise.category,
          imageUrl: exercise.exercise.image_url || '',
          videoUrl: exercise.exercise.video_url || ''
        });
      } else {
        navigate('/exercises');
        toast.error('Exercício não encontrado');
      }
    }
  }, [userExercises, id]);

  // Calcular o progresso com base no nível e treinos completados
  const getProgressInfo = () => {
    if (!userExercise) return { progressText: '', nextProgressText: '' };
    
    const { progress_level, completed_workouts, current_sets, current_reps } = userExercise;
    
    // Usar os valores reais configurados pelo usuário
    const actualSets = current_sets || userExercise.currentSets || 3;
    const actualReps = current_reps || userExercise.currentReps || 8;
    const progressText = `${actualSets}x${actualReps}`;
    
    let nextProgressText = '';
    
    if (progress_level === 0) {
      nextProgressText = `${actualSets}x${actualReps + 2}`;
    } else if (progress_level === 1) {
      nextProgressText = `${actualSets}x${actualReps + 2}`;
    } else if (progress_level === 2) {
      const currentWeight = userExercise.current_weight || userExercise.currentWeight || 0;
      const weightUnit = userExercise.weight_unit || userExercise.weightUnit || 'lbs';
      const increment = weightUnit === 'kg' ? 2.5 : 5;
      nextProgressText = `3x8 (${currentWeight + increment}${weightUnit})`;
    }
    
    return { progressText, nextProgressText };
  };

  // Formatar data de adição
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Data inválida' : date.toLocaleDateString('pt-BR');
  };

  // Remover exercício
  const handleDeleteExercise = async () => {
    try {
      await deleteUserExercise(user.uid, userExercise.id);
      toast.success('Exercício removido com sucesso');
      navigate('/exercises');
    } catch (error) {
      toast.error('Erro ao remover exercício');
    }
  };

  // Atualizar exercício
  const handleUpdateExercise = async () => {
    try {
      if (editTab === 'training') {
        if (!editForm.weight || !editForm.sets || !editForm.reps) {
          toast.error('Por favor, preencha todos os campos de treino');
          return;
        }

        const updatedData = {
          current_weight: parseFloat(editForm.weight),
          current_sets: parseInt(editForm.sets),
          current_reps: parseInt(editForm.reps),
          weight_unit: editForm.weightUnit,
        };

        await updateUserExercise(user.uid, userExercise.id, updatedData);
        toast.success('Dados de treino atualizados com sucesso');
      } else {
        if (!editForm.name || !editForm.category) {
          toast.error('Nome e categoria são obrigatórios');
          return;
        }

        // Atualizar dados do exercício base
        await updateExerciseDetails(userExercise.exercise.id, {
          name: editForm.name,
          description: editForm.description,
          category: editForm.category,
          image_url: editForm.imageUrl,
          video_url: editForm.videoUrl
        });
        
        toast.success('Detalhes do exercício atualizados com sucesso');
      }
      
      setShowEditModal(false);
      // Recarregar dados
      await fetchUserExercises(user.uid);
    } catch (error) {
      toast.error('Erro ao atualizar exercício');
    }
  };

  // Função para atualizar detalhes do exercício (precisará ser implementada no store)
  const updateExerciseDetails = async (exerciseId, updateData) => {
    try {
      // Esta função precisará ser implementada no workoutStore
      // Por enquanto, vamos simular a atualização
      console.log('Updating exercise details:', exerciseId, updateData);
      
      // TODO: Implementar no Firebase/Supabase
      // await updateDoc(doc(db, 'exercises', exerciseId), updateData);
      
      return true;
    } catch (error) {
      console.error('Error updating exercise details:', error);
      throw error;
    }
  };

  const categories = [
    'Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 
    'Tríceps', 'Antebraço', 'Abdômen', 'Glúteos', 
    'Panturrilha', 'Cardio', 'Outro'
  ];

  if (loading || !userExercise) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const { progressText, nextProgressText } = getProgressInfo();

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <Link to="/exercises" className="flex items-center text-light-darker hover:text-light mb-4">
          <FiArrowLeft className="mr-2" />
          Voltar para Exercícios
        </Link>
        
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{userExercise.exercise.name}</h1>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowEditModal(true)}
            className="p-2 rounded-full bg-dark-medium hover:bg-dark-light transition-colors"
          >
            <FiEdit2 className="text-primary" size={20} />
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-6"
      >
        {userExercise.exercise.video_url ? (
          <div 
            className="relative w-full h-48 bg-dark-medium rounded-xl cursor-pointer overflow-hidden"
            onClick={() => setShowVideoModal(true)}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <FiVideo className="text-primary" size={48} />
            </div>
            <div className="absolute bottom-4 left-4 bg-dark-lighter px-3 py-1 rounded-full">
              <span className="text-sm">Clique para ver o vídeo</span>
            </div>
          </div>
        ) : userExercise.exercise.image_url ? (
          <img 
            src={userExercise.exercise.image_url} 
            alt={userExercise.exercise.name} 
            className="w-full h-48 object-cover rounded-xl"
          />
        ) : (
          <div className="w-full h-48 bg-dark-medium rounded-xl flex items-center justify-center">
            <FiBarChart2 size={48} className="text-primary" />
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="card mb-6"
      >
        <h2 className="text-lg font-bold mb-4">Detalhes do Exercício</h2>
        
        <div className="space-y-4">
          <div>
            <p className="text-light-darker text-sm">Descrição</p>
            <p>{userExercise.exercise.description || 'Sem descrição disponível'}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-light-darker text-sm">Peso Atual</p>
              <p className="text-xl font-bold">
                {userExercise.current_weight || userExercise.currentWeight || 0} {userExercise.weight_unit || userExercise.weightUnit || 'lbs'}
              </p>
            </div>
            
            <div>
              <p className="text-light-darker text-sm">Repetições</p>
              <p className="text-xl font-bold">{progressText}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-light-darker text-sm">Séries</p>
              <p className="text-xl font-bold">
                {userExercise.current_sets || userExercise.currentSets || 3}
              </p>
            </div>
            
            <div>
              <p className="text-light-darker text-sm">Repetições por Série</p>
              <p className="text-xl font-bold">
                {userExercise.current_reps || userExercise.currentReps || 8}
              </p>
            </div>
          </div>
          
          <div>
            <p className="text-light-darker text-sm">Adicionado em</p>
            <p>{formatDate(userExercise.created_at || userExercise.createdAt)}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="card mb-6"
      >
        <h2 className="text-lg font-bold mb-4">Progresso</h2>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Treinos Completados</span>
              <span>{userExercise.completed_workouts || userExercise.completedWorkouts || 0} de 10</span>
            </div>
            <ProgressBar 
              value={userExercise.completed_workouts || userExercise.completedWorkouts || 0} 
              max={10} 
              showLabel={false}
            />
          </div>
          
          <div className="bg-dark-light p-4 rounded-lg">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-secondary bg-opacity-20 flex items-center justify-center mr-3">
                <FiBarChart2 className="text-secondary" size={20} />
              </div>
              <div>
                <p className="text-sm text-light-darker">Próximo Nível</p>
                <p className="font-bold">{nextProgressText}</p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => updateExerciseProgress(userExercise.id, true)}
              className="flex-1 btn-primary flex items-center justify-center"
            >
              <FiCheck className="mr-2" />
              Marcar Treino
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowDeleteModal(true)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300 flex items-center justify-center"
            >
              <FiTrash2 className="mr-2" />
              Remover
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideoModal && userExercise.exercise.video_url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
            onClick={() => setShowVideoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-lighter rounded-xl p-6 w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{userExercise.exercise.name}</h2>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="p-2 hover:bg-dark-medium rounded-full transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="relative pt-[56.25%]">
                <iframe
                  src={userExercise.exercise.video_url}
                  className="absolute inset-0 w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-lighter rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Editar Exercício</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditTab('training')}
                    className={`px-3 py-1 rounded-full text-sm ${
                      editTab === 'training' 
                        ? 'bg-primary text-white' 
                        : 'bg-dark-medium text-light-darker'
                    }`}
                  >
                    Treino
                  </button>
                  <button
                    onClick={() => setEditTab('details')}
                    className={`px-3 py-1 rounded-full text-sm ${
                      editTab === 'details' 
                        ? 'bg-primary text-white' 
                        : 'bg-dark-medium text-light-darker'
                    }`}
                  >
                    Detalhes
                  </button>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-dark-medium rounded-full transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              {editTab === 'training' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-light-darker mb-1">
                      Peso
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={editForm.weight}
                        onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                        step="0.5"
                        min="0"
                        className="input-field flex-1"
                        placeholder={editForm.weightUnit === 'kg' ? "Ex: 10" : "Ex: 22"}
                      />
                      <select
                        value={editForm.weightUnit}
                        onChange={(e) => {
                          const newUnit = e.target.value;
                          let convertedWeight = editForm.weight;
                          
                          // Converter peso se já houver um valor
                          if (convertedWeight && !isNaN(convertedWeight)) {
                            if (newUnit === 'kg' && editForm.weightUnit === 'lbs') {
                              // lbs para kg
                              convertedWeight = (parseFloat(convertedWeight) * 0.453592).toFixed(1);
                            } else if (newUnit === 'lbs' && editForm.weightUnit === 'kg') {
                              // kg para lbs
                              convertedWeight = (parseFloat(convertedWeight) * 2.20462).toFixed(1);
                            }
                          }
                          
                          setEditForm({
                            ...editForm, 
                            weightUnit: newUnit,
                            weight: convertedWeight
                          });
                        }}
                        className="input-field w-20"
                      >
                        <option value="lbs">lbs</option>
                        <option value="kg">kg</option>
                      </select>
                    </div>
                    <p className="text-xs text-light-darker mt-1">
                      {editForm.weightUnit === 'lbs' 
                        ? 'Peso em libras (padrão americano)'
                        : 'Peso em quilogramas (padrão métrico)'
                      }
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-light-darker mb-1">
                      Séries
                    </label>
                    <input
                      type="number"
                      value={editForm.sets}
                      onChange={(e) => setEditForm({ ...editForm, sets: e.target.value })}
                      min="1"
                      max="10"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-light-darker mb-1">
                      Repetições
                    </label>
                    <input
                      type="number"
                      value={editForm.reps}
                      onChange={(e) => setEditForm({ ...editForm, reps: e.target.value })}
                      min="1"
                      max="50"
                      className="input-field"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-light-darker mb-1">
                      Nome do Exercício
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="input-field"
                      placeholder="Ex: Supino Reto"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-light-darker mb-1">
                      Descrição
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="input-field min-h-[80px] resize-none"
                      placeholder="Descreva como realizar o exercício..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-light-darker mb-1">
                      Categoria
                    </label>
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className="input-field"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-light-darker mb-1">
                      URL da Imagem
                    </label>
                    <input
                      type="url"
                      value={editForm.imageUrl}
                      onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                      className="input-field"
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                    {editForm.imageUrl && (
                      <div className="mt-2">
                        <img
                          src={editForm.imageUrl}
                          alt="Preview"
                          className="w-20 h-20 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-light-darker mb-1">
                      URL do Vídeo (YouTube)
                    </label>
                    <input
                      type="url"
                      value={editForm.videoUrl}
                      onChange={(e) => setEditForm({ ...editForm, videoUrl: e.target.value })}
                      className="input-field"
                      placeholder="https://www.youtube.com/embed/ID_DO_VIDEO"
                    />
                    <p className="text-xs text-light-darker mt-1">
                      Use o formato de incorporação do YouTube
                    </p>
                  </div>
                </div>
              )}

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-2 px-4 bg-dark-medium text-light rounded-lg"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleUpdateExercise}
                    className="flex-1 btn-primary"
                  >
                    Salvar
                  </motion.button>
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-lighter rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <>
              <h2 className="text-xl font-bold mb-4">Remover Exercício</h2>
              
              <p className="mb-6">
                Tem certeza que deseja remover <span className="font-bold">{userExercise.exercise.name}</span> dos seus exercícios? Esta ação não pode ser desfeita.
              </p>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2 px-4 bg-dark-medium text-light rounded-lg"
                >
                  Cancelar
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDeleteExercise}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
                >
                  Remover
                </motion.button>
              </div>
              </>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExerciseDetail;