import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { AuthLayout } from '../components/auth/AuthLayout';
import { SocialAuthButtons } from '../components/auth/SocialAuthButtons';
import { AuthDivider } from '../components/auth/AuthDivider';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters')
});

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupPage() {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, signInWithFacebook } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema)
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      await signUp(data.email, data.password, data.fullName);
      navigate('/friends');
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate('/friends');
    } catch (error) {
      console.error('Google sign in error:', error);
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      await signInWithFacebook();
      navigate('/friends');
    } catch (error) {
      console.error('Facebook sign in error:', error);
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Start watching together with friends"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-200">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            {...register('fullName')}
            className="mt-1 block w-full rounded-md border border-netflix-gray bg-netflix-black text-white px-3 py-2"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-netflix-red">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-200">
            Email
          </label>
          <input
            type="email"
            id="email"
            {...register('email')}
            className="mt-1 block w-full rounded-md border border-netflix-gray bg-netflix-black text-white px-3 py-2"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-netflix-red">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-200">
            Password
          </label>
          <input
            type="password"
            id="password"
            {...register('password')}
            className="mt-1 block w-full rounded-md border border-netflix-gray bg-netflix-black text-white px-3 py-2"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-netflix-red">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full">
          <Mail className="w-4 h-4 mr-2" />
          Sign up with Email
        </Button>

        <AuthDivider text="or continue with" />
        
        <SocialAuthButtons
          onGoogleClick={handleGoogleSignIn}
          onFacebookClick={handleFacebookSignIn}
        />
      </form>
    </AuthLayout>
  );
}