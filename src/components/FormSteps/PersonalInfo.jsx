import React, { useState } from 'react';
import { CircleUser, Mail, Phone } from 'lucide-react';

export const PersonalInfo = ({
  formData,
  errors,
  handleChange,
  nextStep,
}) => {
  const [showErrors, setShowErrors] = useState(false);

  const validateForm = () => {
    if (!formData.username || formData.username.length < 8 || formData.username.length > 15) {
      return 'Username must be between 8 and 15 characters.';
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'Please enter a valid email address.';
    }
    if (!formData.phone || !/^\d{10}$/.test(formData.phone)) {
      return 'Phone number must be 10 digits.';
    }
    return null;
  };

  const handleNext = (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setShowErrors(true);
      return;
    }
    nextStep();
  };

  return (
    <form onSubmit={handleNext} className="flex flex-col justify-center items-center h-full w-full px-4 md:px-0">
      <h2 className="w-full text-center text-[#1f0909] font-bold text-xl md:text-2xl capitalize mb-5 dark:text-white">
        Step 1: Enter your personal information
      </h2>
      <div className="w-full md:w-2/3 lg:w-1/3 flex flex-col gap-5 items-center">
        {showErrors && validateForm() && (
          <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{validateForm()}</span>
          </div>
        )}
        <div id='username' className="relative w-full">
          <CircleUser className="absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-400"/>
          <input 
            type="text" 
            value={formData.username} 
            onChange={handleChange("username")} 
            placeholder="Enter your username" 
            className="w-full pl-12 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-red-500 rounded"
          />
        </div>
        {errors.username && (
          <div className="bg-red-50 text-red-600 p-2 rounded-md flex items-center space-x-2 w-full">
            <div className="text-sm">{errors.username}</div>
          </div>
        )}
        <div id='email' className="relative w-full">
          <Mail className="absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-400"/>
          <input 
            type="email" 
            value={formData.email} 
            onChange={handleChange("email")} 
            placeholder="Enter your email" 
            className="w-full pl-12 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-red-500 rounded"
          />
        </div>
        {errors.email && (
          <div className="bg-red-50 text-red-600 p-2 rounded-md flex items-center space-x-2 w-full">
            <div className="text-sm">{errors.email}</div>
          </div>
        )}
        <div id='phone' className="relative w-full">
          <Phone className="absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-400"/>
          <input 
            type="tel" 
            value={formData.phone} 
            onChange={handleChange("phone")} 
            placeholder="Enter your phone number" 
            className="w-full pl-12 pr-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-red-500 rounded"
          />
        </div>
        {errors.phone && (
          <div className="bg-red-50 text-red-600 p-2 rounded-md flex items-center space-x-2 w-full">
            <div className="text-sm">{errors.phone}</div>
          </div>
        )}
      </div>
      <div className="flex justify-center items-center gap-2.5 w-full mt-5">
        <button
          type="submit"
          className={`inline-block rounded-md bg-red-600 text-white text-center text-base md:text-lg py-3 md:py-4 px-6 md:px-8 w-28 md:w-32 transition-all duration-500 cursor-pointer m-1 hover:bg-[#6A040F] ${validateForm() ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleNext}
        >
          <span className="relative inline-block transition-all duration-500">Next</span>
        </button>
      </div>
    </form>
  );
};