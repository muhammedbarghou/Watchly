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

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
})

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
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      // Set persistence based on Remember Me checkbox
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence)
      
      setAuthError(null)
      await signInWithEmail(data.email, data.password)
      navigate('/friends')
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred during login'
      setAuthError(errorMessage)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      // Set persistence based on Remember Me checkbox
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence)
      
      setAuthError(null)
      await signInWithGoogle()
      navigate('/friends')
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to sign in with Google'
      setAuthError(errorMessage)
    }
  }

  const handleFacebookSignIn = async () => {
    try {
      // Set persistence based on Remember Me checkbox
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence)
      
      setAuthError(null)
      await signInWithFacebook()
      navigate('/friends')
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to sign in with Facebook'
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
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-md">
          {authError || error}
        </div>
      )}

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-white">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="example@example.com" 
            {...register('email')}
            disabled={loading}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>
        
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password" className="text-white">Password</Label>
            <a
              href="/reset-password"
              className="ml-auto text-sm underline-offset-4 hover:underline text-netflix-red"
            >
              Forgot your password?
            </a>
          </div>
          <Input 
            id="password" 
            type="password" 
            placeholder="Password" 
            {...register('password')}
            disabled={loading}
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="rememberMe"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(!!checked)}
            disabled={loading}
          />
          <Label htmlFor="rememberMe" className="text-white">Remember me</Label>
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>
        
        <SocialAuthButtons
          onGoogleClick={handleGoogleSignIn}
          onFacebookClick={handleFacebookSignIn}
          disabled={loading}
        />
      </div>
      
      <div className="text-center text-sm text-white">
        Don&apos;t have an account?{" "}
        <a href="/signup" className="underline underline-offset-4 text-netflix-red">
          Sign up
        </a>
      </div>
    </form>
  )
}