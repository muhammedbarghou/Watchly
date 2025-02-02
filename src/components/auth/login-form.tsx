import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/use-auth'
import { SocialAuthButtons } from './SocialAuthButtons'
import { setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

interface LoginFormData {
  email: string
  password: string
}

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const navigate = useNavigate()
  const { signInWithEmail, signInWithGoogle, signInWithFacebook, loading, error } = useAuth()
  const [authError, setAuthError] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { 
    register, 
    handleSubmit, 
    formState: { errors, dirtyFields } 
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange'
  })

  const handleSocialSignIn = async (provider: 'google' | 'facebook') => {
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence)
      
      setAuthError(null)
      const signInMethod = provider === 'google' ? signInWithGoogle : signInWithFacebook;
      await signInMethod();
      navigate('/hub')
    } catch (err: any) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : `Failed to sign in with ${provider}`
      setAuthError(errorMessage)
    }
  }

  const onSubmit = async (data: LoginFormData) => {
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence)
      
      setAuthError(null)
      await signInWithEmail(data.email, data.password)
      navigate('/friends')
    } catch (err: any) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An unexpected error occurred during login'
      setAuthError(errorMessage)
    }
  }

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)} 
      className={cn("flex flex-col gap-6", className)} 
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold text-white">Login to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your email below to login to your account
        </p>
      </div>
      
      {(authError || error) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{authError || error}</AlertDescription>
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
            disabled={loading}
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
          <div className="flex items-center">
            <Label htmlFor="password" className="text-white">Password</Label>
            <a
              href="/reset-password"
              className="ml-auto text-sm underline-offset-4 hover:underline text-netflix-red"
            >
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"}
              placeholder="********" 
              {...register('password')}
              disabled={loading}
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
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="rememberMe"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(!!checked)}
            disabled={loading}
          />
          <Label 
            htmlFor="rememberMe" 
            className="text-white text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Keep me signed in
          </Label>
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-netflix-red hover:bg-netflix-red/90" 
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
        
        <SocialAuthButtons
          onGoogleClick={() => handleSocialSignIn('google')}
          onFacebookClick={() => handleSocialSignIn('facebook')}
          disabled={loading}
        />
      </div>
      
      <div className="text-center text-sm text-white">
        Don&apos;t have an account?{" "}
        <a href="/signup" className="underline underline-offset-4 text-netflix-red hover:text-netflix-red/80">
          Sign up
        </a>
      </div>
    </form>
  )
}