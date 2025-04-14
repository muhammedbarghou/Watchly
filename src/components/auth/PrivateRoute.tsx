import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LockIcon, LogIn, Mail, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import Loader from '../Loader';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiresEmailVerification?: boolean;
}

export function PrivateRoute({ children, requiresEmailVerification = true }: PrivateRouteProps) {
  const { 
    currentUser, 
    loading, 
    isThirdPartyAuth, 
    isEmailVerified, 
    sendEmailVerification 
  } = useAuth();
  
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Add safety timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!initialLoadComplete) {
        console.log('Forcing initial load complete after timeout');
        setInitialLoadComplete(true);
      }
    }, 3000); // 3 second timeout

    return () => clearTimeout(timer);
  }, []);

  // Mark initial load complete when loading finishes
  useEffect(() => {
    if (!loading && !initialLoadComplete) {
      console.log('Initial auth load completed');
      setInitialLoadComplete(true);
    }
  }, [loading, initialLoadComplete]);

  // Log auth state for debugging
  useEffect(() => {
    console.log('PrivateRoute auth state:', { 
      currentUser: !!currentUser, 
      loading, 
      isThirdPartyAuth,
      isEmailVerified,
      initialLoadComplete,
      requiresEmailVerification
    });
  }, [currentUser, loading, isThirdPartyAuth, isEmailVerified, initialLoadComplete, requiresEmailVerification]);

  const handleResendVerification = async () => {
    try {
      setSending(true);
      // Add a delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      await sendEmailVerification();
      toast.success('Verification email sent. Please check your inbox.');
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast.error('Failed to send verification email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Show loading state during initial load
  if (loading && !initialLoadComplete) {
    return <Loader />;
  }

  // If not authenticated, show login required screen
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

  // Check if email verification is required
  const needsVerification = requiresEmailVerification && 
                          !isEmailVerified && 
                          !isThirdPartyAuth;
  
  // If verification needed, show verification screen
  if (needsVerification) {
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
              className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Mail className="w-8 h-8 text-orange-600 dark:text-orange-500" />
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-4"
            >
              Email Verification Required
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 dark:text-gray-300 text-center mb-4"
            >
              You need to verify your email address before you can access this page. Please check your inbox for a verification link.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Why verify?</h3>
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    Email verification helps us secure your account and protect your content.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col gap-4"
            >
              <Button 
                onClick={handleResendVerification}
                disabled={sending}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white gap-2"
              >
                {sending ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent mr-2"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/login')}
                className="w-full"
              >
                Back to Login
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
              Didn't receive the email?{' '}
              <button 
                onClick={() => navigate('/settings')}
                className="text-orange-600 dark:text-orange-400 hover:underline font-medium"
              >
                Check your settings
              </button>
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // User is authenticated and verified (or verification not required)
  return <>{children}</>;
}