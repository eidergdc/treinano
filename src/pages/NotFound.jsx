import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.h1
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ 
            duration: 0.5,
            type: "spring",
            stiffness: 200
          }}
          className="text-8xl font-bold neon-text mb-4"
        >
          404
        </motion.h1>
        
        <h2 className="text-2xl font-bold mb-6">Página não encontrada</h2>
        
        <p className="text-light-darker mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>
        
        <Link to="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary flex items-center justify-center mx-auto"
          >
            <FiHome className="mr-2" />
            Voltar para o Início
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;