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
import { AlertCircle, EyeOff, Eye, Mail } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

const loginSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  password: z.string()
    .min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const navigate = useNavigate();
  const { signInWithEmail, signInWithGoogle, signInWithFacebook, sendEmailVerification, clearError } = useAuth();
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange'
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      clearError();
      setUserEmail(data.email);
      
      await signInWithEmail(data.email, data.password);
      navigate('/hub');
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Check if error message is about email verification
      if (err.message && err.message.includes('verify your email')) {
        setNeedsVerification(true);
      } else {
        setError(err.message || 'Failed to sign in. Please try again.');
      }
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'facebook') => {
    try {
      setError('');
      clearError();
      
      const signInMethod = provider === 'google' ? signInWithGoogle : signInWithFacebook;
      await signInMethod();
      navigate('/hub');
    } catch (err: any) {
      console.error(`${provider} sign in error:`, err);
      
      // Check if error message is about email verification
      if (err.message && err.message.includes('verify your email')) {
        setNeedsVerification(true);
      } else {
        setError(`Failed to sign in with ${provider}. Please try again.`);
      }
    }
  };

  const handleResendVerification = async () => {
    try {
      await sendEmailVerification();
      setError('');
      // Show success message
      alert('Verification email sent. Please check your inbox.');
    } catch (err: any) {
      console.error('Error sending verification email:', err);
      setError('Failed to send verification email. Please try again.');
    }
  };

  // Show verification needed screen
  if (needsVerification) {
    return (
      <div className="flex flex-col items-center gap-6 p-6 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-800">
          <Mail className="h-8 w-8 text-netflix-red" />
        </div>
        
        <h1 className="text-2xl font-bold text-white">Email verification required</h1>
        
        <p className="text-balance text-sm text-muted-foreground max-w-md">
          You need to verify your email address before signing in. Please check your inbox for a verification link.
        </p>
        
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <Button 
            onClick={handleResendVerification}
            variant="outline" 
            className="w-full border-white/20 text-white hover:bg-white/10"
          >
            Resend verification email
          </Button>
          
          <Button 
            onClick={() => setNeedsVerification(false)}
            className="w-full bg-netflix-red hover:bg-netflix-red/90"
          >
            Try another account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold text-white">Sign in to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Welcome back! Enter your details to access your account
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-white">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="m@example.com" 
            {...register('email')}
            disabled={isSubmitting}
            className="text-white"
          />
          {errors.email && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-white">Password</Label>
            <a href="/forgot-password" className="text-sm text-netflix-red hover:underline">
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"}
              placeholder="********"
              {...register('password')}
              disabled={isSubmitting}
              className="text-white pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.password.message}
            </p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full bg-netflix-red hover:bg-netflix-red/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </Button>
        
        <SocialAuthButtons
          onGoogleClick={() => handleSocialSignIn('google')}
          onFacebookClick={() => handleSocialSignIn('facebook')}
          disabled={isSubmitting}
        />
      </div>

      <div className="text-center text-sm text-white">
        Don't have an account?{' '}
        <a href="/signup" className="underline underline-offset-4 text-netflix-red hover:text-netflix-red/80">
          Sign up
        </a>
      </div>
    </form>
  );
}