import { create } from 'zustand';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-toastify';
import { useThemeStore } from './themeStore';
import BackgroundTimer from '../utils/BackgroundTimer';

// Categorias de exercícios
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

export const useWorkoutStore = create((set, get) => ({
  exercises: [],
  categories,
  userExercises: [],
  workoutHistory: [],
  currentWorkout: null,
  selectedGroups: [],
  timer: 0,
  restTimer: null,
  restTimeBetweenSets: 45,
  restTimeBetweenExercises: 90,
  workoutTimer: null,
  restTimerInstance: null,
  loading: false,
  error: null,
  isExerciseRest: false,

  // Criar exercício personalizado
  createCustomExercise: async (userId, exerciseData) => {
    try {
      console.log('🚀 === INICIANDO CRIAÇÃO DE EXERCÍCIO ===');
      console.log('👤 User ID:', userId);
      console.log('📝 Dados do exercício:', exerciseData);
      
      set({ loading: true });
      
      if (!userId) {
        console.error('❌ User ID não fornecido');
        throw new Error('User ID é obrigatório');
      }

      // Criar exercício no Firestore
      const exerciseRef = await addDoc(collection(db, 'exercises'), {
        name: exerciseData.name,
        description: exerciseData.description || '',
        category: exerciseData.category,
        imageUrl: exerciseData.imageUrl || '',
        videoUrl: exerciseData.videoUrl || '',
        isCustom: true,
        createdBy: userId,
        createdAt: new Date()
      });
      
      console.log('✅ Exercício criado:', exerciseRef.id);

      // Criar entrada na coleção user_exercises
      const userExerciseRef = await addDoc(collection(db, 'user_exercises'), {
        userId: userId,
        exerciseId: exerciseRef.id,
        current_weight: exerciseData.initialWeight || 0,
        starting_weight: exerciseData.initialWeight || 0,
        current_sets: 3,
        current_reps: 8,
        progress_level: 0,
        completed_workouts: 0,
        weight_unit: exerciseData.weightUnit || 'lbs',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ User exercise criado:', userExerciseRef.id);

      // Recarregar exercícios do usuário
      await get().fetchUserExercises(userId);
      
      set({ loading: false });
      console.log('🎉 === EXERCÍCIO CRIADO COM SUCESSO ===');
      return exerciseRef.id;
    } catch (error) {
      console.error('❌ === ERRO AO CRIAR EXERCÍCIO PERSONALIZADO ===');
      console.error('❌ Erro completo:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Inicializar tempos de descanso do perfil do usuário
  initializeRestTimes: async (userId) => {
    try {
      const profileDoc = await getDoc(doc(db, 'profiles', userId));
      
      if (profileDoc.exists()) {
        const profile = profileDoc.data();
        set({ 
          restTimeBetweenSets: profile.restTimeBetweenSets || 45,
          restTimeBetweenExercises: profile.restTimeBetweenExercises || 90
        });
      }
    } catch (error) {
      console.error('Error initializing rest times:', error);
      // Use defaults if error
      set({ 
        restTimeBetweenSets: 45,
        restTimeBetweenExercises: 90
      });
    }
  },

  // Atualizar tempos de descanso
  updateRestTimes: async (userId, { betweenSets, betweenExercises }) => {
    try {
      set({ loading: true });
      
      await updateDoc(doc(db, 'profiles', userId), {
        restTimeBetweenSets: betweenSets,
        restTimeBetweenExercises: betweenExercises,
        updatedAt: new Date()
      });
      
      set({ 
        restTimeBetweenSets: betweenSets,
        restTimeBetweenExercises: betweenExercises,
        loading: false 
      });
      return true;
    } catch (error) {
      console.error('Error updating rest times:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Iniciar timer de descanso
  startRestTimer: (isExerciseComplete = false) => {
    const { restTimerInstance: existingRestTimerInstance, restTimeBetweenSets, restTimeBetweenExercises } = get();
    const { soundEnabled, vibrationEnabled, keepScreenOn } = useThemeStore.getState();
    
    if (existingRestTimerInstance) {
      existingRestTimerInstance.destroy();
    }
    
    const restTime = isExerciseComplete ? restTimeBetweenExercises : restTimeBetweenSets;
    
    // Implementar Wake Lock se habilitado
    let wakeLock = null;
    if (keepScreenOn && 'wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then(lock => {
        wakeLock = lock;
        console.log('Wake Lock ativado durante timer de descanso');
      }).catch(error => {
        console.warn('Não foi possível ativar Wake Lock:', error);
      });
    }
    
    const playAlertSound = (type = 'normal') => {
      if (!soundEnabled) return;
      
      try {
        const audio = new Audio('/alert.mp3');
        audio.volume = type === 'urgent' ? 1.0 : 0.7;
        
        if (type === 'urgent') {
          audio.play();
          setTimeout(() => audio.play(), 200);
          setTimeout(() => audio.play(), 400);
        } else if (type === 'warning') {
          audio.play();
          setTimeout(() => audio.play(), 300);
        } else {
          audio.play();
        }
      } catch (error) {
        console.warn('Não foi possível reproduzir o som de alerta:', error);
      }
    };

    const vibrateDevice = (pattern = [200]) => {
      if (!vibrationEnabled) return;
      
      if ('vibrate' in navigator) {
        try {
          // Detectar iOS para usar padrões mais compatíveis
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          
          if (isIOS) {
            // iOS funciona melhor com vibrações simples
            const duration = Array.isArray(pattern) ? pattern[0] || 200 : pattern;
            navigator.vibrate(duration);
          } else {
            // Android e outros suportam padrões complexos
            navigator.vibrate(pattern);
          }
        } catch (error) {
          console.warn('Vibração não suportada:', error);
        }
      }
    };

    // Criar timer de descanso em background
    const newRestTimerInstance = new BackgroundTimer(
      (remaining) => {
        set({ restTimer: remaining });
        
        // Alertas baseados no tempo restante
        if (remaining === 10) {
          playAlertSound('warning');
          vibrateDevice([100, 100, 100]);
          toast.info('⚠️ 10 segundos restantes!', {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            className: 'bg-orange-500',
          });
        } else if (remaining === 5) {
          playAlertSound('urgent');
          vibrateDevice([200, 100, 200, 100, 200]);
          toast.warning('🔥 5 segundos! Prepare-se!', {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            className: 'bg-red-500',
          });
        } else if (remaining <= 3 && remaining > 0) {
          playAlertSound('urgent');
          vibrateDevice([300]);
          toast.error(`🚨 ${remaining}!`, {
            position: "top-center",
            autoClose: 800,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: false,
            draggable: false,
            className: 'bg-red-600 text-white font-bold text-xl',
          });
        }
      },
      () => {
        // Timer de descanso completado
        if (wakeLock) {
          wakeLock.release().then(() => {
            console.log('Wake Lock liberado');
          });
        }
        
        playAlertSound('urgent');
        vibrateDevice([500, 200, 500, 200, 500]);
        
        const state = get();
        toast.success(
          state.isExerciseRest 
            ? '🎯 PRÓXIMO EXERCÍCIO! VAMOS LÁ!' 
            : '💪 PRÓXIMA SÉRIE! FORÇA!', 
          {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            className: 'bg-green-500 text-white font-bold',
          }
        );
        
        set({ 
          restTimer: null, 
          restTimerInstance: null,
          isExerciseRest: false
        });
      }
    );
    
    // Iniciar timer
    newRestTimerInstance.start(
      restTime, 
      isExerciseComplete ? 'exercise-rest' : 'set-rest',
      `treinano-rest-${Date.now()}`
    );
    
    set({ 
      restTimer: restTime,
      isExerciseRest: isExerciseComplete,
      restTimerInstance: newRestTimerInstance
    });
  },

  // Parar timer de descanso
  stopRestTimer: () => {
    const { restTimerInstance } = get();
    if (restTimerInstance) {
      restTimerInstance.destroy();
    }
    set({ 
      restTimer: null, 
      restTimerInstance: null,
      isExerciseRest: false 
    });
  },

  // Formatar timer
  formatTimer: (seconds = null) => {
    const time = seconds !== null ? seconds : get().timer;
    const minutes = Math.floor(time / 60);
    const remainingSeconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  },

  // Carregar exercícios do usuário
  fetchUserExercises: async (userId) => {
    try {
      console.log('🔍 === INICIANDO BUSCA DE EXERCÍCIOS (FIREBASE) ===');
      console.log('👤 User ID recebido:', userId);
      
      set({ loading: true });
      
      if (!userId) {
        console.error('❌ User ID não fornecido');
        set({ loading: false });
        throw new Error('User ID é obrigatório');
      }

      // Buscar exercícios do usuário no Firebase
      const userExercisesQuery = query(
        collection(db, 'user_exercises'),
        where('userId', '==', userId)
      );
      
      const userExercisesSnapshot = await getDocs(userExercisesQuery);
      console.log('📊 Documentos encontrados na query:', userExercisesSnapshot.docs.length);
      const userExercisesData = [];
      
      // Para cada user_exercise, buscar os dados do exercício
      for (const userExerciseDoc of userExercisesSnapshot.docs) {
        const userExerciseData = { id: userExerciseDoc.id, ...userExerciseDoc.data() };
        console.log('📄 User Exercise encontrado:', {
          id: userExerciseDoc.id,
          data: userExerciseData
        });
        
        // Buscar dados do exercício
        const exerciseDoc = await getDoc(doc(db, 'exercises', userExerciseData.exerciseId));
        
        if (exerciseDoc.exists()) {
          const exerciseData = { id: exerciseDoc.id, ...exerciseDoc.data() };
          console.log('📄 Exercise data encontrado:', exerciseData);
          
          userExercisesData.push({
            ...userExerciseData,
            exercise: exerciseData
          });
        } else {
          console.warn('⚠️ Exercício não encontrado:', userExerciseData.exerciseId);
        }
      }
      
      // Ordenar no cliente por data de criação (mais recente primeiro)
      userExercisesData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
        const dateB = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
        return dateB - dateA;
      });
      
      console.log('📊 Exercícios encontrados:', userExercisesData.length);
      console.log('📊 Lista completa de exercícios:', userExercisesData.map(ex => ({
        id: ex.id,
        name: ex.exercise?.name,
        completedWorkouts: ex.completedWorkouts,
        progressLevel: ex.progressLevel
      })));
      
      set({ userExercises: userExercisesData, loading: false });
      return userExercisesData;
    } catch (error) {
      console.error('❌ === ERRO AO CARREGAR EXERCÍCIOS ===');
      console.error('❌ Erro completo:', error);
      
      let errorMessage = error.message;
      if (error.code === 'permission-denied') {
        errorMessage = 'Erro de permissão. Faça login novamente.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Serviço temporariamente indisponível. Tente novamente.';
      }
      
      set({ error: errorMessage, loading: false, userExercises: [] });
      return [];
    }
  },

  // Carregar histórico de treinos
  fetchWorkoutHistory: async (userId) => {
    try {
      console.log('🔍 === INICIANDO BUSCA DE HISTÓRICO (FIREBASE) ===');
      set({ loading: true });
      
      if (!userId) {
        throw new Error('User ID é obrigatório');
      }

      const workoutQuery = query(
        collection(db, 'workout_history'),
        where('userId', '==', userId)
      );
      
      const workoutSnapshot = await getDocs(workoutQuery);
      const workoutData = workoutSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        start_time: doc.data().startTime?.toDate?.() || doc.data().startTime
      }));
      
      // Ordenar no cliente por data de início (mais recente primeiro)
      workoutData.sort((a, b) => {
        const dateA = a.startTime?.toDate?.() || a.startTime || new Date(0);
        const dateB = b.startTime?.toDate?.() || b.startTime || new Date(0);
        return dateB - dateA;
      });
      
      console.log('📊 Histórico encontrado:', workoutData.length);
      set({ workoutHistory: workoutData, loading: false });
      return workoutData;
    } catch (error) {
      console.error('❌ === ERRO AO CARREGAR HISTÓRICO ===');
      console.error('❌ Erro completo:', error);
      
      let errorMessage = error.message;
      if (error.code === 'permission-denied') {
        errorMessage = 'Erro de permissão. Faça login novamente.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Serviço temporariamente indisponível. Tente novamente.';
      }
      
      set({ error: errorMessage, loading: false, workoutHistory: [] });
      return [];
    }
  },

  // Iniciar novo treino
  startWorkout: (groups) => {
    if (!groups || groups.length === 0) return;

    console.log('Starting workout for groups:', groups);

    const newWorkout = {
      id: crypto.randomUUID(),
      startTime: new Date(),
      exercises: [],
      completed: false,
    };
    
    // Criar timer de treino em background
    const workoutTimer = new BackgroundTimer(
      (remaining, elapsed) => {
        set({ timer: elapsed });
      },
      () => {
        console.log('Timer de treino completado (muito longo!)');
      }
    );
    
    // Iniciar timer com duração muito longa (24 horas)
    workoutTimer.start(24 * 60 * 60, 'workout', `treinano-workout-${newWorkout.id}`);
    
    set({ 
      currentWorkout: newWorkout, 
      selectedGroups: groups,
      timer: 0,
      workoutTimer
    });
    
    console.log('Workout started, selectedGroups set to:', groups);
    return newWorkout;
  },

  // Adicionar exercício ao treino atual
  addExerciseToWorkout: (exerciseId, exerciseData) => {
    const { currentWorkout } = get();
    if (!currentWorkout) return;

    const newExercise = {
      id: crypto.randomUUID(),
      userExerciseId: exerciseId,
      exerciseData,
      sets: Array(exerciseData.current_sets || exerciseData.currentSets || 3).fill().map(() => ({
        reps: exerciseData.current_reps || exerciseData.currentReps || 8,
        weight: exerciseData.current_weight || exerciseData.currentWeight || 0,
        completed: false
      }))
    };

    set((state) => ({
      currentWorkout: {
        ...state.currentWorkout,
        exercises: [...state.currentWorkout.exercises, newExercise]
      }
    }));
  },

  // Atualizar dados do exercício durante o treino
  updateExerciseInWorkout: (exerciseIndex, updatedData) => {
    const { currentWorkout } = get();
    if (!currentWorkout) return;

    const updatedExercises = [...currentWorkout.exercises];
    if (!updatedExercises[exerciseIndex]) return;

    // Atualizar peso e repetições em todas as séries
    if (updatedData.weight !== undefined) {
      updatedExercises[exerciseIndex].sets = updatedExercises[exerciseIndex].sets.map(set => ({
        ...set,
        weight: updatedData.weight
      }));

      // Atualizar também no exerciseData
      updatedExercises[exerciseIndex].exerciseData = {
        ...updatedExercises[exerciseIndex].exerciseData,
        current_weight: updatedData.weight,
        currentWeight: updatedData.weight
      };
    }

    if (updatedData.reps !== undefined) {
      updatedExercises[exerciseIndex].sets = updatedExercises[exerciseIndex].sets.map(set => ({
        ...set,
        reps: updatedData.reps
      }));

      // Atualizar também no exerciseData
      updatedExercises[exerciseIndex].exerciseData = {
        ...updatedExercises[exerciseIndex].exerciseData,
        current_reps: updatedData.reps,
        currentReps: updatedData.reps
      };
    }

    if (updatedData.sets !== undefined) {
      const currentSetsCount = updatedExercises[exerciseIndex].sets.length;
      const newSetsCount = updatedData.sets;

      if (newSetsCount > currentSetsCount) {
        // Adicionar mais séries
        const additionalSets = Array(newSetsCount - currentSetsCount).fill().map(() => ({
          reps: updatedExercises[exerciseIndex].sets[0].reps,
          weight: updatedExercises[exerciseIndex].sets[0].weight,
          completed: false
        }));
        updatedExercises[exerciseIndex].sets = [...updatedExercises[exerciseIndex].sets, ...additionalSets];
      } else if (newSetsCount < currentSetsCount) {
        // Remover séries
        updatedExercises[exerciseIndex].sets = updatedExercises[exerciseIndex].sets.slice(0, newSetsCount);
      }

      // Atualizar também no exerciseData
      updatedExercises[exerciseIndex].exerciseData = {
        ...updatedExercises[exerciseIndex].exerciseData,
        current_sets: updatedData.sets,
        currentSets: updatedData.sets
      };
    }

    set((state) => ({
      currentWorkout: {
        ...state.currentWorkout,
        exercises: updatedExercises
      }
    }));
  },

  // Completar série de exercício
  completeSet: (exerciseIndex, setIndex) => {
    const { currentWorkout } = get();
    if (!currentWorkout) return;

    const updatedExercises = [...currentWorkout.exercises];
    if (!updatedExercises[exerciseIndex] || !updatedExercises[exerciseIndex].sets[setIndex]) return;

    updatedExercises[exerciseIndex].sets[setIndex].completed = true;

    const allSetsCompleted = updatedExercises[exerciseIndex].sets.every(set => set.completed);

    set((state) => ({
      currentWorkout: {
        ...state.currentWorkout,
        exercises: updatedExercises
      }
    }));

    get().startRestTimer(allSetsCompleted);
  },

  // Finalizar treino - VERSÃO FIREBASE
  finishWorkout: async (userId) => {
    try {
      const state = get();
      const { currentWorkout, timer, timerInterval, selectedGroups } = state;
      
      console.log('🚀 === INICIANDO FINALIZAÇÃO (FIREBASE) ===');
      console.log('📊 Exercícios no treino atual:', currentWorkout?.exercises?.map(ex => ({
        name: ex.exerciseData?.exercise?.name,
        userExerciseId: ex.userExerciseId,
        totalSets: ex.sets?.length,
        completedSets: ex.sets?.filter(set => set.completed).length,
        sets: ex.sets
      })));
      
      if (!currentWorkout?.exercises?.length) {
        throw new Error('Nenhum exercício no treino');
      }

      const hasCompletedSets = currentWorkout.exercises.some(exercise => 
        exercise.sets?.some(set => set.completed)
      );
      
      if (!hasCompletedSets) {
        throw new Error('Complete pelo menos uma série');
      }
      
      set({ loading: true });
      
      // Parar timers
      const { workoutTimer } = state;
      if (workoutTimer) workoutTimer.destroy();
      state.stopRestTimer();

      if (!userId) {
        throw new Error('User ID é obrigatório');
      }

      // Preparar dados do treino para Firebase
      const workoutData = {
        userId: userId,
        startTime: currentWorkout.startTime,
        endTime: new Date(),
        duration: timer,
        exercises: currentWorkout.exercises,
        category: selectedGroups.length === 1 ? selectedGroups[0] : selectedGroups.join(', '),
        createdAt: new Date()
      };
      
      console.log('💾 Salvando treino no Firebase...');
      
      // Salvar treino no Firebase
      const workoutRef = await addDoc(collection(db, 'workout_history'), workoutData);
      
      console.log('✅ Treino salvo com sucesso:', workoutRef.id);

      // Atualizar progresso apenas dos exercícios totalmente completos
      const fullyCompletedExercises = currentWorkout.exercises.filter(exercise => {
        const totalSets = exercise.sets?.length || 0;
        const completedSets = exercise.sets?.filter(set => set.completed).length || 0;
        const isFullyCompleted = totalSets > 0 && completedSets === totalSets;
        console.log(`📊 Exercício ${exercise.exerciseData.exercise.name}: ${completedSets}/${totalSets} séries - ${isFullyCompleted ? 'COMPLETO' : 'INCOMPLETO'}`);
        console.log(`🔍 UserExerciseId: ${exercise.userExerciseId}`);
        console.log(`🔍 Sets detalhados:`, exercise.sets);
        return isFullyCompleted;
      });
      
      console.log(`📈 Atualizando progresso de ${fullyCompletedExercises.length} exercícios...`);

      const progressionSuggestions = [];

      // PRIMEIRO: Salvar os valores alterados (peso, séries, reps) de TODOS os exercícios
      console.log('💾 === SALVANDO VALORES ALTERADOS ===');
      const savePromises = currentWorkout.exercises.map(async (exercise) => {
        try {
          if (!exercise.userExerciseId) {
            console.log(`⚠️ Exercício sem userExerciseId: ${exercise.exerciseData?.exercise?.name}`);
            return { success: false, reason: 'No userExerciseId' };
          }

          // Pegar o último peso/reps/sets usados (da última série)
          const lastSet = exercise.sets?.[exercise.sets.length - 1];
          if (!lastSet) {
            console.log(`⚠️ Exercício sem séries: ${exercise.exerciseData?.exercise?.name}`);
            return { success: false, reason: 'No sets' };
          }

          const updateData = {
            current_weight: lastSet.weight || exercise.exerciseData.current_weight || 0,
            currentWeight: lastSet.weight || exercise.exerciseData.current_weight || 0,
            current_reps: lastSet.reps || exercise.exerciseData.current_reps || 0,
            currentReps: lastSet.reps || exercise.exerciseData.current_reps || 0,
            current_sets: exercise.sets.length,
            currentSets: exercise.sets.length,
            updatedAt: new Date()
          };

          console.log(`💾 Salvando valores para ${exercise.exerciseData.exercise.name}:`, updateData);

          await updateDoc(doc(db, 'user_exercises', exercise.userExerciseId), updateData);

          console.log(`✅ Valores salvos para ${exercise.exerciseData.exercise.name}`);
          return { success: true, exercise: exercise.exerciseData.exercise.name };
        } catch (error) {
          console.error(`❌ Erro ao salvar valores de ${exercise.exerciseData?.exercise?.name}:`, error);
          return { success: false, exercise: exercise.exerciseData?.exercise?.name, error };
        }
      });

      await Promise.allSettled(savePromises);
      console.log('✅ === VALORES SALVOS ===');

      // SEGUNDO: Atualizar progresso (completedWorkouts) apenas dos exercícios completos
      const progressPromises = fullyCompletedExercises.map(async (exercise) => {
        try {
          console.log(`🔄 Iniciando atualização de progresso para: ${exercise.exerciseData.exercise.name} (ID: ${exercise.userExerciseId})`);
          console.log(`📊 Dados do exercício antes da atualização:`, exercise.exerciseData);
          const result = await get().updateExerciseProgress(exercise.userExerciseId, true);
          console.log(`✅ Progresso atualizado para ${exercise.exerciseData.exercise.name}:`, result);

          // Se atingiu 10 treinos, adicionar à lista de sugestões
          if (result?.shouldShowProgressionModal) {
            progressionSuggestions.push({
              userExerciseId: exercise.userExerciseId,
              exercise: exercise.exerciseData.exercise,
              currentWeight: result.currentWeight,
              currentReps: result.currentReps,
              progressLevel: result.progressLevel,
              weightUnit: exercise.exerciseData.weightUnit || 'lbs'
            });
          }

          return { success: true, exercise: exercise.exerciseData.exercise.name };
        } catch (error) {
          console.error(`Erro ao atualizar ${exercise.exerciseData.exercise.name}:`, error);
          return { success: false, exercise: exercise.exerciseData.exercise.name, error };
        }
      });
      
      const progressResults = await Promise.allSettled(progressPromises);
      const successCount = progressResults.filter(r => r.status === 'fulfilled' && r.value.success).length;
      
      console.log(`📊 Progresso atualizado: ${successCount}/${fullyCompletedExercises.length}`);
      console.log(`📊 Resultados detalhados:`, progressResults);
      console.log(`🎯 Exercícios que atingiram 10 treinos:`, progressionSuggestions);

      // Recarregar dados
      console.log('🔄 Recarregando dados do usuário...');
      await Promise.all([
        get().fetchWorkoutHistory(userId),
        get().fetchUserExercises(userId)
      ]);
      console.log('✅ Dados recarregados com sucesso');

      // Limpar treino atual
      set({ 
        currentWorkout: null, 
        selectedGroups: [],
        timer: 0,
        workoutTimer: null,
        loading: false 
      });
      
      console.log('🎉 === TREINO FINALIZADO COM SUCESSO ===');
      return { 
        success: true, 
        workoutId: workoutRef.id,
        progressionSuggestions
      };
      
    } catch (error) {
      console.error('❌ === ERRO AO FINALIZAR TREINO ===');
      console.error('❌ Erro:', error.message);
      
      set({ 
        loading: false,
        error: error.message
      });
      
      throw error;
    }
  },

  // Cancelar treino
  cancelWorkout: () => {
    const { workoutTimer } = get();
    if (workoutTimer) {
      workoutTimer.destroy();
    }
    get().stopRestTimer();
    set({ 
      currentWorkout: null, 
      selectedGroups: [],
      timer: 0,
      workoutTimer: null 
    });
  },

  // Atualizar progresso do exercício - VERSÃO FIREBASE
  updateExerciseProgress: async (userExerciseId, completedWorkout = true) => {
    try {
      console.log('🔄 === INICIANDO ATUALIZAÇÃO DE PROGRESSO ===');
      console.log('📝 User Exercise ID:', userExerciseId);
      console.log('✅ Treino completado:', completedWorkout);
      
      if (!userExerciseId) {
        console.warn('No userExerciseId provided');
        return null;
      }

      // Buscar exercício atual no Firebase
      console.log('🔍 Buscando documento no Firebase:', `user_exercises/${userExerciseId}`);
      const exerciseDoc = await getDoc(doc(db, 'user_exercises', userExerciseId));
      
      if (!exerciseDoc.exists()) {
        console.error('❌ Documento não encontrado no Firebase:', userExerciseId);
        console.error('❌ Tentando buscar com collection/doc pattern...');
        
        // Tentar buscar de forma alternativa
        const alternativeQuery = query(
          collection(db, 'user_exercises'),
          where('userId', '==', userId)
        );
        const snapshot = await getDocs(alternativeQuery);
        console.log('🔍 Documentos encontrados na busca alternativa:', snapshot.docs.length);
        
        snapshot.docs.forEach(doc => {
          console.log('📄 Documento encontrado:', { id: doc.id, data: doc.data() });
        });
        
        throw new Error('Exercício não encontrado');
      }
      
      const currentExercise = exerciseDoc.data();
      console.log('📊 Dados atuais do exercício:', currentExercise);
      
      // Calcular novo progresso
      let { 
        progressLevel,
        completedWorkouts,
        currentWeight,
        currentReps,
        currentSets
      } = currentExercise;
      
      // Garantir valores padrão se undefined
      progressLevel = progressLevel ?? 0;
      completedWorkouts = completedWorkouts ?? 0;
      currentWeight = currentWeight ?? 0;
      currentReps = currentReps ?? 8;
      currentSets = currentSets ?? 3;
      
      console.log('📈 Progresso antes da atualização:', {
        progressLevel,
        completedWorkouts,
        currentWeight,
        currentReps,
        currentSets
      });
      
      let shouldShowProgressionModal = false;
      
      if (completedWorkout) {
        completedWorkouts += 1;
        console.log(`🎯 Incrementando treinos completados: ${completedWorkouts - 1} → ${completedWorkouts}`);
        
        if (completedWorkouts >= 10) {
          shouldShowProgressionModal = true;
          console.log('🚀 Atingiu 10 treinos! Evoluindo...');
          if (progressLevel < 2) {
            progressLevel += 1;
            if (progressLevel === 1) {
              currentReps = 10;
              console.log('📈 Evoluiu para nível 1: 3x10');
            } else if (progressLevel === 2) {
              currentReps = 12;
              console.log('📈 Evoluiu para nível 2: 3x12');
            }
            completedWorkouts = 0;
          } else if (progressLevel === 2) {
            currentWeight += 2.5;
            progressLevel = 0;
            currentReps = 8;
            completedWorkouts = 0;
            console.log(`📈 Evoluiu peso: ${currentWeight - 2.5} → ${currentWeight}kg, voltou para 3x8`);
          }
        }
      }
      
      const updatedData = {
        progressLevel,
        completedWorkouts,
        currentWeight,
        currentReps,
        currentSets,
        updatedAt: new Date()
      };
      
      console.log('💾 Salvando progresso no Firebase:', updatedData);
      
      // Atualizar no Firebase
      await updateDoc(doc(db, 'user_exercises', userExerciseId), updatedData);
      
      console.log('✅ Progresso salvo no Firebase');
      
      // Verificar se foi salvo corretamente
      const verifyDoc = await getDoc(doc(db, 'user_exercises', userExerciseId));
      if (verifyDoc.exists()) {
        const verifyData = verifyDoc.data();
        console.log('📊 Dados após atualização no Firebase:', {
          progressLevel: verifyData.progressLevel,
          completedWorkouts: verifyData.completedWorkouts,
          currentWeight: verifyData.currentWeight,
          currentReps: verifyData.currentReps
        });
        
        // Verificar se os dados foram realmente salvos
        if (verifyData.completed_workouts !== updatedData.completed_workouts) {
          console.error('❌ ERRO: Dados não foram salvos corretamente!');
          console.error('❌ Esperado:', updatedData.completed_workouts);
          console.error('❌ Atual:', verifyData.completed_workouts);
          throw new Error('Falha ao salvar progresso no Firebase');
        } else {
          console.log('✅ Verificação: Dados salvos corretamente!');
        }
      }
      
      console.log('✅ === PROGRESSO ATUALIZADO COM SUCESSO ===');
      
      const result = { 
        progressLevel,
        completedWorkouts,
        currentWeight,
        currentReps,
        currentSets,
        shouldShowProgressionModal,
        exerciseData: currentExercise
      };
      console.log('📊 Resultado final:', result);
      
      return result;
    } catch (error) {
      console.error('❌ === ERRO AO ATUALIZAR PROGRESSO ===');
      console.error('❌ Erro completo:', error);
      console.error('❌ Stack trace:', error.stack);
      throw error;
    }
  },

  // Aplicar progressão sugerida
  applyProgression: async (userExerciseId, progressionData) => {
    try {
      console.log('🚀 === APLICANDO PROGRESSÃO SUGERIDA ===');
      console.log('📝 User Exercise ID:', userExerciseId);
      console.log('📊 Dados da progressão:', progressionData);
      
      set({ loading: true });
      
      const updatedData = {
        currentWeight: progressionData.newWeight,
        currentReps: progressionData.newReps,
        progressLevel: progressionData.newLevel,
        completedWorkouts: 0, // Resetar progresso
        updatedAt: new Date()
      };
      
      console.log('💾 Aplicando progressão:', updatedData);
      
      // Atualizar no Firebase
      await updateDoc(doc(db, 'user_exercises', userExerciseId), updatedData);
      
      console.log('✅ Progressão aplicada com sucesso');
      set({ loading: false });
      
      return updatedData;
    } catch (error) {
      console.error('❌ Erro ao aplicar progressão:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Deletar exercício do usuário
  deleteUserExercise: async (userId, exerciseId) => {
    try {
      set({ loading: true });
      
      await deleteDoc(doc(db, 'user_exercises', exerciseId));
      
      await get().fetchUserExercises(userId);
      set({ loading: false });
    } catch (error) {
      console.error('Error deleting exercise:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Atualizar exercício do usuário
  updateUserExercise: async (userId, exerciseId, updateData) => {
    try {
      console.log('🔄 === ATUALIZANDO EXERCÍCIO DO USUÁRIO ===');
      console.log('📝 Exercise ID:', exerciseId);
      console.log('📊 Dados para atualizar:', updateData);

      set({ loading: true });

      // Normalizar dados para ambos os formatos (snake_case e camelCase)
      const normalizedData = {
        current_weight: updateData.current_weight,
        currentWeight: updateData.current_weight,
        current_reps: updateData.current_reps,
        currentReps: updateData.current_reps,
        current_sets: updateData.current_sets,
        currentSets: updateData.current_sets,
        updatedAt: new Date()
      };

      console.log('💾 Salvando dados normalizados:', normalizedData);

      await updateDoc(doc(db, 'user_exercises', exerciseId), normalizedData);

      console.log('✅ Dados salvos no Firebase');

      // Verificar se foi salvo corretamente
      const verifyDoc = await getDoc(doc(db, 'user_exercises', exerciseId));
      if (verifyDoc.exists()) {
        console.log('📊 Dados após salvar:', verifyDoc.data());
      }

      await get().fetchUserExercises(userId);
      set({ loading: false });

      console.log('✅ === EXERCÍCIO ATUALIZADO COM SUCESSO ===');
    } catch (error) {
      console.error('❌ Error updating exercise:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Atualizar detalhes do exercício base
  updateExerciseDetails: async (exerciseId, updateData) => {
    try {
      set({ loading: true });
      
      await updateDoc(doc(db, 'exercises', exerciseId), {
        ...updateData,
        updatedAt: new Date()
      });
      
      set({ loading: false });
      return true;
    } catch (error) {
      console.error('Error updating exercise details:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));