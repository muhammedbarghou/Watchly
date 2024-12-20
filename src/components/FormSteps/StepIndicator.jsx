import React from 'react';

export const StepIndicator = ({ stepsItems, currentStep }) => (
  <header className="max-w-screen-xl w-full mx-auto px-4 md:px-8 py-4">
    <ul aria-label="Steps" className="items-center text-black bold grid grid-cols-2 gap-4 md:flex">
      {stepsItems.map((item, idx) => (
        <li 
          aria-current={currentStep === idx + 1 ? "step" : false} 
          className="flex-1 flex md:items-center" 
          key={idx}
        >
          <div className={`flex-1 flex items-center gap-x-3 md:block ${idx !== 0 ? "md:space-x-10" : ""}`}>
            <span className={`hidden md:block h-24 w-1 md:w-full md:h-1 transition-all duration-300 ${
              currentStep > idx + 1 ? "bg-[#D00000]" : "bg-gray-200"
            }`}></span>
            <div className="md:mt-2">
              <p className={`text-xs md:text-sm font-bold ${
                currentStep > idx + 1 ? "text-[#D00000]" : "text-black dark:text-white"
              }`}>Step {idx + 1}</p>
              <h3 className="mt-1 text-sm md:text-base font-medium text-black dark:text-white">
                {item}
              </h3>
            </div>
          </div>
        </li>
      ))}
    </ul>
  </header>
);