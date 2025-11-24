import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAward, FiTarget, FiTrendingUp, FiClock, FiCalendar, FiLock, FiCheck } from 'react-icons/fi';
import { GiWeightLiftingUp } from 'react-icons/gi';
import { useFirebaseAuthStore } from '../stores/firebaseAuthStore';
import { useAchievementStore } from '../stores/achievementStore';
import ProgressBar from '../components/ProgressBar';
import Confetti from 'react-confetti';

const Achievements = () => {
  const { user } = useFirebaseAuthStore();
  const { 
    initialize,
    achievements, 
    userAchievements, 
    challenges, 
    userChallenges,
    userProfile,
    loading 
  } = useAchievementStore();
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedTab, setSelectedTab] = useState('achievements');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  
  useEffect(() => {
    if (user) {
      initialize(user.id);
    }
  }, [user]);

  useEffect(() => {
    // Mostrar confetti se o usuário desbloqueou uma conquista recentemente
    if (userAchievements.length > 0) {
      const recentAchievement = userAchievements[0];
      const unlockTime = new Date(recentAchievement.unlocked_at);
      const now = new Date();
      const timeDiff = now - unlockTime;
      
      // Se a conquista foi desbloqueada nos últimos 10 segundos
      if (timeDiff < 10000) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    }
  }, [userAchievements]);

  // Filtrar conquistas por categoria
  const filteredAchievements = achievements.filter(achievement => {
    if (selectedCategory === 'all') return true;
    return achievement.category === selectedCategory;
  });

  // Verificar se uma conquista foi desbloqueada
  const isAchievementUnlocked = (achievementId) => {
    return userAchievements.some(ua => ua.achievement_id === achievementId);
  };

  // Obter progresso para uma conquista
  const getAchievementProgress = (achievement) => {
    if (!userProfile) return 0;
    
    switch (achievement.requirement_type) {
      case 'workouts':
        return Math.min(userProfile.total_workouts, achievement.requirement_value);
      case 'exercises':
        return Math.min(userProfile.total_exercises, achievement.requirement_value);
      case 'weight':
        return Math.min(userProfile.total_weight_lifted, achievement.requirement_value);
      case 'streak':
        return Math.min(userProfile.streak_days, achievement.requirement_value);
      default:
        return 0;
    }
  };

  // Obter ícone para uma conquista
  const getAchievementIcon = (iconName) => {
    switch (iconName) {
      case 'FiAward':
        return <FiAward size={24} />;
      case 'FiTrendingUp':
        return <FiTrendingUp size={24} />;
      case 'FiCalendar':
        return <FiCalendar size={24} />;
      case 'GiWeightLiftingUp':
        return <GiWeightLiftingUp size={24} />;
      default:
        return <FiAward size={24} />;
    }
  };

  // Obter progresso para um desafio
  const getChallengeProgress = (challengeId) => {
    const userChallenge = userChallenges.find(uc => uc.challenge_id === challengeId);
    if (!userChallenge) return 0;
    return userChallenge.current_progress;
  };

  // Verificar se um desafio foi completado
  const isChallengeCompleted = (challengeId) => {
    const userChallenge = userChallenges.find(uc => uc.challenge_id === challengeId);
    if (!userChallenge) return false;
    return userChallenge.completed;
  };

  // Abrir modal de detalhes da conquista
  const openAchievementDetails = (achievement) => {
    setSelectedAchievement(achievement);
    setShowAchievementModal(true);
  };

  return (
    <div>
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold mb-1">Conquistas</h1>
        <p className="text-light-darker">Acompanhe seu progresso e desbloqueie recompensas</p>
      </motion.div>

      {/* User Level */}
      {userProfile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="card mb-6"
        >
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mr-4">
              <FiAward className="text-primary" size={32} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">Nível {userProfile.level}</h2>
              <p className="text-light-darker">
                {userProfile.experience} XP • Próximo nível: {userProfile.level * 100} XP
              </p>
            </div>
          </div>
          
          <ProgressBar 
            value={userProfile.experience % 100} 
            max={100} 
            showLabel={false}
          />
        </motion.div>
      )}

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="mb-6"
      >
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedTab('achievements')}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              selectedTab === 'achievements'
                ? 'bg-primary text-white'
                : 'bg-dark-light text-light-darker'
            }`}
          >
            <div className="flex items-center">
              <FiAward className="mr-2" />
              <span>Conquistas</span>
            </div>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedTab('challenges')}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              selectedTab === 'challenges'
                ? 'bg-primary text-white'
                : 'bg-dark-light text-light-darker'
            }`}
          >
            <div className="flex items-center">
              <FiTarget className="mr-2" />
              <span>Desafios</span>
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* Achievement Categories */}
      {selectedTab === 'achievements' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="mb-6"
        >
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-secondary text-white'
                  : 'bg-dark-light text-light-darker'
              }`}
            >
              Todos
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory('iniciante')}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                selectedCategory === 'iniciante'
                  ? 'bg-secondary text-white'
                  : 'bg-dark-light text-light-darker'
              }`}
            >
              Iniciante
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory('intermediário')}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                selectedCategory === 'intermediário'
                  ? 'bg-secondary text-white'
                  : 'bg-dark-light text-light-darker'
              }`}
            >
              Intermediário
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory('avançado')}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                selectedCategory === 'avançado'
                  ? 'bg-secondary text-white'
                  : 'bg-dark-light text-light-darker'
              }`}
            >
              Avançado
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory('elite')}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                selectedCategory === 'elite'
                  ? 'bg-secondary text-white'
                  : 'bg-dark-light text-light-darker'
              }`}
            >
              Elite
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : selectedTab === 'achievements' ? (
          <div className="space-y-4">
            {filteredAchievements.length > 0 ? (
              filteredAchievements.map((achievement) => {
                const unlocked = isAchievementUnlocked(achievement.id);
                const progress = getAchievementProgress(achievement);
                
                return (
                  <motion.div
                    key={achievement.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openAchievementDetails(achievement)}
                    className={`card cursor-pointer ${unlocked ? 'border border-primary' : ''}`}
                  >
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                        unlocked ? 'bg-primary text-white' : 'bg-dark-medium text-light-darker'
                      }`}>
                        {unlocked ? (
                          getAchievementIcon(achievement.icon_name)
                        ) : (
                          <FiLock size={24} />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-bold">{achievement.name}</h3>
                        <p className="text-sm text-light-darker">{achievement.description}</p>
                        
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-secondary font-medium">
                              {progress} / {achievement.requirement_value}
                            </span>
                            <span className="text-light-darker">
                              +{achievement.experience_reward} XP
                            </span>
                          </div>
                          <ProgressBar 
                            value={progress} 
                            max={achievement.requirement_value} 
                            showLabel={false}
                          />
                        </div>
                      </div>
                      
                      {unlocked && (
                        <div className="ml-2">
                          <div className="w-8 h-8 rounded-full bg-primary bg-opacity-20 flex items-center justify-center">
                            <FiCheck className="text-primary" size={16} />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="card text-center py-8">
                <p className="text-light-darker">Nenhuma conquista encontrada</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {challenges.length > 0 ? (
              challenges.map((challenge) => {
                const completed = isChallengeCompleted(challenge.id);
                const progress = getChallengeProgress(challenge.id);
                
                // Calcular dias restantes
                const endDate = new Date(challenge.end_date);
                const now = new Date();
                const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
                
                return (
                  <motion.div
                    key={challenge.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`card ${completed ? 'border border-primary' : ''}`}
                  >
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                        completed ? 'bg-primary text-white' : 'bg-dark-medium text-light-darker'
                      }`}>
                        {completed ? (
                          <FiCheck size={24} />
                        ) : (
                          <FiTarget size={24} />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold">{challenge.title}</h3>
                          <span className="text-xs text-light-darker">
                            {daysLeft > 0 ? `${daysLeft} dias restantes` : 'Termina hoje'}
                          </span>
                        </div>
                        <p className="text-sm text-light-darker">{challenge.description}</p>
                        
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-secondary font-medium">
                              {progress} / {challenge.requirement_value}
                            </span>
                            <span className="text-light-darker">
                              +{challenge.experience_reward} XP
                            </span>
                          </div>
                          <ProgressBar 
                            value={progress} 
                            max={challenge.requirement_value} 
                            showLabel={false}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="card text-center py-8">
                <p className="text-light-darker">Nenhum desafio disponível no momento</p>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {showAchievementModal && selectedAchievement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAchievementModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-lighter rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mr-4 ${
                  isAchievementUnlocked(selectedAchievement.id) 
                    ? 'bg-primary text-white' 
                    : 'bg-dark-medium text-light-darker'
                }`}>
                  {isAchievementUnlocked(selectedAchievement.id) ? (
                    getAchievementIcon(selectedAchievement.icon_name)
                  ) : (
                    <FiLock size={32} />
                  )}
                </div>
                
                <div>
                  <h2 className="text-xl font-bold">{selectedAchievement.name}</h2>
                  <p className="text-light-darker">{selectedAchievement.category}</p>
                </div>
              </div>
              
              <p className="mb-4">{selectedAchievement.description}</p>
              
              <div className="bg-dark-light p-4 rounded-lg mb-6">
                <div className="flex justify-between mb-2">
                  <span>Requisito:</span>
                  <span className="font-bold">
                    {selectedAchievement.requirement_value} 
                    {selectedAchievement.requirement_type === 'workouts' && ' treinos'}
                    {selectedAchievement.requirement_type === 'exercises' && ' exercícios'}
                    {selectedAchievement.requirement_type === 'weight' && ' kg levantados'}
                    {selectedAchievement.requirement_type === 'streak' && ' dias consecutivos'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Recompensa:</span>
                  <span className="font-bold text-primary">+{selectedAchievement.experience_reward} XP</span>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-1">
                  <span>Seu progresso:</span>
                  <span>
                    {getAchievementProgress(selectedAchievement)} / {selectedAchievement.requirement_value}
                  </span>
                </div>
                <ProgressBar 
                  value={getAchievementProgress(selectedAchievement)} 
                  max={selectedAchievement.requirement_value} 
                  showLabel={false}
                />
              </div>
              
              <button
                onClick={() => setShowAchievementModal(false)}
                className="w-full py-2 px-4 bg-primary text-white rounded-lg font-medium"
              >
                Fechar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Achievements;