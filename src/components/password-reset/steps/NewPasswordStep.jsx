import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

const NewPasswordStep = ({ onNext, onBack }) => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(schema)
  });

  const password = watch('password', '');
  const requirements = [
    { regex: /.{8,}/, text: 'At least 8 characters' },
    { regex: /[A-Z]/, text: 'One uppercase letter' },
    { regex: /[a-z]/, text: 'One lowercase letter' },
    { regex: /[0-9]/, text: 'One number' },
    { regex: /[^A-Za-z0-9]/, text: 'One special character' }
  ];

  const onSubmit = (data) => {
    onNext(data.password);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <div className="p-4 sm:p-6 space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              New Password
            </label>
            <input
              {...register('password')}
              type="password"
              id="password"
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d00000] focus:border-transparent transition-colors duration-200"
            />
            {errors.password && (
              <p className="text-sm text-red-500 dark:text-red-400">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Confirm Password
            </label>
            <input
              {...register('confirmPassword')}
              type="password"
              id="confirmPassword"
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d00000] focus:border-transparent transition-colors duration-200"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 dark:text-red-400">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Password Requirements:</p>
            <ul className="space-y-1">
              {requirements.map(({ regex, text }) => (
                <li
                  key={text}
                  className={`text-sm flex items-center space-x-2 ${
                    regex.test(password)
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <span>{regex.test(password) ? '✓' : '○'}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors duration-200"
          >
            Back
          </button>
          <button
            type="submit"
            className="w-full sm:flex-1 bg-[#d00000] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#d00000]/90 focus:outline-none focus:ring-2 focus:ring-[#d00000] focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors duration-200"
          >
            Reset Password
          </button>
        </div>
      </div>
    </form>
  );
};

export { NewPasswordStep };
