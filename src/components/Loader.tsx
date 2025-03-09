import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function Loader() {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Loading');
  const colors = ['#d00000', '#dc2f02', '#e85d04', '#f48c06', '#faa307'];
  
  // Simulate loading progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 500);
    
    // Loading text animation
    const textInterval = setInterval(() => {
      setLoadingText(prev => {
        if (prev === 'Loading...') return 'Loading';
        return prev + '.';
      });
    }, 400);
    
    return () => {
      clearInterval(interval);
      clearInterval(textInterval);
    };
  }, []);
  
  // Variants for container animation
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };
  
  const progressVariants = {
    initial: { width: '0%' },
    animate: { 
      width: `${Math.min(progress, 100)}%`,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-b from-black to-gray-900">
      {/* Animated logo/brand element */}
      <motion.div
        className="mb-16 relative"
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 360]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <motion.div 
          className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500"
          animate={{
            boxShadow: [
              "0 0 20px rgba(220, 47, 2, 0.7)",
              "0 0 60px rgba(220, 47, 2, 0.7)",
              "0 0 20px rgba(220, 47, 2, 0.7)"
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute inset-0 rounded-full border-4 border-white border-opacity-30"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.8, 0.2, 0.8]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
      
      {/* Main dots animation */}
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="flex justify-center items-center gap-3 mb-12"
      >
        {colors.map((color, index) => (
          <motion.div
            key={color}
            className="relative"
            animate={{
              y: [0, -40, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: [0.76, 0, 0.24, 1], // Custom spring-like easing
              delay: index * 0.12,
            }}
          >
            <motion.div 
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: color }}
              whileHover={{ scale: 1.5 }}
              animate={{
                boxShadow: [
                  `0 0 10px ${color}`,
                  `0 0 20px ${color}`,
                  `0 0 10px ${color}`
                ]
              }}
              transition={{
                boxShadow: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            />
            
            {/* Reflection/shadow effect */}
            <motion.div
              className="w-8 h-2 rounded-full mt-4 mx-auto"
              style={{ 
                background: `radial-gradient(ellipse at center, ${color}50 0%, transparent 70%)`,
                filter: "blur(2px)"
              }}
              animate={{
                opacity: [0.8, 0.2, 0.8],
                width: ["60%", "100%", "60%"]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.12,
              }}
            />
          </motion.div>
        ))}
      </motion.div>
      
      {/* Loading text and progress */}
      <div className="flex flex-col items-center justify-center w-full max-w-md px-8">
        <div className="flex justify-between w-full mb-2">
          <motion.span 
            className="text-white text-xl font-bold"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {loadingText}
          </motion.span>
          <motion.span 
            className="text-white text-xl font-bold"
            animate={{ 
              color: colors
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {Math.min(Math.round(progress), 100)}%
          </motion.span>
        </div>
        
        {/* Progress bar background */}
        <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden">
          {/* Animated progress fill */}
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-500"
            variants={progressVariants}
            initial="initial"
            animate="animate"
          >
            {/* Animated shine effect */}
            <motion.div
              className="h-full w-20 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
              animate={{
                x: ['-100%', '400%']
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </div>
      </div>
      
      {/* Optional tip text */}
      <motion.p 
        className="text-gray-400 mt-12 text-center max-w-md px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: [0, 1, 0],
          y: [20, 0, 20]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      >
        "Preparing your viewing experience. The waiting makes the watching better."
      </motion.p>
    </div>
  );
}

export default Loader;