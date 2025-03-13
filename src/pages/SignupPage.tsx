import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/use-auth'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, Check, EyeOff, Eye, Mail, ArrowRight, Loader2 } from 'lucide-react'

// Password requirements configuration
const passwordRequirements = {
  minLength: 8,
  requireNumbers: true,
  requireSpecialChars: true,
  requireUppercase: true,
};

// Form validation schema
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
    .regex(/^[a-zA-Z]+(?: [a-zA-Z]+)*$/, 'Please enter a valid full name'),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and privacy policy",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupPage() {
  const navigate = useNavigate();
  const { 
    signUp, 
    signInWithGoogle, 
    signInWithFacebook, 
    sendEmailVerification, 
    clearError,
    loading: authLoading 
  } = useAuth();
  
  // State variables
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form setup using react-hook-form
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      termsAccepted: false
    }
  });

  // Watch password to check strength
  const password = form.watch('password', '');
  const passwordStrength = {
    length: password.length >= passwordRequirements.minLength,
    number: /[0-9]/.test(password),
    special: /[^a-zA-Z0-9]/.test(password),
    uppercase: /[A-Z]/.test(password),
  };

  // Form submission handler
  const onSubmit = async (data: SignupFormData) => {
    try {
      setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  // Social sign-in handler
  const handleSocialSignIn = async (provider: 'google' | 'facebook') => {
    try {
      setIsSubmitting(true);
      setError('');
      clearError();
      
      // Sign in with social provider
      const signInMethod = provider === 'google' ? signInWithGoogle : signInWithFacebook;
      await signInMethod();
      
      // Navigate to hub (if successful)
      navigate('/hub');
    } catch (err: any) {
      console.error(`${provider} sign in error:`, err);
      
      if (err.message && err.message.includes('verify your email')) {
        setVerificationSent(true);
        setUserEmail(err.email || '');
      } else {
        setError(`Failed to sign in with ${provider}. Please try again.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verification email resend handler
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
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
        {/* Navbar with Logo */}
        <nav className="w-full py-4 px-6 flex justify-center sm:justify-start">
          <Link to="/" className="inline-block">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-10 w-auto"
              onError={(e) => {
                // Fallback if image doesn't load
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0yMCAxMEgxMDBWMzBIMjBWMTBaIiBmaWxsPSIjRTUwOTE0Ii8+PHRleHQgeD0iNjAiIHk9IjI1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIj5OZXRmbGl4PC90ZXh0Pjwvc3ZnPg=='
              }}
            />
          </Link>
        </nav>
      
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center p-6"
        >
          <Card className="w-full max-w-md bg-gray-800 border-gray-700">
            <CardHeader className="space-y-1 items-center text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-gray-900 mb-4">
                <Mail className="h-8 w-8 text-netflix-red" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">Verify Your Email</CardTitle>
              <CardDescription className="text-gray-400">
                We've sent a verification link to <span className="font-medium text-netflix-red">{userEmail}</span>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4 text-center">
              <p className="text-sm text-gray-300">
                Please check your inbox and click the link to verify your account before signing in.
              </p>
              
              <Alert className="bg-blue-900/30 border-blue-700">
                <AlertTitle className="text-blue-400">Important</AlertTitle>
                <AlertDescription className="text-blue-300">
                  You won't be able to sign in until you verify your email address.
                </AlertDescription>
              </Alert>
              
              <div className="flex flex-col gap-2 pt-4">
                <Button 
                  onClick={handleResendVerification}
                  variant="outline" 
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  Resend verification email
                </Button>
                
                <Button 
                  onClick={() => navigate('/login')}
                  className="w-full mt-2 bg-netflix-red hover:bg-netflix-red/90"
                >
                  Go to login
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Navbar with Logo */}
      <nav className="w-full py-4 px-6 flex justify-center sm:justify-start">
        <Link to="/" className="inline-block">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="h-10 w-auto"
            onError={(e) => {
              // Fallback if image doesn't load
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTIwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0yMCAxMEgxMDBWMzBIMjBWMTBaIiBmaWxsPSIjRTUwOTE0Ii8+PHRleHQgeD0iNjAiIHk9IjI1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIj5OZXRmbGl4PC90ZXh0Pjwvc3ZnPg=='
            }}
          />
        </Link>
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center p-6"
      >
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-white">Create account</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your information below to create your account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-900/50 border-red-800 text-white">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Full Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="John Doe" 
                          className="text-white bg-gray-700 border-gray-600 focus:border-netflix-red focus:ring-netflix-red/20"
                          disabled={isSubmitting}
                          autoComplete="name"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="your.email@example.com" 
                          className="text-white bg-gray-700 border-gray-600 focus:border-netflix-red focus:ring-netflix-red/20"
                          disabled={isSubmitting}
                          autoComplete="email"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="text-white bg-gray-700 border-gray-600 pr-10 focus:border-netflix-red focus:ring-netflix-red/20"
                            disabled={isSubmitting}
                            autoComplete="new-password"
                            {...field} 
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                            tabIndex={-1}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500" />
                      
                      {/* Password strength indicators */}
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {Object.entries(passwordStrength).map(([key, isValid]) => (
                          <div
                            key={key}
                            className={`flex items-center gap-1 text-xs ${isValid ? 'text-green-500' : 'text-gray-400'}`}
                          >
                            {isValid ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                            {key === 'length' ? `${passwordRequirements.minLength}+ characters` :
                             key === 'number' ? 'Number' :
                             key === 'special' ? 'Special character' : 'Uppercase letter'}
                          </div>
                        ))}
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="text-white bg-gray-700 border-gray-600 pr-10 focus:border-netflix-red focus:ring-netflix-red/20"
                            disabled={isSubmitting}
                            autoComplete="new-password"
                            {...field} 
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                            tabIndex={-1}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                
                <Alert className="bg-blue-900/30 border-blue-700">
                  <AlertCircle className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-blue-300">
                    You'll need to verify your email address before signing in.
                  </AlertDescription>
                </Alert>
                
                <FormField
                  control={form.control}
                  name="termsAccepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-netflix-red data-[state=checked]:border-netflix-red mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm text-gray-300">
                          I agree to the{' '}
                          <a href="/terms-of-service" className="text-netflix-red hover:text-netflix-red/90 hover:underline">
                            Terms of Service
                          </a>{' '}
                          and{' '}
                          <a href="/privacy-policy" className="text-netflix-red hover:text-netflix-red/90 hover:underline">
                            Privacy Policy
                          </a>
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-netflix-red hover:bg-netflix-red/90 transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                
                <div className="relative my-4">
                  <Separator className="bg-gray-700" />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-xs uppercase text-gray-500 bg-gray-800">
                    Or continue with
                  </span>
                </div>
                
                <SocialAuthButtons
                  onGoogleClick={() => handleSocialSignIn('google')}
                  onFacebookClick={() => handleSocialSignIn('facebook')}
                  disabled={isSubmitting}
                />
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="flex justify-center border-t border-gray-700 pt-4">
            <p className="text-center text-sm text-gray-300">
              Already have an account?{' '}
              <Link to="/login" className="text-netflix-red hover:text-netflix-red/90 font-semibold hover:underline transition">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
        
        {/* Trust signals */}
        <div className="flex items-center gap-2 mt-6 text-xs text-gray-500">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secure connection
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Privacy protected
          </div>
        </div>
      </motion.div>
    </div>
  );
}