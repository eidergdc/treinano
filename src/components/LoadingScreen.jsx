import React from 'react';
import { motion } from 'framer-motion';
import { GiWeightLiftingUp } from 'react-icons/gi';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-dark flex flex-col items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotateZ: [0, 10, -10, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut" 
          }}
          className="w-32 h-32 mx-auto mb-8 relative"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2
            }}
          >
            <GiWeightLiftingUp className="text-primary w-full h-full" />
          </motion.div>
          
          <motion.div
            className="absolute inset-0"
            animate={{
              boxShadow: [
                "0 0 20px rgba(255,69,0,0.2)",
                "0 0 40px rgba(255,69,0,0.4)",
                "0 0 20px rgba(255,69,0,0.2)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
        
        <motion.h1 
          className="text-4xl font-bold mb-4 neon-text"
          animate={{ 
            textShadow: [
              "0 0 5px #FF4500, 0 0 10px #FF4500",
              "0 0 10px #FF4500, 0 0 20px #FF4500",
              "0 0 5px #FF4500, 0 0 10px #FF4500"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          TREINANO
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xl text-light-darker mb-8"
        >
          Seu parceiro de treino
        </motion.p>
        
        <motion.div 
          className="flex space-x-2 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-primary rounded-full"
              animate={{ 
                y: [0, -10, 0],
                backgroundColor: ["#FF4500", "#4A90E2", "#FF4500"]
              }}
              transition={{ 
                duration: 1, 
                repeat: Infinity, 
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;