import { create } from 'zustand';
import { supabase } from '../supabase';
import { toast } from 'react-toastify';

export const useAuthStore = create((set) => ({
  user: null,
  initialized: false,
  loading: false,
  error: null,

  initialize: async () => {
    try {
      set({ loading: true });
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        try {
          // Get user profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
            
          set({ 
            user: { 
              ...session.user,
              profile 
            }
          });
        } catch (error) {
          console.error('Error fetching profile:', error);
          set({ user: session.user });
        }
      }
      
      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            try {
              // Get user profile data
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();
                
              set({ 
                user: { 
                  ...session.user,
                  profile 
                }
              });
            } catch (error) {
              console.error('Error fetching profile:', error);
              set({ user: session.user });
            }
          } else if (event === 'SIGNED_OUT') {
            set({ user: null });
          }
        }
      );
      
      set({ initialized: true, loading: false });
      
      return () => {
        subscription?.unsubscribe();
      };
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ error: error.message, loading: false, initialized: true });
    }
  },

  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null });

      // Debug logging
      console.log('Attempting sign in with Supabase URL:', import.meta.env.VITE_SUPABASE_URL);

      // Primeiro, verificar se já existe uma sessão ativa
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      if (existingSession) {
        await supabase.auth.signOut();
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;

      // Aguardar um momento para garantir que a sessão foi estabelecida
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        // Get user profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();
          
        set({ 
          user: { 
            ...data.user,
            profile 
          },
          loading: false 
        });
      } catch (profileError) {
        console.error('Error fetching profile:', profileError);
        set({ 
          user: data.user,
          loading: false 
        });
      }
      
      return data;
    } catch (error) {
      console.error('Error signing in:', error);
      
      // Enhanced error handling
      let errorMessage = error.message;
      if (error.message === 'Failed to fetch') {
        errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.';
        console.error('Network error details:', {
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
          error: error
        });
      }
      
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  signUp: async (email, password, userData) => {
    try {
      set({ loading: true, error: null });

      // Debug logging
      console.log('Attempting sign up with Supabase URL:', import.meta.env.VITE_SUPABASE_URL);

      // Primeiro, verificar se já existe uma sessão ativa
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      if (existingSession) {
        await supabase.auth.signOut();
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });
      
      if (error) throw error;

      // Create user profile
      if (data.user) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              username: userData.name,
              level: 1,
              experience: 0,
              total_workouts: 0,
              total_exercises: 0,
              total_weight_lifted: 0,
              streak_days: 0,
              created_at: new Date().toISOString()
            });

          if (profileError) throw profileError;
        } catch (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }
      
      set({ loading: false });
      return data;
    } catch (error) {
      console.error('Error signing up:', error);
      
      // Enhanced error handling
      let errorMessage = error.message;
      if (error.message === 'Failed to fetch') {
        errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.';
        console.error('Network error details:', {
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
          error: error
        });
      }
      
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  signOut: async () => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // Limpar o estado local
      set({ 
        user: null, 
        loading: false,
        initialized: false 
      });

      // Limpar o localStorage
      localStorage.clear();
    } catch (error) {
      console.error('Error signing out:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateProfile: async (userData) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase.auth.updateUser({
        data: userData,
      });
      
      if (error) throw error;
      
      try {
        // Update profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .update({
            username: userData.name,
            avatar_url: userData.avatar_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.user.id)
          .select()
          .single();

        if (profileError) throw profileError;

        set({ 
          user: { 
            ...data.user,
            profile 
          }, 
          loading: false 
        });
      } catch (profileError) {
        console.error('Error updating profile:', profileError);
        set({
          user: data.user,
          loading: false
        });
      }
      
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },
}));