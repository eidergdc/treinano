import { create } from 'zustand';
import { supabase } from '../supabase';
import { toast } from 'react-toastify';

export const useAchievementStore = create((set, get) => ({
  achievements: [],
  userAchievements: [],
  challenges: [],
  userChallenges: [],
  userProfile: null,
  loading: false,
  error: null,

  // Inicializar o store
  initialize: async (userId) => {
    try {
      set({ loading: true });
      
      // Buscar perfil do usuário
      await get().fetchUserProfile(userId);
      
      // Buscar conquistas e desafios
      await Promise.all([
        get().fetchAchievements(),
        get().fetchUserAchievements(userId),
        get().fetchChallenges(),
        get().fetchUserChallenges(userId)
      ]);
      
      set({ loading: false });
    } catch (error) {
      console.error('Erro ao inicializar achievement store:', error);
      set({ error: error.message, loading: false });
    }
  },

  // Buscar perfil do usuário
  fetchUserProfile: async (userId) => {
    try {
      set({ loading: true });
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        // Se o perfil não existir, criar um novo
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert({ id: userId })
            .select()
            .single();
          
          if (createError) throw createError;
          
          set({ userProfile: newProfile, loading: false });
          return newProfile;
        }
        
        throw error;
      }
      
      set({ userProfile: data, loading: false });
      return data;
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      set({ error: error.message, loading: false });
      return null;
    }
  },

  // Buscar todas as conquistas
  fetchAchievements: async () => {
    try {
      set({ loading: true });
      
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('requirement_value', { ascending: true });
      
      if (error) throw error;
      
      set({ achievements: data, loading: false });
      return data;
    } catch (error) {
      console.error('Erro ao buscar conquistas:', error);
      set({ error: error.message, loading: false });
      return [];
    }
  },

  // Buscar conquistas do usuário
  fetchUserAchievements: async (userId) => {
    try {
      set({ loading: true });
      
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });
      
      if (error) throw error;
      
      set({ userAchievements: data, loading: false });
      return data;
    } catch (error) {
      console.error('Erro ao buscar conquistas do usuário:', error);
      set({ error: error.message, loading: false });
      return [];
    }
  },

  // Buscar desafios ativos
  fetchChallenges: async () => {
    try {
      set({ loading: true });
      
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .gte('end_date', new Date().toISOString())
        .order('end_date', { ascending: true });
      
      if (error) throw error;
      
      set({ challenges: data, loading: false });
      return data;
    } catch (error) {
      console.error('Erro ao buscar desafios:', error);
      set({ error: error.message, loading: false });
      return [];
    }
  },

  // Buscar progresso de desafios do usuário
  fetchUserChallenges: async (userId) => {
    try {
      set({ loading: true });
      
      const { data, error } = await supabase
        .from('user_challenges')
        .select(`
          *,
          challenge:challenges(*)
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      set({ userChallenges: data, loading: false });
      return data;
    } catch (error) {
      console.error('Erro ao buscar progresso de desafios:', error);
      set({ error: error.message, loading: false });
      return [];
    }
  },

  // Verificar e atualizar conquistas manualmente
  checkAchievements: async (userId, type, value) => {
    try {
      set({ loading: true });
      
      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;
      
      // Buscar conquistas relacionadas ao tipo
      const { data: achievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .eq('requirement_type', type)
        .lte('requirement_value', value)
        .order('requirement_value', { ascending: true });
      
      if (achievementsError) throw achievementsError;
      
      // Buscar conquistas já desbloqueadas pelo usuário
      const { data: userAchievements, error: userAchievementsError } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);
      
      if (userAchievementsError) throw userAchievementsError;
      
      // Filtrar conquistas que ainda não foram desbloqueadas
      const unlockedAchievementIds = userAchievements.map(ua => ua.achievement_id);
      const newAchievements = achievements.filter(a => !unlockedAchievementIds.includes(a.id));
      
      // Desbloquear novas conquistas
      for (const achievement of newAchievements) {
        const { error: insertError } = await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievement.id
          });
        
        if (insertError) throw insertError;
        
        // Adicionar experiência ao usuário
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            experience: profile.experience + achievement.experience_reward
          })
          .eq('id', userId);
        
        if (updateError) throw updateError;
        
        // Mostrar notificação
        toast.success(`🏆 Conquista desbloqueada: ${achievement.name}`, {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
      
      // Atualizar dados
      if (newAchievements.length > 0) {
        await Promise.all([
          get().fetchUserProfile(userId),
          get().fetchUserAchievements(userId)
        ]);
      }
      
      set({ loading: false });
      return newAchievements;
    } catch (error) {
      console.error('Erro ao verificar conquistas:', error);
      set({ error: error.message, loading: false });
      return [];
    }
  },

  // Atualizar progresso em um desafio
  updateChallengeProgress: async (userId, challengeId, progress) => {
    try {
      set({ loading: true });
      
      // Verificar se o usuário já tem progresso neste desafio
      const { data: existingProgress, error: checkError } = await supabase
        .from('user_challenges')
        .select('*')
        .eq('user_id', userId)
        .eq('challenge_id', challengeId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') throw checkError;
      
      // Buscar informações do desafio
      const { data: challenge, error: challengeError } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', challengeId)
        .single();
      
      if (challengeError) throw challengeError;
      
      // Verificar se o desafio ainda está ativo
      const now = new Date();
      const endDate = new Date(challenge.end_date);
      
      if (now > endDate) {
        set({ loading: false });
        return { error: 'Este desafio já terminou' };
      }
      
      // Verificar se o desafio já foi completado
      if (existingProgress && existingProgress.completed) {
        set({ loading: false });
        return { error: 'Este desafio já foi completado' };
      }
      
      // Atualizar ou inserir progresso
      let result;
      
      if (existingProgress) {
        // Atualizar progresso existente
        const newProgress = Math.min(progress, challenge.requirement_value);
        const completed = newProgress >= challenge.requirement_value;
        
        const { data, error } = await supabase
          .from('user_challenges')
          .update({
            current_progress: newProgress,
            completed,
            completed_at: completed ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingProgress.id)
          .select();
        
        if (error) throw error;
        
        result = data[0];
        
        // Se o desafio foi completado, adicionar experiência
        if (completed && !existingProgress.completed) {
          // Buscar perfil do usuário
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('experience')
            .eq('id', userId)
            .single();
          
          if (profileError) throw profileError;
          
          // Adicionar experiência
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({
              experience: profile.experience + challenge.experience_reward
            })
            .eq('id', userId);
          
          if (updateError) throw updateError;
          
          // Mostrar notificação
          toast.success(`🎯 Desafio completado: ${challenge.title}`, {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      } else {
        // Inserir novo progresso
        const newProgress = Math.min(progress, challenge.requirement_value);
        const completed = newProgress >= challenge.requirement_value;
        
        const { data, error } = await supabase
          .from('user_challenges')
          .insert({
            user_id: userId,
            challenge_id: challengeId,
            current_progress: newProgress,
            completed,
            completed_at: completed ? new Date().toISOString() : null
          })
          .select();
        
        if (error) throw error;
        
        result = data[0];
        
        // Se o desafio foi completado, adicionar experiência
        if (completed) {
          // Buscar perfil do usuário
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('experience')
            .eq('id', userId)
            .single();
          
          if (profileError) throw profileError;
          
          // Adicionar experiência
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({
              experience: profile.experience + challenge.experience_reward
            })
            .eq('id', userId);
          
          if (updateError) throw updateError;
          
          // Mostrar notificação
          toast.success(`🎯 Desafio completado: ${challenge.title}`, {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      }
      
      // Atualizar dados
      await Promise.all([
        get().fetchUserProfile(userId),
        get().fetchUserChallenges(userId)
      ]);
      
      set({ loading: false });
      return { data: result };
    } catch (error) {
      console.error('Erro ao atualizar progresso do desafio:', error);
      set({ error: error.message, loading: false });
      return { error: error.message };
    }
  },

  // Adicionar experiência ao usuário
  addExperience: async (userId, amount) => {
    try {
      set({ loading: true });
      
      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('experience')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;
      
      // Adicionar experiência
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          experience: profile.experience + amount
        })
        .eq('id', userId)
        .select();
      
      if (error) throw error;
      
      set({ userProfile: data[0], loading: false });
      return data[0];
    } catch (error) {
      console.error('Erro ao adicionar experiência:', error);
      set({ error: error.message, loading: false });
      return null;
    }
  }
}));