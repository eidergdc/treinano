import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../supabase';

const CreateExercise = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    image_url: '',
    video_url: '',
    starting_weight: 0,
    target_sets: 3,
    target_reps: 8,
    rest_time: 90,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const categories = [
    'Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 'Tríceps', 
    'Antebraço', 'Abdômen', 'Glúteos', 'Panturrilha', 'Cardio', 'Outro'
  ];

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImageFile(file);
    
    // Criar preview da imagem
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('Você precisa estar logado para criar um exercício');
      return;
    }
    
    if (!formData.name || !formData.category) {
      setError('Nome e categoria são obrigatórios');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      let imageUrl = formData.image_url;
      
      // Upload da imagem se existir
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `exercises/${user.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('exercise-images')
          .upload(filePath, imageFile);
          
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('exercise-images')
          .getPublicUrl(filePath);
          
        imageUrl = urlData.publicUrl;
      }
      
      // Criar exercício
      const { data, error } = await supabase
        .from('exercises')
        .insert([
          {
            user_id: user.id,
            name: formData.name,
            category: formData.category,
            description: formData.description,
            image_url: imageUrl,
            video_url: formData.video_url,
            starting_weight: formData.starting_weight,
            current_weight: formData.starting_weight,
            target_sets: formData.target_sets,
            target_reps: formData.target_reps,
            rest_time: formData.rest_time,
            progress: 0,
            created_at: new Date(),
          }
        ])
        .select();
        
      if (error) throw error;
      
      // Redirecionar para a página do exercício
      navigate(`/exercises/${data[0].id}`);
    } catch (error) {
      console.error('Erro ao criar exercício:', error);
      setError('Falha ao criar exercício. ' + (error.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <Link to="/exercises" className="inline-flex items-center text-text-secondary hover:text-text-primary transition-colors mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar para exercícios
        </Link>
        
        <h1 className="text-3xl font-bold">Criar Novo Exercício</h1>
        <p className="text-text-secondary mt-2">
          Adicione um novo exercício para acompanhar seu progresso
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-background-paper rounded-lg shadow-lg p-6"
      >
        {error && (
          <div className="p-4 mb-6 bg-error bg-opacity-10 border border-error rounded-lg text-error">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Informações Básicas</h2>
              
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">
                  Nome do Exercício *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-background-elevated rounded-md bg-background-DEFAULT focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT"
                  placeholder="Ex: Supino Reto"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-medium text-text-secondary mb-1">
                  Categoria *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-background-elevated rounded-md bg-background-DEFAULT focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-1">
                  Descrição
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-background-elevated rounded-md bg-background-DEFAULT focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT"
                  placeholder="Descreva como realizar o exercício corretamente..."
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label htmlFor="image" className="block text-sm font-medium text-text-secondary mb-1">
                  Imagem
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="image"
                    className="px-4 py-2 bg-background-elevated hover:bg-background-DEFAULT transition-colors rounded-md cursor-pointer"
                  >
                    Escolher arquivo
                  </label>
                  <span className="text-sm text-text-secondary">
                    {imageFile ? imageFile.name : 'Nenhum arquivo selecionado'}
                  </span>
                </div>
                {imagePreview && (
                  <div className="mt-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-32 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="image_url" className="block text-sm font-medium text-text-secondary mb-1">
                  URL da Imagem (alternativa)
                </label>
                <input
                  type="url"
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-background-elevated rounded-md bg-background-DEFAULT focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="video_url" className="block text-sm font-medium text-text-secondary mb-1">
                  URL do Vídeo (YouTube)
                </label>
                <input
                  type="url"
                  id="video_url"
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-background-elevated rounded-md bg-background-DEFAULT focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT"
                  placeholder="https://www.youtube.com/embed/..."
                />
                <p className="text-xs text-text-secondary mt-1">
                  Use o formato de incorporação: https://www.youtube.com/embed/ID_DO_VIDEO
                </p>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold mb-4">Configurações de Treino</h2>
              
              <div className="mb-4">
                <label htmlFor="starting_weight" className="block text-sm font-medium text-text-secondary mb-1">
                  Peso Inicial (kg)
                </label>
                <input
                  type="number"
                  id="starting_weight"
                  name="starting_weight"
                  value={formData.starting_weight}
                  onChange={handleChange}
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 border border-background-elevated rounded-md bg-background-DEFAULT focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="target_sets" className="block text-sm font-medium text-text-secondary mb-1">
                  Séries Alvo
                </label>
                <input
                  type="number"
                  id="target_sets"
                  name="target_sets"
                  value={formData.target_sets}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  className="w-full px-3 py-2 border border-background-elevated rounded-md bg-background-DEFAULT focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="target_reps" className="block text-sm font-medium text-text-secondary mb-1">
                  Repetições Alvo
                </label>
                <input
                  type="number"
                  id="target_reps"
                  name="target_reps"
                  value={formData.target_reps}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 border border-background-elevated rounded-md bg-background-DEFAULT focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="rest_time" className="block text-sm font-medium text-text-secondary mb-1">
                  Tempo de Descanso (segundos)
                </label>
                <input
                  type="number"
                  id="rest_time"
                  name="rest_time"
                  value={formData.rest_time}
                  onChange={handleChange}
                  min="0"
                  max="300"
                  className="w-full px-3 py-2 border border-background-elevated rounded-md bg-background-DEFAULT focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT"
                />
              </div>
              
              <div className="bg-background-elevated p-4 rounded-lg mb-6">
                <h3 className="font-medium mb-3">Sistema de Progressão</h3>
                <p className="text-text-secondary text-sm mb-3">
                  O sistema de progressão padrão funciona da seguinte forma:
                </p>
                <ul className="text-sm text-text-secondary space-y-2">
                  <li className="flex items-start">
                    <span className="text-primary-DEFAULT mr-2">•</span>
                    Comece com 3 séries de 8 repetições
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-DEFAULT mr-2">•</span>
                    Quando completar 10 treinos, avance para 3 séries de 10 repetições
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-DEFAULT mr-2">•</span>
                    Quando completar mais 10 treinos, avance para 3 séries de 12 repetições
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-DEFAULT mr-2">•</span>
                    Após completar mais 10 treinos, aumente o peso e volte para 3x8
                  </li>
                </ul>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Link
                  to="/exercises"
                  className="px-6 py-3 bg-background-elevated hover:bg-background-DEFAULT transition-colors rounded-lg font-medium"
                >
                  Cancelar
                </Link>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-primary-DEFAULT text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 btn-3d"
                >
                  {loading ? 'Criando...' : 'Criar Exercício'}
                </motion.button>
              </div>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateExercise;