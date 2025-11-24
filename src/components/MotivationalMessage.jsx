import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSun, FiMoon, FiStar, FiHeart, FiZap, FiTarget, FiTrendingUp, FiAward, FiActivity } from 'react-icons/fi';
import { GiWeightLiftingUp } from 'react-icons/gi';

const MotivationalMessage = ({ user, workoutHistory = [], userExercises = [] }) => {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (user) {
      generateMotivationalMessage();
    }
  }, [user, workoutHistory, userExercises]);

  const generateMotivationalMessage = () => {
    const profile = user.profile || {};
    const userName = profile.username || user.displayName || user.user_metadata?.name || 'Atleta';
    
    // Usar data atual para gerar mensagem consistente durante o dia
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const messageIndex = dayOfYear % 100; // Ciclo de 100 mensagens diferentes
    
    // Analisar contexto do usuário
    const context = analyzeUserContext(profile, workoutHistory, userExercises);
    
    // Gerar mensagem baseada no contexto
    const motivationalMessage = generateContextualMessage(userName, context, messageIndex);
    
    setMessage(motivationalMessage);
  };

  const analyzeUserContext = (profile, workoutHistory, userExercises) => {
    const now = new Date();
    const hour = now.getHours();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Determinar período do dia
    let timeOfDay = 'dia';
    if (hour >= 5 && hour < 12) timeOfDay = 'manha';
    else if (hour >= 12 && hour < 18) timeOfDay = 'tarde';
    else if (hour >= 18 && hour < 22) timeOfDay = 'noite';
    else timeOfDay = 'madrugada';
    
    // Analisar último treino
    const lastWorkout = workoutHistory[0];
    let daysSinceLastWorkout = 0;
    let trainedToday = false;
    
    if (lastWorkout) {
      const lastWorkoutDate = new Date(lastWorkout.start_time);
      lastWorkoutDate.setHours(0, 0, 0, 0);
      daysSinceLastWorkout = Math.floor((now - lastWorkoutDate) / (1000 * 60 * 60 * 24));
      trainedToday = lastWorkoutDate.getTime() === today.getTime();
    }
    
    // Analisar progresso
    const totalWorkouts = workoutHistory.length;
    const exercisesNearProgression = userExercises.filter(ex => 
      (ex.completed_workouts || ex.completedWorkouts || 0) >= 8
    ).length;
    
    // Calcular streak
    let currentStreak = 0;
    if (workoutHistory.length > 0) {
      const sortedWorkouts = [...workoutHistory].sort((a, b) => 
        new Date(b.start_time) - new Date(a.start_time)
      );
      
      let checkDate = new Date(today);
      checkDate.setHours(0, 0, 0, 0);
      
      for (const workout of sortedWorkouts) {
        const workoutDate = new Date(workout.start_time);
        workoutDate.setHours(0, 0, 0, 0);
        
        if (workoutDate.getTime() === checkDate.getTime()) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (workoutDate.getTime() === checkDate.getTime()) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }
    
    return {
      timeOfDay,
      daysSinceLastWorkout,
      trainedToday,
      totalWorkouts,
      exercisesNearProgression,
      currentStreak,
      goal: profile.goal,
      motivation: profile.motivation,
      experienceLevel: profile.experience_level,
      preferredTime: profile.preferred_time,
      favoriteExercises: profile.favorite_exercises || [],
      weeklyGoal: profile.weekly_goal || 3,
      isWeekend: now.getDay() === 0 || now.getDay() === 6
    };
  };

  const generateContextualMessage = (userName, context, messageIndex) => {
    const {
      timeOfDay,
      daysSinceLastWorkout,
      trainedToday,
      totalWorkouts,
      exercisesNearProgression,
      currentStreak,
      goal,
      motivation,
      experienceLevel,
      preferredTime,
      favoriteExercises,
      weeklyGoal,
      isWeekend
    } = context;

    // Saudações baseadas no horário
    const greetings = {
      manha: ['Bom dia', 'Olá', 'E aí', 'Oi'],
      tarde: ['Boa tarde', 'Olá', 'E aí', 'Oi'],
      noite: ['Boa noite', 'Olá', 'E aí', 'Oi'],
      madrugada: ['Olá', 'E aí', 'Oi', 'Salve']
    };

    const greeting = greetings[timeOfDay][messageIndex % greetings[timeOfDay].length];

    // Mensagens baseadas em contexto
    let messageText = '';
    let icon = FiStar;
    let color = '#FF4500';

    // Prioridade 1: Usuário não treina há muito tempo
    if (daysSinceLastWorkout >= 7) {
      const messages = [
        `${greeting}, ${userName}! 😔 Sentimos sua falta! Que tal voltarmos aos treinos hoje?`,
        `${greeting}, ${userName}! 💪 Já faz ${daysSinceLastWorkout} dias... Seu corpo está esperando por você!`,
        `${greeting}, ${userName}! 🔥 Hora de quebrar essa pausa e voltar mais forte!`,
        `${greeting}, ${userName}! ⚡ Seus músculos estão com saudade do treino!`
      ];
      messageText = messages[messageIndex % messages.length];
      icon = FiZap;
      color = '#DC3545';
    }
    // Prioridade 2: Exercícios próximos da evolução
    else if (exercisesNearProgression > 0) {
      const messages = [
        `${greeting}, ${userName}! 🎯 Você tem ${exercisesNearProgression} exercícios quase evoluindo! Vamos lá!`,
        `${greeting}, ${userName}! 🚀 Está quase na hora de aumentar o peso em alguns exercícios!`,
        `${greeting}, ${userName}! 💪 Seus músculos estão prontos para o próximo nível!`,
        `${greeting}, ${userName}! 🔥 A evolução está batendo na porta!`
      ];
      messageText = messages[messageIndex % messages.length];
      icon = FiTrendingUp;
      color = '#28A745';
    }
    // Prioridade 3: Streak alto
    else if (currentStreak >= 7) {
      const messages = [
        `${greeting}, ${userName}! 🔥 ${currentStreak} dias consecutivos! Você é imparável!`,
        `${greeting}, ${userName}! 🏆 Que sequência incrível! Continue assim!`,
        `${greeting}, ${userName}! ⚡ Sua dedicação é inspiradora!`,
        `${greeting}, ${userName}! 💎 Você está brilhando com essa consistência!`
      ];
      messageText = messages[messageIndex % messages.length];
      icon = FiAward;
      color = '#FD7E14';
    }
    // Prioridade 4: Mensagens baseadas no objetivo
    else if (goal) {
      const goalMessages = {
        perder_peso: [
          `${greeting}, ${userName}! 🔥 Cada treino te aproxima do seu peso ideal!`,
          `${greeting}, ${userName}! 💪 Queimando calorias e construindo força!`,
          `${greeting}, ${userName}! ⚡ Seu corpo está se transformando a cada dia!`
        ],
        ganhar_massa: [
          `${greeting}, ${userName}! 💪 Hora de construir músculos! Vamos crescer!`,
          `${greeting}, ${userName}! 🏗️ Cada rep é um tijolo na construção do seu físico!`,
          `${greeting}, ${userName}! 🚀 Seus músculos estão pedindo mais desafio!`
        ],
        definir: [
          `${greeting}, ${userName}! ✨ Esculpindo o corpo dos seus sonhos!`,
          `${greeting}, ${userName}! 🎯 Cada treino define mais sua silhueta!`,
          `${greeting}, ${userName}! 💎 Lapidando seu físico como uma obra de arte!`
        ],
        forca: [
          `${greeting}, ${userName}! 🏋️ Hora de mostrar sua força!`,
          `${greeting}, ${userName}! ⚡ Você está ficando mais forte a cada dia!`,
          `${greeting}, ${userName}! 💪 Quebre seus próprios recordes hoje!`
        ],
        resistencia: [
          `${greeting}, ${userName}! 🏃 Sua resistência está melhorando!`,
          `${greeting}, ${userName}! ⚡ Cada treino aumenta sua energia!`,
          `${greeting}, ${userName}! 🔋 Você está carregando suas baterias!`
        ],
        saude: [
          `${greeting}, ${userName}! ❤️ Investindo na sua saúde é o melhor presente!`,
          `${greeting}, ${userName}! 🌟 Seu corpo agradece cada movimento!`,
          `${greeting}, ${userName}! 💚 Saúde em primeiro lugar!`
        ]
      };
      
      const goalMessageList = goalMessages[goal] || goalMessages.saude;
      messageText = goalMessageList[messageIndex % goalMessageList.length];
      icon = FiTarget;
      color = '#4A90E2';
    }
    // Prioridade 5: Mensagens baseadas na motivação
    else if (motivation) {
      const motivationMessages = {
        saude: [
          `${greeting}, ${userName}! ❤️ Cuidando da sua saúde com cada treino!`,
          `${greeting}, ${userName}! 🌟 Seu bem-estar é prioridade!`
        ],
        estetica: [
          `${greeting}, ${userName}! ✨ Você está ficando mais bonito(a) a cada dia!`,
          `${greeting}, ${userName}! 💎 Esculpindo o corpo dos seus sonhos!`
        ],
        forca: [
          `${greeting}, ${userName}! 💪 Sentindo-se mais forte hoje?`,
          `${greeting}, ${userName}! ⚡ Sua força interior reflete no exterior!`
        ],
        energia: [
          `${greeting}, ${userName}! 🔋 Carregando as energias para o dia!`,
          `${greeting}, ${userName}! ⚡ Mais energia, mais vida!`
        ],
        autoestima: [
          `${greeting}, ${userName}! 🌟 Você é incrível e merece se sentir assim!`,
          `${greeting}, ${userName}! 💫 Sua confiança cresce a cada treino!`
        ],
        desafio: [
          `${greeting}, ${userName}! 🎯 Pronto para superar seus limites?`,
          `${greeting}, ${userName}! 🚀 Cada desafio te torna mais forte!`
        ]
      };
      
      const motivationMessageList = motivationMessages[motivation] || motivationMessages.saude;
      messageText = motivationMessageList[messageIndex % motivationMessageList.length];
      icon = FiHeart;
      color = '#E91E63';
    }
    // Mensagens baseadas no horário preferido
    else if (preferredTime && preferredTime === timeOfDay.replace('_cedo', '')) {
      const timeMessages = [
        `${greeting}, ${userName}! ⏰ Seu horário favorito chegou! Hora de treinar!`,
        `${greeting}, ${userName}! 🎯 O momento perfeito para o seu treino!`,
        `${greeting}, ${userName}! ⚡ Energia máxima no seu horário preferido!`
      ];
      messageText = timeMessages[messageIndex % timeMessages.length];
      icon = FiSun;
      color = '#FFC107';
    }
    // Mensagens baseadas em exercícios favoritos
    else if (favoriteExercises.length > 0) {
      const favoriteExercise = favoriteExercises[messageIndex % favoriteExercises.length];
      const messages = [
        `${greeting}, ${userName}! 💪 Que tal um ${favoriteExercise} hoje?`,
        `${greeting}, ${userName}! 🎯 Hora de arrasar no ${favoriteExercise}!`,
        `${greeting}, ${userName}! 🔥 ${favoriteExercise} te espera!`
      ];
      messageText = messages[messageIndex % messages.length];
      icon = GiWeightLiftingUp;
      color = '#FF4500';
    }
    // Mensagens gerais motivacionais
    else {
      const generalMessages = [
        `${greeting}, ${userName}! 💪 Hoje é um ótimo dia para treinar!`,
        `${greeting}, ${userName}! 🔥 Sua jornada fitness continua!`,
        `${greeting}, ${userName}! ⚡ Vamos fazer acontecer!`,
        `${greeting}, ${userName}! 🎯 Cada treino te aproxima dos seus objetivos!`,
        `${greeting}, ${userName}! 🌟 Você é mais forte do que imagina!`,
        `${greeting}, ${userName}! 🚀 Hora de superar seus limites!`,
        `${greeting}, ${userName}! 💎 Transforme suor em conquistas!`,
        `${greeting}, ${userName}! 🏆 Champions train, others complain!`,
        `${greeting}, ${userName}! ⚡ Sua energia positiva contagia!`,
        `${greeting}, ${userName}! 🔥 Foco, força e fé!`
      ];
      messageText = generalMessages[messageIndex % generalMessages.length];
      icon = FiStar;
      color = '#4A90E2';
    }

    // Adicionar contexto de fim de semana
    if (context.isWeekend && daysSinceLastWorkout === 0) {
      const weekendMessages = [
        `${greeting}, ${userName}! 🎉 Fim de semana produtivo! Que tal um treino?`,
        `${greeting}, ${userName}! 🌟 Fins de semana são perfeitos para focar em você!`,
        `${greeting}, ${userName}! 💪 Weekend warrior mode ON!`
      ];
      messageText = weekendMessages[messageIndex % weekendMessages.length];
      icon = FiSun;
      color = '#FFC107';
    }

    return {
      text: messageText,
      icon,
      color,
      context: {
        timeOfDay,
        daysSinceLastWorkout,
        totalWorkouts,
        currentStreak: context.currentStreak
      }
    };
  };

  if (!message) return null;

  const IconComponent = message.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card mb-6 relative overflow-hidden"
      style={{ 
        background: `linear-gradient(135deg, ${message.color}15 0%, ${message.color}05 100%)`,
        borderLeft: `4px solid ${message.color}`
      }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 opacity-5">
        <IconComponent size={120} style={{ color: message.color }} />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-start">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0"
            style={{ backgroundColor: `${message.color}20` }}
          >
            <IconComponent size={24} style={{ color: message.color }} />
          </div>
          
          <div className="flex-1">
            <motion.p 
              className="text-lg font-medium leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {message.text}
            </motion.p>
            
            {/* Context info */}
            <div className="flex items-center mt-3 space-x-4 text-xs text-light-darker">
              {message.context.currentStreak > 0 && (
                <div className="flex items-center">
                  <FiTrendingUp className="mr-1" size={12} />
                  <span>{message.context.currentStreak} dias consecutivos</span>
                </div>
              )}
              {message.context.totalWorkouts > 0 && (
                <div className="flex items-center">
                  <FiActivity className="mr-1" size={12} />
                  <span>{message.context.totalWorkouts} treinos totais</span>
                </div>
              )}
              {message.context.trainedToday && (
                <div className="flex items-center">
                  <FiAward className="mr-1" size={12} />
                  <span>Treinou hoje!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MotivationalMessage;