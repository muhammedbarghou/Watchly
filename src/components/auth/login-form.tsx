import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/contexts/AuthContext';
import { SocialAuthButtons } from './SocialAuthButtons';


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
  const { signInWithEmail, signInWithGoogle, signInWithFacebook } = useAuth()
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      await signInWithEmail(data.email, data.password)
      navigate('/friends')
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
      navigate('/friends')
    } catch (error) {
      console.error('Google sign in error:', error)
    }
  }

  const handleFacebookSignIn = async () => {
    try {
      await signInWithFacebook()
      navigate('/friends')
    } catch (error) {
      console.error('Facebook sign in error:', error)
    }
  }


  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold text-white">Login to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-white">Email</Label>
          <Input id="email" type="email" placeholder="example@example.com" {...register('email')} />
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
          <Input id="password" type="password" placeholder="Password" {...register('password')} />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
        
        <SocialAuthButtons
          onGoogleClick={handleGoogleSignIn}
          onFacebookClick={handleFacebookSignIn}

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
