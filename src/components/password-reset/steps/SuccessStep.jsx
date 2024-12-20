import React from 'react';
import { useNavigate } from 'react-router-dom';

const SuccessStep = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full p-4 sm:p-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
          <span className="text-green-600 dark:text-green-400 text-2xl">✓</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Password Reset Successfully!
        </h3>
        <p className="text-center text-gray-600 dark:text-gray-300 text-sm sm:text-base">
          Your password has been reset successfully. You can now login with your new password.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="w-full sm:w-auto px-6 bg-[#d00000] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#d00000]/90 focus:outline-none focus:ring-2 focus:ring-[#d00000] focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors duration-200"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export { SuccessStep };
