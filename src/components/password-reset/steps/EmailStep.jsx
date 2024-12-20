import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  email: z.string().email('Please enter a valid email address')
});

const EmailStep = ({ onNext }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = (data) => {
    onNext(data.email);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <div className="p-4 sm:p-6 space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            placeholder="Enter your email"
            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d00000] focus:border-transparent transition-colors duration-200"
          />
          {errors.email && (
            <p className="text-sm text-red-500 dark:text-red-400">{errors.email.message}</p>
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-[#d00000] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#d00000]/90 focus:outline-none focus:ring-2 focus:ring-[#d00000] focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors duration-200"
        >
          Send Reset Code
        </button>
      </div>
    </form>
  );
};

export { EmailStep };
