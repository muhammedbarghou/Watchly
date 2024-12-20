import React from 'react';
import {Check} from 'lucide-react';

export const Success = ({ handleBack }) => (
  <div className="flex flex-col justify-center items-center h-[85%] w-full gap-8 text-base font-sans">
    <Check className="w-16 h-16 text-white border-1 rounded-full p-2 bg-green-500" />
    <h2 className="w-full text-center text-[#1f0909] font-bold text-2xl capitalize mb-5 dark:text-white">
      Registration successful!
    </h2>
    <p className="text-center text-[#1f0909] dark:text-white">
      You have successfully registered.
    </p>
    <button 
      onClick={handleBack} 
      className='inline-block hover:bg-[#6A040F] rounded-md bg-red-600 text-white text-center text-lg py-4 w-40 transition-all duration-500 cursor-pointer m-1' 
      aria-label="Back to login"
    >
      Back to login
    </button>
  </div>
);