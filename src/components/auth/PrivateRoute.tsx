import React from 'react';
import { motion } from 'framer-motion';
import { useAppSelector } from '@/store/Store';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LockIcon, LogIn } from 'lucide-react';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { currentUser, loading } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center bg-black">
        <div className="w-full gap-x-2 flex justify-center items-center">
          <div className="w-5 bg-[#d00000] h-5 rounded-full animate-bounce"></div>
          <div className="w-5 h-5 bg-[#dc2f02] rounded-full animate-bounce"></div>
          <div className="w-5 h-5 bg-[#e85d04] rounded-full animate-bounce"></div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
        >
          <div className="p-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <LockIcon className="w-8 h-8 text-red-600 dark:text-red-500" />
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-4"
            >
              Authentication Required
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 dark:text-gray-300 text-center mb-8"
            >
              You must be logged in to access this page. Please sign in to continue.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col gap-4"
            >
              <Button 
                onClick={() => navigate('/login')}
                className="w-full bg-red-600 hover:bg-red-700 text-white gap-2"
              >
                <LogIn className="w-4 h-4" />
                Go to Login
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full"
              >
                Return to Home
              </Button>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-50 dark:bg-gray-700/50 px-8 py-4"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Don't have an account?{' '}
              <button 
                onClick={() => navigate('/signup')}
                className="text-red-600 dark:text-red-400 hover:underline font-medium"
              >
                Sign up now
              </button>
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}