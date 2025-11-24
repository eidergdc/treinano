import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiEdit2, FiLogOut, FiCalendar, FiClock, FiAward, FiRefreshCw } from 'react-icons/fi';
import { GiWeightLiftingUp } from 'react-icons/gi';
import { toast } from 'react-toastify';
import { useFirebaseAuthStore } from '../stores/firebaseAuthStore';
import { useWorkoutStore } from '../stores/workoutStore';
import ImageUpload from '../components/ImageUpload';

const Profile = () => {
  const { user, signOut, updateProfile } = useFirebaseAuthStore();
  const { 
    fetchWorkoutHistory, 
    workoutHistory,
    updateRestTimes,
    restTimeBetweenSets,
    restTimeBetweenExercises
  } = useWorkoutStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedRestTimeBetweenSets, setSelectedRestTimeBetweenSets] = useState(restTimeBetweenSets);
  const [selectedRestTimeBetweenExercises, setSelectedRestTimeBetweenExercises] = useState(restTimeBetweenExercises);
  const [isEditingRestTime, setIsEditingRestTime] = useState(false);
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({
    height: '',
    weight: '',
    target_weight: '',
    age: '',
    goal: '',
    experience_level: '',
    training_time: '',
    preferred_time: '',
    favorite_exercises: [],
    motivation: '',
    weekly_goal: 3,
    bio: ''
  });
  
  useEffect(() => {
    if (user) {
      // Tentar pegar o nome de várias fontes possíveis
      const userName = user.profile?.username || 
                      user.displayName || 
                      user.user_metadata?.name || 
                      '';
      
      const userAvatar = user.profile?.avatar_url || 
                        user.user_metadata?.avatar_url || 
                        '';
      
      console.log('👤 Dados do usuário carregados:');
      console.log('   - Nome:', userName);
      console.log('   - Avatar:', userAvatar);
      console.log('   - Profile completo:', user.profile);
      
      setName(userName);
      setAvatarUrl(userAvatar);
      
      // Carregar informações pessoais
      if (user.profile) {
        setPersonalInfo({
          height: user.profile.height || '',
          weight: user.profile.weight || '',
          target_weight: user.profile.target_weight || '',
          age: user.profile.age || '',
          goal: user.profile.goal || '',
          experience_level: user.profile.experience_level || '',
          training_time: user.profile.training_time || '',
          preferred_time: user.profile.preferred_time || '',
          favorite_exercises: user.profile.favorite_exercises || [],
          motivation: user.profile.motivation || '',
          weekly_goal: user.profile.weekly_goal || 3,
          bio: user.profile.bio || ''
        });
      }
      
      fetchWorkoutHistory(user.uid);
    }
  }, [user]);

  useEffect(() => {
    setSelectedRestTimeBetweenSets(restTimeBetweenSets);
    setSelectedRestTimeBetweenExercises(restTimeBetweenExercises);
  }, [restTimeBetweenSets, restTimeBetweenExercises]);

  const handleUpdateProfile = async () => {
    try {
      console.log('🚀 === INICIANDO ATUALIZAÇÃO DO PERFIL ===');
      console.log('📝 Nome digitado:', name);
      console.log('🖼️ Avatar URL:', avatarUrl);
      console.log('👤 Usuário atual:', user?.uid);
      
      if (!name.trim()) {
        console.warn('⚠️ ERRO: Nome está vazio');
        toast.error('Nome é obrigatório');
        return;
      }
      
      const profileData = {
        name: name.trim(),
        avatar_url: avatarUrl || '',
      };
      
      console.log('📤 Dados que serão enviados:', profileData);
      
      const result = await updateProfile(profileData);
      console.log('✅ SUCESSO - Resultado da atualização:', result);
      
      setIsEditing(false);
      console.log('🎉 === PERFIL ATUALIZADO COM SUCESSO ===');
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('❌ === ERRO NO HANDLEUPDATEPROFILE ===');
      console.error('❌ Erro completo:', error);
      toast.error(`Erro ao atualizar perfil: ${error.message}`);
    }
  };

  const handleUpdatePersonalInfo = async () => {
    try {
      const profileData = {
        ...personalInfo,
        height: personalInfo.height ? parseFloat(personalInfo.height) : null,
        weight: personalInfo.weight ? parseFloat(personalInfo.weight) : null,
        target_weight: personalInfo.target_weight ? parseFloat(personalInfo.target_weight) : null,
        age: personalInfo.age ? parseInt(personalInfo.age) : null,
        weekly_goal: personalInfo.weekly_goal ? parseInt(personalInfo.weekly_goal) : 3
      };
      
      await updateProfile(profileData);
      setIsEditingPersonalInfo(false);
      toast.success('Informações pessoais atualizadas com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar informações pessoais');
    }
  };

  const handleUpdateRestTimes = async ({ betweenSets, betweenExercises }) => {
    try {
      await updateRestTimes(user.uid, {
        betweenSets,
        betweenExercises
      });
      setIsEditingRestTime(false);
      toast.success('Tempos de descanso atualizados com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar tempos de descanso');
      setSelectedRestTimeBetweenSets(restTimeBetweenSets);
      setSelectedRestTimeBetweenExercises(restTimeBetweenExercises);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Logout realizado com sucesso');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  // Formatar tempo em minutos e segundos
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes === 0) {
      return `${seconds} segundos`;
    }
    if (remainingSeconds === 0) {
      return minutes === 1 ? '1 minuto' : `${minutes} minutos`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calculate stats
  const calculateStats = () => {
    if (!workoutHistory.length) {
      return {
        totalWorkouts: 0,
        totalTime: '0m',
        longestWorkout: '0m',
        averageTime: '0m',
        firstWorkout: 'N/A',
        lastWorkout: 'N/A',
        lastWorkoutGroup: 'Nenhum',
        daysSinceLastWorkout: 0,
      };
    }
    
    const totalWorkouts = workoutHistory.length;
    
    const totalSeconds = workoutHistory.reduce((acc, workout) => acc + (workout.duration || 0), 0);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalTime = totalHours > 0 
      ? `${totalHours}h ${totalMinutes % 60}m` 
      : `${totalMinutes}m`;
    
    const longestWorkout = Math.max(...workoutHistory.map(w => w.duration || 0));
    const longestMinutes = Math.floor(longestWorkout / 60);
    const longestHours = Math.floor(longestMinutes / 60);
    const longestTime = longestHours > 0 
      ? `${longestHours}h ${longestMinutes % 60}m` 
      : `${longestMinutes}m`;
    
    const avgSeconds = totalSeconds / totalWorkouts;
    const avgMinutes = Math.floor(avgSeconds / 60);
    const avgTime = `${avgMinutes}m`;
    
    const sortedWorkouts = [...workoutHistory].sort((a, b) => 
      new Date(a.start_time) - new Date(b.start_time)
    );
    
    const firstWorkout = new Date(sortedWorkouts[0].start_time).toLocaleDateString('pt-BR');
    const lastWorkout = new Date(sortedWorkouts[sortedWorkouts.length - 1].start_time).toLocaleDateString('pt-BR');
    
    // Informações do último treino
    const lastWorkoutData = sortedWorkouts[sortedWorkouts.length - 1];
    const lastWorkoutGroup = lastWorkoutData.category || 'Outro';
    
    // Calcular dias desde o último treino
    const lastWorkoutDate = new Date(lastWorkoutData.start_time);
    const today = new Date();
    const diffTime = Math.abs(today - lastWorkoutDate);
    const daysSinceLastWorkout = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      totalWorkouts,
      totalTime,
      longestWorkout: longestTime,
      averageTime: avgTime,
      firstWorkout,
      lastWorkout,
      lastWorkoutGroup,
      daysSinceLastWorkout,
    };
  };
  
  const stats = calculateStats();

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold mb-1">Perfil</h1>
        <p className="text-light-darker">Gerencie suas informações e veja estatísticas</p>
      </motion.div>

      {/* Profile Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="card mb-6"
      >
        <div className="flex items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-dark-medium flex items-center justify-center mr-4 overflow-hidden">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <FiUser size={40} className="text-primary" />
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="text-xl font-bold">
              {name || user?.displayName || user?.profile?.username || 'Usuário'}
            </h2>
            <p className="text-light-darker">{user?.email}</p>
          </div>
          
          {!isEditing && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsEditing(true)}
              className="w-10 h-10 rounded-full bg-dark-medium flex items-center justify-center"
            >
              <FiEdit2 className="text-primary" />
            </motion.button>
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-light-darker mb-1">
                Nome
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Seu nome"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-light-darker mb-2">
                Foto de Perfil
              </label>
              <ImageUpload
                onImageSelect={async (url) => {
                  if (!url) {
                    setAvatarUrl('');
                    return;
                  }
                  setAvatarUrl(url);
                }}
                currentImage={avatarUrl}
                bucket="avatars"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2 px-4 bg-dark-medium text-light rounded-lg"
              >
                Cancelar
              </button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleUpdateProfile}
                className="flex-1 btn-primary"
              >
                Salvar
              </motion.button>
            </div>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSignOut}
            className="btn-secondary w-full flex items-center justify-center"
          >
            <FiLogOut className="mr-2" />
            Sair da Conta
          </motion.button>
        )}
      </motion.div>

      {/* Personal Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="card mb-6"
      >
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mr-3">
            <FiUser className="text-primary" size={20} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">Informações Pessoais</h2>
          </div>
          {!isEditingPersonalInfo && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsEditingPersonalInfo(true)}
              className="w-10 h-10 rounded-full bg-dark-medium flex items-center justify-center"
            >
              <FiEdit2 className="text-primary" />
            </motion.button>
          )}
        </div>

        {isEditingPersonalInfo ? (
          <div className="space-y-4">
            {/* Informações Físicas */}
            <div>
              <h3 className="font-bold mb-3">Informações Físicas</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-light-darker mb-1">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    value={personalInfo.height}
                    onChange={(e) => setPersonalInfo({...personalInfo, height: e.target.value})}
                    className="input-field"
                    placeholder="Ex: 175"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-darker mb-1">
                    Idade
                  </label>
                  <input
                    type="number"
                    value={personalInfo.age}
                    onChange={(e) => setPersonalInfo({...personalInfo, age: e.target.value})}
                    className="input-field"
                    placeholder="Ex: 25"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-darker mb-1">
                    Peso Atual (kg)
                  </label>
                  <input
                    type="number"
                    value={personalInfo.weight}
                    onChange={(e) => setPersonalInfo({...personalInfo, weight: e.target.value})}
                    className="input-field"
                    placeholder="Ex: 70"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-darker mb-1">
                    Meta de Peso (kg)
                  </label>
                  <input
                    type="number"
                    value={personalInfo.target_weight}
                    onChange={(e) => setPersonalInfo({...personalInfo, target_weight: e.target.value})}
                    className="input-field"
                    placeholder="Ex: 75"
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            {/* Objetivos e Experiência */}
            <div>
              <h3 className="font-bold mb-3">Objetivos e Experiência</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-light-darker mb-1">
                    Objetivo Principal
                  </label>
                  <select
                    value={personalInfo.goal}
                    onChange={(e) => setPersonalInfo({...personalInfo, goal: e.target.value})}
                    className="input-field"
                  >
                    <option value="">Selecione seu objetivo</option>
                    <option value="ganhar_massa">Ganhar Massa Muscular</option>
                    <option value="perder_peso">Perder Peso</option>
                    <option value="definir">Definir Músculos</option>
                    <option value="forca">Ganhar Força</option>
                    <option value="resistencia">Melhorar Resistência</option>
                    <option value="saude">Manter Saúde</option>
                    <option value="reabilitacao">Reabilitação</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-light-darker mb-1">
                    Nível de Experiência
                  </label>
                  <select
                    value={personalInfo.experience_level}
                    onChange={(e) => setPersonalInfo({...personalInfo, experience_level: e.target.value})}
                    className="input-field"
                  >
                    <option value="">Selecione seu nível</option>
                    <option value="iniciante">Iniciante (0-6 meses)</option>
                    <option value="intermediario">Intermediário (6 meses - 2 anos)</option>
                    <option value="avancado">Avançado (2+ anos)</option>
                    <option value="expert">Expert (5+ anos)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-light-darker mb-1">
                    Há quanto tempo treina?
                  </label>
                  <select
                    value={personalInfo.training_time}
                    onChange={(e) => setPersonalInfo({...personalInfo, training_time: e.target.value})}
                    className="input-field"
                  >
                    <option value="">Selecione</option>
                    <option value="menos_3_meses">Menos de 3 meses</option>
                    <option value="3_6_meses">3-6 meses</option>
                    <option value="6_12_meses">6 meses - 1 ano</option>
                    <option value="1_2_anos">1-2 anos</option>
                    <option value="2_5_anos">2-5 anos</option>
                    <option value="mais_5_anos">Mais de 5 anos</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-light-darker mb-1">
                    Meta de Treinos por Semana
                  </label>
                  <select
                    value={personalInfo.weekly_goal}
                    onChange={(e) => setPersonalInfo({...personalInfo, weekly_goal: e.target.value})}
                    className="input-field"
                  >
                    <option value="2">2 treinos por semana</option>
                    <option value="3">3 treinos por semana</option>
                    <option value="4">4 treinos por semana</option>
                    <option value="5">5 treinos por semana</option>
                    <option value="6">6 treinos por semana</option>
                    <option value="7">Todos os dias</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Preferências */}
            <div>
              <h3 className="font-bold mb-3">Preferências</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-light-darker mb-1">
                    Horário Preferido para Treinar
                  </label>
                  <select
                    value={personalInfo.preferred_time}
                    onChange={(e) => setPersonalInfo({...personalInfo, preferred_time: e.target.value})}
                    className="input-field"
                  >
                    <option value="">Selecione</option>
                    <option value="manha">Manhã (6h - 12h)</option>
                    <option value="tarde">Tarde (12h - 18h)</option>
                    <option value="noite">Noite (18h - 22h)</option>
                    <option value="madrugada">Madrugada (22h - 6h)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-light-darker mb-1">
                    O que mais te motiva?
                  </label>
                  <select
                    value={personalInfo.motivation}
                    onChange={(e) => setPersonalInfo({...personalInfo, motivation: e.target.value})}
                    className="input-field"
                  >
                    <option value="">Selecione</option>
                    <option value="saude">Saúde e bem-estar</option>
                    <option value="estetica">Melhorar aparência</option>
                    <option value="forca">Ficar mais forte</option>
                    <option value="desafio">Superar desafios</option>
                    <option value="stress">Aliviar stress</option>
                    <option value="energia">Ter mais energia</option>
                    <option value="autoestima">Melhorar autoestima</option>
                    <option value="competicao">Competir</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-light-darker mb-1">
                    Biografia
                  </label>
                  <textarea
                    value={personalInfo.bio}
                    onChange={(e) => setPersonalInfo({...personalInfo, bio: e.target.value})}
                    className="input-field min-h-[80px] resize-none"
                    placeholder="Conte um pouco sobre você, seus hobbies, o que gosta de fazer..."
                  />
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setIsEditingPersonalInfo(false);
                  // Resetar para valores originais
                  if (user.profile) {
                    setPersonalInfo({
                      height: user.profile.height || '',
                      weight: user.profile.weight || '',
                      target_weight: user.profile.target_weight || '',
                      age: user.profile.age || '',
                      goal: user.profile.goal || '',
                      experience_level: user.profile.experience_level || '',
                      training_time: user.profile.training_time || '',
                      preferred_time: user.profile.preferred_time || '',
                      favorite_exercises: user.profile.favorite_exercises || [],
                      motivation: user.profile.motivation || '',
                      weekly_goal: user.profile.weekly_goal || 3,
                      bio: user.profile.bio || ''
                    });
                  }
                }}
                className="flex-1 py-2 px-4 bg-dark-medium text-light rounded-lg"
              >
                Cancelar
              </button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleUpdatePersonalInfo}
                className="flex-1 btn-primary"
              >
                Salvar
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Informações Básicas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-light p-3 rounded-lg">
                <div className="text-sm text-light-darker">Altura</div>
                <div className="font-bold">
                  {personalInfo.height ? `${personalInfo.height} cm` : 'Não informado'}
                </div>
              </div>
              <div className="bg-dark-light p-3 rounded-lg">
                <div className="text-sm text-light-darker">Idade</div>
                <div className="font-bold">
                  {personalInfo.age ? `${personalInfo.age} anos` : 'Não informado'}
                </div>
              </div>
              <div className="bg-dark-light p-3 rounded-lg">
                <div className="text-sm text-light-darker">Peso Atual</div>
                <div className="font-bold">
                  {personalInfo.weight ? `${personalInfo.weight} kg` : 'Não informado'}
                </div>
              </div>
              <div className="bg-dark-light p-3 rounded-lg">
                <div className="text-sm text-light-darker">Meta de Peso</div>
                <div className="font-bold">
                  {personalInfo.target_weight ? `${personalInfo.target_weight} kg` : 'Não informado'}
                </div>
              </div>
            </div>

            {/* Objetivos */}
            <div className="bg-dark-light p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-light-darker">Objetivo Principal</div>
                  <div className="font-bold">
                    {(() => {
                      const goals = {
                        'ganhar_massa': 'Ganhar Massa Muscular',
                        'perder_peso': 'Perder Peso',
                        'definir': 'Definir Músculos',
                        'forca': 'Ganhar Força',
                        'resistencia': 'Melhorar Resistência',
                        'saude': 'Manter Saúde',
                        'reabilitacao': 'Reabilitação'
                      };
                      return goals[personalInfo.goal] || 'Não informado';
                    })()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-light-darker">Meta Semanal</div>
                  <div className="font-bold">
                    {personalInfo.weekly_goal} treinos por semana
                  </div>
                </div>
                <div>
                  <div className="text-sm text-light-darker">Experiência</div>
                  <div className="font-bold">
                    {(() => {
                      const levels = {
                        'iniciante': 'Iniciante',
                        'intermediario': 'Intermediário',
                        'avancado': 'Avançado',
                        'expert': 'Expert'
                      };
                      return levels[personalInfo.experience_level] || 'Não informado';
                    })()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-light-darker">Horário Preferido</div>
                  <div className="font-bold">
                    {(() => {
                      const times = {
                        'manha': 'Manhã',
                        'tarde': 'Tarde',
                        'noite': 'Noite',
                        'madrugada': 'Madrugada'
                      };
                      return times[personalInfo.preferred_time] || 'Não informado';
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Motivação */}
            {personalInfo.motivation && (
              <div className="bg-dark-light p-4 rounded-lg">
                <div className="text-sm text-light-darker">O que mais te motiva</div>
                <div className="font-bold">
                  {(() => {
                    const motivations = {
                      'saude': 'Saúde e bem-estar',
                      'estetica': 'Melhorar aparência',
                      'forca': 'Ficar mais forte',
                      'desafio': 'Superar desafios',
                      'stress': 'Aliviar stress',
                      'energia': 'Ter mais energia',
                      'autoestima': 'Melhorar autoestima',
                      'competicao': 'Competir'
                    };
                    return motivations[personalInfo.motivation] || personalInfo.motivation;
                  })()}
                </div>
              </div>
            )}

            {/* Biografia */}
            {personalInfo.bio && (
              <div className="bg-dark-light p-4 rounded-lg">
                <div className="text-sm text-light-darker">Sobre mim</div>
                <div className="mt-1">{personalInfo.bio}</div>
              </div>
            )}

            {/* Estado vazio */}
            {!personalInfo.height && !personalInfo.age && !personalInfo.goal && !personalInfo.bio && (
              <div className="text-center py-6 text-light-darker">
                <FiUser className="mx-auto mb-2" size={24} />
                <p>Complete suas informações pessoais</p>
                <p className="text-xs mt-1">Isso nos ajuda a criar mensagens motivacionais personalizadas</p>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Training Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="card mb-6"
      >
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-secondary bg-opacity-20 flex items-center justify-center mr-3">
            <FiRefreshCw className="text-secondary" size={20} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">Configurações de Treino</h2>
          </div>
          {!isEditingRestTime && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsEditingRestTime(true)}
              className="w-10 h-10 rounded-full bg-dark-medium flex items-center justify-center"
            >
              <FiEdit2 className="text-secondary" />
            </motion.button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-light-darker mb-2">
              Tempo de Descanso
            </label>
            {isEditingRestTime ? (
              <div className="space-y-4">
                {/* Descanso entre séries */}
                <div>
                  <label className="block text-sm text-light-darker mb-1">
                    Entre séries do mesmo exercício
                  </label>
                  <select
                    value={selectedRestTimeBetweenSets}
                    onChange={(e) => setSelectedRestTimeBetweenSets(parseInt(e.target.value))}
                    className="input-field"
                  >
                    <option value="30">30 segundos</option>
                    <option value="45">45 segundos</option>
                    <option value="60">1 minuto</option>
                    <option value="90">1 minuto e 30 segundos</option>
                  </select>
                </div>

                {/* Descanso entre exercícios */}
                <div>
                  <label className="block text-sm text-light-darker mb-1">
                    Entre exercícios diferentes
                  </label>
                  <select
                    value={selectedRestTimeBetweenExercises}
                    onChange={(e) => setSelectedRestTimeBetweenExercises(parseInt(e.target.value))}
                    className="input-field"
                  >
                    <option value="60">1 minuto</option>
                    <option value="90">1 minuto e 30 segundos</option>
                    <option value="120">2 minutos</option>
                    <option value="180">3 minutos</option>
                  </select>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setIsEditingRestTime(false);
                      setSelectedRestTimeBetweenSets(restTimeBetweenSets);
                      setSelectedRestTimeBetweenExercises(restTimeBetweenExercises);
                    }}
                    className="flex-1 py-2 px-4 bg-dark-medium text-light rounded-lg"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleUpdateRestTimes({
                      betweenSets: selectedRestTimeBetweenSets,
                      betweenExercises: selectedRestTimeBetweenExercises
                    })}
                    className="flex-1 btn-secondary"
                  >
                    Salvar
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="bg-dark-light p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span>Entre séries:</span>
                  <span className="font-bold text-secondary">
                    {formatTime(restTimeBetweenSets)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Entre exercícios:</span>
                  <span className="font-bold text-secondary">
                    {formatTime(restTimeBetweenExercises)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <h2 className="text-xl font-bold mb-4">Estatísticas</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div 
            className="card"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mr-3">
                <FiCalendar className="text-primary" size={20} />
              </div>
              <div>
                <h3 className="text-sm text-light-darker">Total de Treinos</h3>
                <p className="text-xl font-bold">{stats.totalWorkouts}</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="card"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-secondary bg-opacity-20 flex items-center justify-center mr-3">
                <FiClock className="text-secondary" size={20} />
              </div>
              <div>
                <h3 className="text-sm text-light-darker">Tempo Total</h3>
                <p className="text-xl font-bold">{stats.totalTime}</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="card"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mr-3">
                <FiAward className="text-primary" size={20} />
              </div>
              <div>
                <h3 className="text-sm text-light-darker">Treino Mais Longo</h3>
                <p className="text-xl font-bold">{stats.longestWorkout}</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="card"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-secondary bg-opacity-20 flex items-center justify-center mr-3">
                <FiClock className="text-secondary" size={20} />
              </div>
              <div>
                <h3 className="text-sm text-light-darker">Tempo Médio</h3>
                <p className="text-xl font-bold">{stats.averageTime}</p>
              </div>
            </div>
          </motion.div>
          
          {/* Último Treino */}
          <motion.div 
            className="card col-span-2"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mr-3">
                  <GiWeightLiftingUp className="text-primary" size={20} />
                </div>
                <div>
                  <h3 className="text-sm text-light-darker">Último Treino</h3>
                  <p className="text-xl font-bold">{stats.lastWorkoutGroup}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-light-darker">
                  {stats.daysSinceLastWorkout === 0 ? 'Hoje' :
                   stats.daysSinceLastWorkout === 1 ? 'Ontem' :
                   `${stats.daysSinceLastWorkout} dias atrás`}
                </p>
                {stats.daysSinceLastWorkout > 3 && (
                  <p className="text-xs text-primary font-medium">
                    Hora de treinar! 💪
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-bold mb-4">Histórico de Treinos</h3>
          
          {workoutHistory.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-light-darker">
                <span>Primeiro treino: {stats.firstWorkout}</span>
                <span>Último treino: {stats.lastWorkout}</span>
              </div>
              
              <div className="relative pt-6">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-dark-medium"></div>
                
                {workoutHistory.slice(0, 10).map((workout, index) => {
                  const date = new Date(workout.start_time);
                  const formattedDate = date.toLocaleDateString('pt-BR');
                  const formattedTime = date.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  });
                  
                  // Formatar duração
                  const minutes = Math.floor(workout.duration / 60);
                  const seconds = workout.duration % 60;
                  const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                  
                  // Contar exercícios
                  const exerciseCount = workout.exercises?.length || 0;
                  
                  return (
                    <motion.div 
                      key={workout.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                      className="ml-8 mb-4 relative"
                    >
                      <div className="absolute -left-10 top-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <FiCalendar className="text-white" size={12} />
                      </div>
                      
                      <div className="card">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold">{formattedDate}</h4>
                            <p className="text-sm text-light-darker">
                              {formattedTime} • {formattedDuration} • {exerciseCount} exercícios
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                
                {workoutHistory.length > 10 && (
                  <div className="ml-8 text-center text-light-darker text-sm">
                    + {workoutHistory.length - 10} treinos anteriores
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-light-darker">
              Nenhum treino registrado ainda
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;