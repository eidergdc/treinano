import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFirebaseAuthStore } from './stores/firebaseAuthStore';
import { useWorkoutStore } from './stores/workoutStore';
import { useThemeStore } from './stores/themeStore';
import { registerSW } from 'virtual:pwa-register';
import BackgroundTimer from './utils/BackgroundTimer';
import ServiceWorkerManager from './utils/ServiceWorkerManager';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Exercises from './pages/Exercises';
import ExerciseDetail from './pages/ExerciseDetail';
import Profile from './pages/Profile';
import Workout from './pages/Workout';
import Achievements from './pages/Achievements';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';
import InstallPrompt from './components/InstallPrompt';
import LevelUpModal from './components/LevelUpModal';

function App() {
  const { user, initialized, initialize } = useFirebaseAuthStore();
  const { fetchUserExercises } = useWorkoutStore();
  const { initializeTheme } = useThemeStore();
  const [isLoading, setIsLoading] = useState(true);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);

  // Initialize auth
  useEffect(() => {
    const init = async () => {
      try {
        console.log('🔧 Iniciando autenticação...');
        if (!initialized) {
          await initialize();
          console.log('✅ Autenticação inicializada');
        }

        // Initialize theme after auth is ready
        console.log('🎨 Inicializando tema após autenticação...');
        initializeTheme();
        console.log('✅ Tema inicializado');

        // Inicializar Service Worker para notificações - DESABILITADO TEMPORARIAMENTE
        // console.log('🔔 Inicializando Service Worker...');
        // ServiceWorkerManager.initialize();
        // console.log('✅ Service Worker inicializado');

        // Recuperar timers perdidos
        const recoveredTimers = BackgroundTimer.recoverTimers();
        if (recoveredTimers.length > 0) {
          console.log('🔄 Timers recuperados:', recoveredTimers);
        }

        // Reduce loading time to 1 second
        setTimeout(() => {
          console.log('✅ App pronto!');
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('❌ Erro durante inicialização:', error);
        setIsLoading(false);
      }
    };

    init();
  }, [initialized, initialize]);

  // Garantir que o tema seja aplicado quando o componente montar
  useEffect(() => {
    // Aguardar um pouco para garantir que o DOM está pronto
    const timer = setTimeout(() => {
      console.log('🔄 Verificando e aplicando tema...');
      initializeTheme();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Load user exercises when user is authenticated
  useEffect(() => {
    if (user?.uid) {
      console.log('🔄 App: Usuário autenticado, carregando exercícios...');
      fetchUserExercises(user.uid);
    }
  }, [user?.uid, fetchUserExercises]);

  // Register service worker for PWA
  useEffect(() => {
    // Desabilitar temporariamente o service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        console.log('🔍 Service Workers encontrados:', registrations.length);
        registrations.forEach(registration => {
          console.log('🗑️ Removendo service worker:', registration);
          registration.unregister();
        });
      });
    }

    // Comentado temporariamente para debug
    // const updateSW = registerSW({
    //   onNeedRefresh() {
    //     console.log('🔄 Nova versão disponível, recarregando...');
    //     window.location.reload();
    //   },
    //   onOfflineReady() {
    //     console.log('✅ App pronto para funcionar offline');
    //   },
    //   immediate: true,
    // });

    // return () => {
    //   updateSW && updateSW();
    // };
  }, []);

  // Detect if app can be installed
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Example of how to show level up modal
  const handleLevelUp = (level) => {
    setNewLevel(level);
    setShowLevelUp(true);
  };

  // Show loading screen only during initialization
  if (!initialized || isLoading) {
    return <LoadingScreen />;
  }

  // After initialized, render appropriate content
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-dark to-dark-lighter text-light"
    >
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/exercises/:id" element={<ExerciseDetail />} />
          <Route path="/workout" element={<Workout />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {showInstallPrompt && (
        <InstallPrompt onClose={() => setShowInstallPrompt(false)} />
      )}

      {showLevelUp && (
        <LevelUpModal level={newLevel} onClose={() => setShowLevelUp(false)} />
      )}
    </motion.div>
  );
}

export default App;