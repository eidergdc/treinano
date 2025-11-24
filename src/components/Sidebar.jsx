import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/exercises', icon: '💪', label: 'Exercícios' },
    { path: '/workout', icon: '🏋️', label: 'Treino' },
    { path: '/achievements', icon: '🏆', label: 'Conquistas' },
    { path: '/profile', icon: '👤', label: 'Perfil' },
  ];

  const sidebarVariants = {
    open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
  };

  const menuItemVariants = {
    open: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
    closed: { y: 20, opacity: 0 }
  };

  return (
    <>
      {/* Overlay para dispositivos móveis */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-20 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className="fixed top-0 left-0 h-full w-64 bg-background-paper z-30 shadow-xl lg:relative"
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? 'open' : 'closed'}
      >
        <div className="p-5">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gradient">GymProgress</h2>
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-full hover:bg-background-elevated transition-colors lg:hidden"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {user && (
            <div className="mb-8 p-4 bg-background-elevated rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-primary-DEFAULT flex items-center justify-center text-white text-xl font-bold">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="font-bold">{user.profile?.username || user.email?.split('@')[0]}</div>
                  <div className="text-sm text-text-secondary">Nível {user.profile?.level || 1}</div>
                </div>
              </div>
              
              {user.profile && (
                <div className="mt-3">
                  <div className="text-xs text-text-secondary mb-1">Experiência</div>
                  <div className="w-full h-2 bg-background-DEFAULT rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary-DEFAULT"
                      initial={{ width: 0 }}
                      animate={{ width: `${(user.profile.experience % 100)}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <nav>
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <motion.li key={item.path} variants={menuItemVariants}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 p-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-primary-DEFAULT text-white font-medium'
                          : 'hover:bg-background-elevated'
                      }`
                    }
                    onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                </motion.li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg bg-background-elevated hover:bg-background-DEFAULT transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sair</span>
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;