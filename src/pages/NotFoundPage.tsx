import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import logo from "@/assets/logo (1).png";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search, AlertCircle } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  
  // Auto-redirect countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      navigate('/');
    }
  }, [countdown, navigate]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  };

  return (
    <main className="bg-gradient-to-b from-netflix-black to-gray-900 min-h-screen flex flex-col">
      <div className="max-w-screen-xl mx-auto px-6 flex items-center justify-start h-screen md:px-8">
        <motion.div 
          className="w-full max-w-lg mx-auto text-center"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Logo with animation */}
          <motion.div 
            className="pb-8"
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
          >
            <img 
              src={logo} 
              width={180} 
              className="mx-auto" 
              alt="Logo" 
              onClick={() => navigate('/')}
              style={{ cursor: 'pointer' }}
            />
          </motion.div>
          
          {/* 404 Display */}
          <motion.div 
            className="relative"
            variants={itemVariants}
          >
            <motion.div
              className="absolute -inset-4 bg-[#d00000]/30 rounded-full blur-xl"
              variants={pulseVariants}
              animate="pulse"
            />
            <h1 className="text-[#d00000] font-bold text-[120px] leading-tight">
              404
            </h1>
          </motion.div>
          
          {/* Error Message */}
          <motion.h3 
            className="text-gray-100 text-4xl font-semibold sm:text-5xl mt-2"
            variants={itemVariants}
          >
            Page not found
          </motion.h3>
          
          <motion.div 
            className="flex items-center justify-center mt-4 text-gray-300 space-x-2"
            variants={itemVariants}
          >
            <AlertCircle className="h-5 w-5 text-[#d00000]" />
            <p>We couldn't find the page you were looking for</p>
          </motion.div>
          
          <motion.p 
            className="text-gray-400 mt-6 max-w-md mx-auto"
            variants={itemVariants}
          >
            The page you are looking for might have been removed, had its name changed, 
            or is temporarily unavailable.
          </motion.p>
          
          {/* Suggestions */}
          <motion.div 
            className="mt-8 bg-black/30 p-4 rounded-lg border border-gray-800"
            variants={itemVariants}
          >
            <h4 className="text-gray-200 font-medium mb-2">You might want to:</h4>
            <ul className="text-left text-gray-400 space-y-2 ml-6 list-disc">
              <li>Check the URL for typing errors</li>
              <li>Return to the previous page</li>
              <li>Visit our homepage</li>
              <li>Contact support if you believe this is an error</li>
            </ul>
          </motion.div>
          
          {/* Action Buttons */}
          <motion.div 
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
            variants={itemVariants}
          >
            <Button 
              onClick={() => navigate(-1)} 
              variant="outline" 
              className="w-full sm:w-auto flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            
            <Button 
              onClick={() => navigate('/')} 
              className="w-full sm:w-auto flex items-center gap-2 bg-[#d00000] hover:bg-red-700"
            >
              <Home className="h-4 w-4" />
              Home Page
            </Button>
            
            <Button 
              onClick={() => navigate('/search')} 
              variant="ghost" 
              className="w-full sm:w-auto flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Search
            </Button>
          </motion.div>
          
          {/* Auto-redirect Notice */}
          <motion.p 
            className="text-gray-500 mt-8 text-sm"
            variants={itemVariants}
          >
            Redirecting to homepage in {countdown} seconds...
          </motion.p>
        </motion.div>
      </div>
    </main>
  );
}

export default NotFoundPage;