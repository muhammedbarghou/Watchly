import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/hooks/use-auth'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, EyeOff, Eye, Mail, ArrowRight, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import logo from "@/assets/logo.png"
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { toast } from 'sonner'

// Define schema for validation
const loginSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  password: z.string()
    .min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

// Type definition for form data
type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { 
    signInWithEmail, 
    signInWithGoogle, 
    signInWithFacebook, 
    sendEmailVerification, 
    clearError,
    loading: authLoading 
  } = useAuth();
  
  // State variables
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [lastLoginEmail, setLastLoginEmail] = useState<string | null>(null);
  
  // Form setup using react-hook-form
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: lastLoginEmail || '',
      password: '',
      rememberMe: false,
    },
  });

  // Check if user is already logged in - redirect if they are
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If the user is already authenticated but needs verification
        if (!user.emailVerified) {
          // Check if they're using third-party auth
          const isThirdParty = user.providerData.some(
            provider => provider.providerId === 'google.com' || provider.providerId === 'facebook.com'
          );
          
          // If using email/password and not verified, show verification screen
          if (!isThirdParty) {
            setNeedsVerification(true);
            setUserEmail(user.email || '');
          } else {
            // If using third-party auth, redirect to hub
            console.log('User authenticated with third-party provider, redirecting to hub');
            navigate('/hub', { replace: true });
          }
        } else {
          // User is verified, redirect to hub
          console.log('User authenticated and verified, redirecting to hub');
          navigate('/hub', { replace: true });
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Get stored email on component mount
  useEffect(() => {
    const storedEmail = localStorage.getItem('lastLoginEmail');
    if (storedEmail) {
      setLastLoginEmail(storedEmail);
      form.setValue('email', storedEmail);
      form.setValue('rememberMe', true);
    }
  }, [form]);

  // Form submission handler
  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSigningIn(true);
      setError('');
      clearError();
      setUserEmail(data.email);
      
      // Save email to localStorage if rememberMe is checked
      if (data.rememberMe) {
        localStorage.setItem('lastLoginEmail', data.email);
      } else {
        localStorage.removeItem('lastLoginEmail');
      }
      
      await signInWithEmail(data.email, data.password);
      
      // After successful login, let the auth state listener handle the redirect
      console.log('Sign in successful, authentication state listener will handle redirect');

    } catch (err: any) {
      console.error('Login error:', err);
      
      // Check if error message is about email verification
      if (err.message && err.message.includes('verify your email')) {
        setNeedsVerification(true);
      } else {
        setError(err.message || 'Failed to sign in. Please try again.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  // Social sign-in handler with improved logging
  const handleSocialSignIn = async (provider: 'google' | 'facebook') => {
    try {
      setIsSigningIn(true);
      setError('');
      clearError();
      
      console.log(`Starting ${provider} sign-in process`);
      const signInMethod = provider === 'google' ? signInWithGoogle : signInWithFacebook;
      
      await signInMethod();
      console.log(`${provider} sign-in successful, auth state listener will handle redirect`);
      
      // Don't navigate here - let the auth state listener handle it
      
    } catch (err: any) {
      console.error(`${provider} sign in error:`, err);
      
      // Handle specific error cases
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        console.log('Sign-in popup was closed by user');
        // Don't show error for user-cancelled popups
      } else if (err.message && err.message.includes('verify your email')) {
        setNeedsVerification(true);
        setUserEmail(err.email || '');
      } else {
        setError(`Failed to sign in with ${provider}. ${err.message || 'Please try again.'}`);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  // Verification email resend handler
  const handleResendVerification = async () => {
    try {
      await sendEmailVerification();
      setError('');
      toast.success('Verification email sent. Please check your inbox.');
    } catch (err: any) {
      console.error('Error sending verification email:', err);
      setError('Failed to send verification email. Please try again.');
    }
  };

  // Verification screen
  if (needsVerification) {
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
              Please check your inbox at <span className="font-medium text-netflix-red">{userEmail}</span>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-gray-300">
              We've sent a verification link to your email address. Please click the link to verify your account and continue.
            </p>
            
            <div className="flex flex-col gap-2 pt-4">
              <Button 
                onClick={handleResendVerification}
                variant="outline" 
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                Resend verification email
              </Button>
              
              <Button 
                onClick={() => setNeedsVerification(false)}
                className="w-full mt-2 bg-netflix-red hover:bg-netflix-red/90"
              >
                Try another account
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black">
      {/* Navbar with Logo */}
      <nav className="w-full py-4 px-6 flex justify-center sm:justify-start">
        <Link to="/" className="inline-block">
          <img 
            src={logo} 
            alt="Logo" 
            className="h-8 w-auto"
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
          <CardTitle className="text-2xl font-bold text-white">Welcome back</CardTitle>
          <CardDescription className="text-gray-400">
            Sign in to your account to continue
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="your.email@example.com" 
                        className="text-white bg-gray-700 border-gray-600 focus:border-netflix-red focus:ring-netflix-red/20"
                        disabled={isSigningIn}
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
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-white">Password</FormLabel>
                      <a 
                        href="/forgot-password" 
                        className="text-xs text-netflix-red hover:text-netflix-red/90 hover:underline transition"
                      >
                        Forgot password?
                      </a>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="text-white bg-gray-700 border-gray-600 pr-10 focus:border-netflix-red focus:ring-netflix-red/20"
                          disabled={isSigningIn}
                          autoComplete="current-password"
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
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-netflix-red data-[state=checked]:border-netflix-red"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm text-gray-300">
                        Remember me
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-netflix-red hover:bg-netflix-red/90 transition-colors"
                disabled={isSigningIn}
              >
                {isSigningIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
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
                disabled={isSigningIn}
              />
            </form>
          </Form>
        </CardContent>
        
        <CardFooter className="flex justify-center border-t border-gray-700 pt-4">
          <p className="text-center text-sm text-gray-300">
            Don't have an account?{' '}
            <a href="/signup" className="text-netflix-red hover:text-netflix-red/90 font-semibold hover:underline transition">
              Create account
            </a>
          </p>
        </CardFooter>
      </Card>
      
      {/* Extra trust elements */}
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