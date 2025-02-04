import { useEffect, useState } from 'react';
import { User as FirebaseUser, updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, CheckCircle2, Shield, Mail, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .optional()
    .or(z.literal('')),
  confirmPassword: z.string()
}).refine(data => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof formSchema>;

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export function AccountSettings(): JSX.Element {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        form.reset({
          fullName: user.displayName || '',
          email: user.email || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [form]);

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    setUpdating(true);

    try {
      const credential = EmailAuthProvider.credential(
        user.email!,
        data.currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      const updates = [];

      if (data.fullName !== user.displayName) {
        updates.push(updateProfile(user, {
          displayName: data.fullName
        }));
      }

      if (data.email !== user.email) {
        updates.push(updateEmail(user, data.email));
      }

      if (data.newPassword) {
        updates.push(updatePassword(user, data.newPassword));
      }

      await Promise.all(updates);

      toast({
        title: "Settings updated",
        description: "Your account settings have been updated successfully.",
        duration: 3000,
      });

      form.reset({
        ...data,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      let message = 'Failed to update profile';
      
      switch (error.code) {
        case 'auth/wrong-password':
          message = 'Current password is incorrect';
          break;
        case 'auth/requires-recent-login':
          message = 'Please log in again to update these settings';
          break;
        case 'auth/email-already-in-use':
          message = 'Email is already in use by another account';
          break;
      }

      toast({
        variant: "destructive",
        title: "Error",
        description: message,
        duration: 5000,
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-40" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="w-20 h-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <motion.div
        initial="initial"
        animate="animate"
        variants={{
          initial: { opacity: 0 },
          animate: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
      >
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader className="space-y-2">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-primary" />
                <CardTitle>Profile Information</CardTitle>
              </div>
              <CardDescription>
                Update your account settings and manage your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <motion.div 
                className="flex items-center gap-4"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="relative">
                  <Avatar className="w-20 h-20 border-2 border-primary">
                    <AvatarImage src={user?.photoURL ?? ''} alt={user?.displayName ?? 'User'} />
                    <AvatarFallback className="bg-primary text-xl">
                      {user?.displayName?.[0].toUpperCase() ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <AnimatePresence>
                    {user?.emailVerified && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute bottom-0 right-0"
                      >
                        <CheckCircle2 className="w-6 h-6 text-green-500 bg-background rounded-full" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-medium">{user?.displayName || 'User'}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{user?.email}</span>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        user?.emailVerified 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {user?.emailVerified ? 'Verified' : 'Not verified'}
                    </motion.span>
                  </div>
                </div>
              </motion.div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    {...form.register('fullName')}
                    className="bg-background transition-all focus:ring-2 focus:ring-primary"
                  />
                  <AnimatePresence>
                    {form.formState.errors.fullName && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-destructive"
                      >
                        {form.formState.errors.fullName.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register('email')}
                    className="bg-background transition-all focus:ring-2 focus:ring-primary"
                  />
                  <AnimatePresence>
                    {form.formState.errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-destructive"
                      >
                        {form.formState.errors.email.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp} className="mt-6">
          <Card>
            <CardHeader className="space-y-2">
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-primary" />
                <CardTitle>Password</CardTitle>
              </div>
              <CardDescription>
                Change your password or leave blank to keep your current password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {['currentPassword', 'newPassword', 'confirmPassword'].map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field}>
                    {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                  </Label>
                  <Input
                    id={field}
                    type="password"
                    {...form.register(field as keyof FormData)}
                    className="bg-background transition-all focus:ring-2 focus:ring-primary"
                  />
                  <AnimatePresence>
                    {form.formState.errors[field as keyof FormData] && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-destructive"
                      >
                        {form.formState.errors[field as keyof FormData]?.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {form.watch('newPassword') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Alert className="bg-primary/10 border-primary/20">
                    <AlertDescription>
                      Password must contain at least:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>8 characters</li>
                        <li>One uppercase letter</li>
                        <li>One lowercase letter</li>
                        <li>One number</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                disabled={updating}
                className="w-full sm:w-auto relative overflow-hidden group"
              >
                <motion.div
                  animate={{
                    x: updating ? 20 : 0,
                    opacity: updating ? 0 : 1
                  }}
                >
                  Save Changes
                </motion.div>
                <AnimatePresence>
                  {updating && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2">Updating...</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </form>
  );
}

export default AccountSettings;