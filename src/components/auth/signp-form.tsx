import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/use-auth'
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons'
import { useState } from 'react'

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters')
});

type SignupFormData = z.infer<typeof signupSchema>;

export function SignForm() {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, signInWithFacebook, loading, error: authError } = useAuth();
  const [error, setError] = useState<string>('');
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema)
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      setError('');
      await signUp(data.email, data.password, data.fullName);
      navigate('/friends');
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred during signup';
      setError(errorMessage);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      await signInWithGoogle();
      navigate('/friends');
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to sign in with Google';
      setError(errorMessage);
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      setError('');
      await signInWithFacebook();
      navigate('/friends');
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to sign in with Facebook';
      setError(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold text-white">Create your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your info below to create your account
        </p>
      </div>

      {(error || authError) && (
        <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">
          {error || authError}
        </div>
      )}

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="fullName" className="text-white">Full Name</Label>
          <Input 
            id="fullName" 
            type="text" 
            placeholder="John Doe" 
            {...register('fullName')}
            disabled={loading}
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm">{errors.fullName?.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email" className="text-white">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="m@example.com" 
            {...register('email')}
            disabled={loading}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password" className="text-white">Password</Label>
          </div>
          <Input 
            id="password" 
            type="password" 
            {...register('password')}
            disabled={loading}
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
        
        <SocialAuthButtons
          onGoogleClick={handleGoogleSignIn}
          onFacebookClick={handleFacebookSignIn}
          disabled={loading}
        />
      </div>

      <div className="text-center text-sm text-white">
        Already have an account?{' '}
        <a href="/login" className="underline underline-offset-4 text-netflix-red">
          Sign in
        </a>
      </div>
    </form>
  );
}