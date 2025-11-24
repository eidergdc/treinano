import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiUser, FiPlay, FiMenu, FiX, FiLogOut, FiAward } from 'react-icons/fi';
import { FiBarChart2, FiSettings } from 'react-icons/fi';
import { GiWeightLiftingUp } from 'react-icons/gi';
import { useFirebaseAuthStore } from '../stores/firebaseAuthStore';
import { useWorkoutStore } from '../stores/workoutStore';
import Timer from './Timer';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useFirebaseAuthStore();
  const { currentWorkout, timer, formatTimer } = useWorkoutStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const navItems = [
    { path: '/dashboard', icon: <FiHome size={24} />, label: 'Início' },
    { path: '/exercises', icon: <GiWeightLiftingUp size={24} />, label: 'Exercícios' },
    { path: '/workout', icon: <FiPlay size={24} />, label: 'Treinar' },
    { path: '/analytics', icon: <FiBarChart2 size={24} />, label: 'Analytics' },
    { path: '/achievements', icon: <FiAward size={24} />, label: 'Conquistas' },
    { path: '/profile', icon: <FiUser size={24} />, label: 'Perfil' },
    { path: '/settings', icon: <FiSettings size={24} />, label: 'Config' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-dark-lighter">
      {/* Top background to match header */}
      <div className="fixed top-0 left-0 right-0 h-6 bg-dark-lighter z-40"></div>
      
      {/* Header */}
      <header className="fixed top-6 left-0 right-0 bg-dark-lighter shadow-md z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="mr-2"
            >
              <GiWeightLiftingUp size={28} className="text-primary" />
            </motion.div>
            <h1 className="text-xl font-bold neon-text">TREINANO</h1>
          </Link>

          {/* Timer display if workout is active */}
          {currentWorkout && (
            <div className="hidden md:flex items-center">
              <Timer time={formatTimer()} />
            </div>
          )}

          {/* Mobile menu button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-light p-2 rounded-full hover:bg-dark-light transition-colors"
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`p-2 rounded-lg flex flex-col items-center transition-all duration-300 ${
                  location.pathname === item.path
                    ? 'text-primary bg-dark-light'
                    : 'text-light hover:text-primary hover:bg-dark-light'
                }`}
              >
                {item.icon}
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            ))}
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg flex flex-col items-center text-light hover:text-primary hover:bg-dark-light transition-all duration-300"
            >
              <FiLogOut size={24} />
              <span className="text-xs mt-1">Sair</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-dark-lighter border-t border-dark-medium overflow-hidden"
          >
            <nav className="container mx-auto px-4 py-2 flex flex-col">
              {currentWorkout && (
                <div className="py-2 flex justify-center">
                  <Timer time={formatTimer()} />
                </div>
              )}
              
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`p-3 rounded-lg flex items-center space-x-3 transition-all duration-300 ${
                    location.pathname === item.path
                      ? 'text-primary bg-dark-light'
                      : 'text-light hover:text-primary hover:bg-dark-light'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleSignOut();
                }}
                className="p-3 rounded-lg flex items-center space-x-3 text-light hover:text-primary hover:bg-dark-light transition-all duration-300"
              >
                <FiLogOut size={24} />
                <span>Sair</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-6 pt-24">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-dark-lighter py-4 border-t border-dark-medium">
        <div className="container mx-auto px-4 text-center text-light-darker text-sm">
          <p>© 2025 Treinano - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;