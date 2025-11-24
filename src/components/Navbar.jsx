import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';

const Navbar = ({ toggleSidebar }) => {
  const { user, signOut } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timer);
    };
  }, []);

  return (
    <motion.nav 
      className={`sticky top-0 z-10 px-4 py-3 flex items-center justify-between transition-all duration-300 ${
        scrolled ? 'bg-background-paper shadow-lg' : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
    >
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-background-elevated transition-colors mr-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <Link to="/dashboard" className="flex items-center">
          <motion.div 
            className="text-2xl font-bold text-gradient"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            GymProgress
          </motion.div>
        </Link>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="hidden md:block text-text-secondary">
          {time.toLocaleTimeString()}
        </div>
        
        {user && (
          <div className="flex items-center">
            <Link to="/profile">
              <motion.div 
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-background-elevated transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-8 h-8 rounded-full bg-primary-DEFAULT flex items-center justify-center text-white font-bold">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden md:block">{user.profile?.username || user.email?.split('@')[0]}</span>
              </motion.div>
            </Link>
          </div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;