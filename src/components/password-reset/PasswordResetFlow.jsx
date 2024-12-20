import React, { useState } from 'react';
import { Mail, KeyRound, Lock, Check } from 'lucide-react';
import { PasswordResetStepper } from './PasswordResetStepper.jsx';
import { EmailStep } from './steps/EmailStep.jsx';
import { CodeStep } from './steps/CodeStep.jsx';
import { NewPasswordStep } from './steps/NewPasswordStep.jsx';
import { SuccessStep } from './steps/SuccessStep.jsx';
import logolight from '../../Imgs/Logo2.png';
import logodark from '../../Imgs/logo.png';
import {ThemeToggle} from '../theme/ThemeToggle';


const steps = [
  {
    title: 'Email Verification',
    icon: Mail,
    component: EmailStep
  },
  {
    title: 'Code Verification',
    icon: KeyRound,
    component: CodeStep
  },
  {
    title: 'New Password',
    icon: Lock,
    component: NewPasswordStep
  },
  {
    title: 'Success',
    icon: Check,
    component: SuccessStep
  }
];

const PasswordResetFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    password: ''
  });

  const handleNext = (data) => {
    if (currentStep === 0) {
      setFormData(prev => ({ ...prev, email: data }));
    } else if (currentStep === 1) {
      setFormData(prev => ({ ...prev, code: data }));
    } else if (currentStep === 2) {
      setFormData(prev => ({ ...prev, password: data }));
    }
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gray-300 dark:bg-gray-950 flex flex-col">
      <nav className='w-full py-4 px-4 sm:px-6 bg-white dark:bg-gray-800 flex justify-between items-center'>
          <img src={logolight} className='h-8 sm:h-10 w-auto' alt='logo' />
          <ThemeToggle />
      </nav>
      <main className='flex-1 flex items-center justify-center p-4 sm:p-6'>
        <section className='w-full sm:w-[90%] md:w-[80%] lg:w-[60%] bg-white dark:bg-gray-800 shadow-lg rounded-lg mx-auto'>
          <header className="p-6 border-b dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Reset Password</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Follow the steps below to reset your password
            </p>
          </header>
          <div className='py-5 px-4 sm:px-6 '>
            <div className='w-full sm:w-[90%] mx-auto'>
              <PasswordResetStepper steps={steps} currentStep={currentStep} />
            </div>
          </div>
          <div className='p-6'>
            <CurrentStepComponent
              onNext={handleNext}
              onBack={handleBack}
              formData={formData}
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export { PasswordResetFlow };
