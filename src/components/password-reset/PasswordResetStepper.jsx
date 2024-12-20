import { cn } from '../../lib/utils.ts';
import React from 'react';
import { Check } from 'lucide-react';

const StepperItem = ({ isCompleted, isActive, index, title }) => {
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center transition duration-200 text-sm',
          isCompleted ? 'bg-[#d00000] text-white' : isActive ? 'border-2 border-[#d00000] text-[#d00000]' : 'border-2 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
        )}
      >
        {isCompleted ? <Check className='w-5 h-5'/> : index + 1}
      </div>
      <p className={cn(
        'text-sm whitespace-nowrap',
        isActive ? 'text-[#d00000] font-medium' : 
        isCompleted ? 'text-[#d00000] font-medium' : 
        'text-gray-500 dark:text-gray-400'
      )}>
        {title}
      </p>
    </div>
  );
};

const PasswordResetStepper = ({ steps, currentStep }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
      {steps.map((step, index) => (
        <StepperItem
          key={step.title}
          isCompleted={index < currentStep}
          isActive={index === currentStep}
          index={index}
          title={step.title}
        />
      ))}
    </div>
  );
};

export { StepperItem, PasswordResetStepper };
