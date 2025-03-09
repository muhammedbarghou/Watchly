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
import { AlertCircle, Check, EyeOff, Eye, Mail } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from 'sonner'

const passwordRequirements = {
  minLength: 8,
  requireNumbers: true,
  requireSpecialChars: true,
  requireUppercase: true,
};

const signupSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  password: z.string()
    .min(passwordRequirements.minLength, `Password must be at least ${passwordRequirements.minLength} characters`)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .regex(/^[a-zA-Z]+(?: [a-zA-Z]+)*$/, 'Please enter a valid full name')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export function SignForm() {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, signInWithFacebook, sendEmailVerification, clearError } = useAuth();
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');

  const { register, handleSubmit, formState: { errors, isSubmitting, dirtyFields }, watch } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange'
  });

  const password = watch('password', '');
  const passwordStrength = {
    length: password.length >= passwordRequirements.minLength,
    number: /[0-9]/.test(password),
    special: /[^a-zA-Z0-9]/.test(password),
    uppercase: /[A-Z]/.test(password),
  };

  const onSubmit = async (data: SignupFormData) => {
    try {
      setError('');
      clearError();
      setUserEmail(data.email);
      
      // Create the account
      await signUp(data.email, data.password, data.fullName);
      
      // Send verification email
      await sendEmailVerification();
      
      // Show verification screen
      setVerificationSent(true);
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'facebook') => {
    try {
      setError('');
      clearError();
      
      // Sign in with social provider
      const signInMethod = provider === 'google' ? signInWithGoogle : signInWithFacebook;
      await signInMethod();
      
      // Check if email verification is needed
      // Note: This is handled in the thunk now, which redirects authenticated users
      // or shows error if email verification is needed
    } catch (err: any) {
      console.error(`${provider} sign in error:`, err);
      setError(`Failed to sign in with ${provider}. Please try again.`);
    }
  };

  const handleResendVerification = async () => {
    try {
      await sendEmailVerification();
      toast.success('Verification email resent. Please check your inbox.');
    } catch (err: any) {
      console.error('Error resending verification:', err);
      setError('Failed to resend verification email. Please try again.');
    }
  };

  // If verification email is sent, show verification screen
  if (verificationSent) {
    return (
      <div className="flex flex-col items-center gap-6 p-6 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-800">
          <Mail className="h-8 w-8 text-netflix-red" />
        </div>
        
        <h1 className="text-2xl font-bold text-white">Verify your email</h1>
        
        <p className="text-balance text-sm text-muted-foreground max-w-md">
          We've sent a verification link to <span className="font-medium text-white">{userEmail}</span>. 
          Please check your inbox and click the link to verify your account.
        </p>
        
        <Alert className="bg-blue-900/30 border-blue-700 max-w-md">
          <AlertTitle className="text-blue-400">Important</AlertTitle>
          <AlertDescription className="text-blue-300">
            You won't be able to sign in until you verify your email address.
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <Button 
            onClick={handleResendVerification}
            variant="outline" 
            className="w-full border-white/20 text-white hover:bg-white/10"
          >
            Resend verification email
          </Button>
          
          <Button 
            onClick={() => navigate('/login')}
            className="w-full bg-netflix-red hover:bg-netflix-red/90"
          >
            Go to login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold text-white">Create your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your information below to create your account
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
          <Label htmlFor="fullName" className="text-white">Full Name</Label>
          <Input 
            id="fullName" 
            type="text" 
            placeholder="John Doe" 
            {...register('fullName')}
            disabled={isSubmitting}
            className={`text-white ${errors.fullName ? 'border-red-500' : dirtyFields.fullName ? 'border-green-500' : ''}`}
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email" className="text-white">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="m@example.com" 
            {...register('email')}
            disabled={isSubmitting}
            className={`text-white ${errors.email ? 'border-red-500' : dirtyFields.email ? 'border-green-500' : ''}`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password" className="text-white">Password</Label>
          <div className="relative">
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"}
              placeholder="********"
              {...register('password')}
              disabled={isSubmitting}
              className={`text-white pr-10 ${errors.password ? 'border-red-500' : dirtyFields.password ? 'border-green-500' : ''}`}
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

          <div className="grid grid-cols-2 gap-2 mt-2">
            {Object.entries(passwordStrength).map(([key, isValid]) => (
              <div
                key={key}
                className={`flex items-center gap-1 text-sm ${isValid ? 'text-green-500' : 'text-gray-400'}`}
              >
                {isValid ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                {key === 'length' ? `${passwordRequirements.minLength}+ characters` :
                 key === 'number' ? 'Number' :
                 key === 'special' ? 'Special character' : 'Uppercase letter'}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
          <div className="relative">
            <Input 
              id="confirmPassword" 
              type={showConfirmPassword ? "text" : "password"}
              placeholder="********"
              {...register('confirmPassword')}
              disabled={isSubmitting}
              className={`text-white pr-10 ${errors.confirmPassword ? 'border-red-500' : dirtyFields.confirmPassword ? 'border-green-500' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Alert className="bg-blue-900/30 border-blue-700">
          <AlertCircle className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-300">
            You'll need to verify your email address before you can use the app.
          </AlertDescription>
        </Alert>

        <div className="text-white text-sm">
          By clicking the button below, you agree to our{' '}
          <a href="/terms-of-services" className="underline underline-offset-2 text-netflix-red hover:text-netflix-red/80">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy-policy" className="underline underline-offset-2 text-netflix-red hover:text-netflix-red/80">
            Privacy Policy
          </a>.
        </div>

        <Button 
          type="submit" 
          className="w-full bg-netflix-red hover:bg-netflix-red/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </Button>
        
        <SocialAuthButtons
          onGoogleClick={() => handleSocialSignIn('google')}
          onFacebookClick={() => handleSocialSignIn('facebook')}
          disabled={isSubmitting}
        />
      </div>

      <div className="text-center text-sm text-white">
        Already have an account?{' '}
        <a href="/login" className="underline underline-offset-4 text-netflix-red hover:text-netflix-red/80">
          Sign in
        </a>
      </div>
    </form>
  );
}