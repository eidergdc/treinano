import { create } from 'zustand';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc,
  getDoc, 
  updateDoc 
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { toast } from 'react-toastify';

export const useFirebaseAuthStore = create((set, get) => ({
  user: null,
  initialized: false,
  loading: false,
  error: null,

  initialize: async () => {
    try {
      set({ loading: true });
      
      // Listen for auth state changes
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            // Get user profile data from Firestore
            const userDocRef = doc(db, 'profiles', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);
            
            const profile = userDoc.exists() ? userDoc.data() : null;
            
            set({ 
              user: { 
                ...firebaseUser,
                profile 
              }
            });
          } catch (error) {
            console.error('Error fetching profile:', error);
            set({ user: firebaseUser });
          }
        } else {
          set({ user: null });
        }
      });
      
      set({ initialized: true, loading: false });
      
      return unsubscribe;
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ error: error.message, loading: false, initialized: true });
    }
  },

  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null });

      console.log('Attempting sign in with Firebase');
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      try {
        // Get user profile data from Firestore
        const userDocRef = doc(db, 'profiles', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        const profile = userDoc.exists() ? userDoc.data() : null;
        
        set({ 
          user: { 
            ...firebaseUser,
            profile 
          },
          loading: false 
        });
      } catch (profileError) {
        console.error('Error fetching profile:', profileError);
        set({ 
          user: firebaseUser,
          loading: false 
        });
      }
      
      return userCredential;
    } catch (error) {
      console.error('Error signing in:', error);
      
      let errorMessage = error.message;
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuário não encontrado';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Senha incorreta';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
      }
      
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  signUp: async (email, password, userData) => {
    try {
      set({ loading: true, error: null });

      console.log('Attempting sign up with Firebase');
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update Firebase Auth profile
      await firebaseUpdateProfile(firebaseUser, {
        displayName: userData.name
      });

      // Create user profile in Firestore
      const profileData = {
        id: firebaseUser.uid,
        username: userData.name,
        email: firebaseUser.email,
        level: 1,
        experience: 0,
        total_workouts: 0,
        total_exercises: 0,
        total_weight_lifted: 0,
        streak_days: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const userDocRef = doc(db, 'profiles', firebaseUser.uid);
      await setDoc(userDocRef, profileData);
      
      set({ 
        user: {
          ...firebaseUser,
          profile: profileData
        },
        loading: false 
      });
      
      return userCredential;
    } catch (error) {
      console.error('Error signing up:', error);
      
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email já está em uso';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      }
      
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  signOut: async () => {
    try {
      set({ loading: true, error: null });
      
      await firebaseSignOut(auth);
      
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
      
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }
      
      console.log('Current user:', {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName
      });
      
      // Update Firebase Auth profile
      if (userData.name) {
        console.log('🔄 Atualizando Firebase Auth displayName...');
        await firebaseUpdateProfile(currentUser, {
          displayName: userData.name
        });
        console.log('✅ Firebase Auth displayName atualizado para:', userData.name);
      }
      
      // Update Firestore profile
      const userDocRef = doc(db, 'profiles', currentUser.uid);
      console.log('🔄 Referência do documento Firestore:', userDocRef.path);
      
      // Check if profile document exists
      console.log('🔄 Verificando se documento do perfil existe...');
      let userDoc = await getDoc(userDocRef);
      console.log('📄 Documento existe no Firestore:', userDoc.exists());
      
      if (userDoc.exists()) {
        console.log('📄 Dados atuais do documento:', userDoc.data());
      }
      
      const updateData = {
        ...(userData.name && { username: userData.name }),
        ...(userData.avatar_url !== undefined && { avatar_url: userData.avatar_url }),
        ...(userData.height !== undefined && { height: userData.height }),
        ...(userData.weight !== undefined && { weight: userData.weight }),
        ...(userData.target_weight !== undefined && { target_weight: userData.target_weight }),
        ...(userData.age !== undefined && { age: userData.age }),
        ...(userData.goal !== undefined && { goal: userData.goal }),
        ...(userData.experience_level !== undefined && { experience_level: userData.experience_level }),
        ...(userData.training_time !== undefined && { training_time: userData.training_time }),
        ...(userData.preferred_time !== undefined && { preferred_time: userData.preferred_time }),
        ...(userData.favorite_exercises !== undefined && { favorite_exercises: userData.favorite_exercises }),
        ...(userData.motivation !== undefined && { motivation: userData.motivation }),
        ...(userData.weekly_goal !== undefined && { weekly_goal: userData.weekly_goal }),
        ...(userData.bio !== undefined && { bio: userData.bio }),
        updated_at: new Date().toISOString()
      };
      
      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });
      
      console.log('📝 Dados finais para salvar no Firestore:', updateData);
      
      if (userDoc.exists()) {
        // Update existing document
        console.log('🔄 Atualizando documento existente no Firestore...');
        await updateDoc(userDocRef, updateData);
        console.log('✅ Documento Firestore atualizado com sucesso');
      } else {
        // Create new document if it doesn't exist
        console.log('🔄 Documento não existe, criando novo...');
        await setDoc(userDocRef, {
          id: currentUser.uid,
          email: currentUser.email,
          username: userData.name || currentUser.displayName || '',
          avatar_url: userData.avatar_url || '',
          height: userData.height || null,
          weight: userData.weight || null,
          target_weight: userData.target_weight || null,
          age: userData.age || null,
          goal: userData.goal || null,
          experience_level: userData.experience_level || null,
          training_time: userData.training_time || null,
          preferred_time: userData.preferred_time || null,
          favorite_exercises: userData.favorite_exercises || [],
          motivation: userData.motivation || null,
          weekly_goal: userData.weekly_goal || 3,
          bio: userData.bio || null,
          level: 1,
          experience: 0,
          total_workouts: 0,
          total_exercises: 0,
          total_weight_lifted: 0,
          streak_days: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        console.log('✅ Novo documento Firestore criado com sucesso');
      }
      
      // Get updated profile
      console.log('🔄 Buscando perfil atualizado do Firestore...');
      userDoc = await getDoc(userDocRef);
      const profile = userDoc.exists() ? userDoc.data() : null;
      console.log('📄 Perfil atualizado do Firestore:', profile);
      
      // Update local state
      const updatedUser = {
        ...currentUser,
        profile
      };
      
      console.log('🔄 Atualizando estado local...');
      set({ 
        user: updatedUser,
        loading: false 
      });
      
      console.log('✅ Estado local atualizado:', {
        uid: updatedUser.uid,
        displayName: updatedUser.displayName,
        profile: updatedUser.profile
      });
      console.log('🎉 Perfil salvo com sucesso!');
      
      return { user: updatedUser };
    } catch (error) {
      console.error('❌ ERRO ao atualizar perfil:', error);
      console.error('❌ Tipo do erro:', error.constructor.name);
      console.error('❌ Mensagem do erro:', error.message);
      console.error('❌ Stack trace completo:', error.stack);
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));