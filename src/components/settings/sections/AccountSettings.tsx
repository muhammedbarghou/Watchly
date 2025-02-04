import { useEffect, useState } from 'react';
import { User as FirebaseUser, updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

export function AccountSettings() {
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
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        user.email!,
        data.currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update profile information
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
      <div className="space-y-6 animate-fade-in">
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
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your account settings and change your password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-20 h-20 border-2 border-gray-800">
                <AvatarImage src={user?.photoURL ?? ''} alt={user?.displayName ?? 'User'} />
                <AvatarFallback className="bg-gray-800 text-xl">
                  {user?.displayName?.[0].toUpperCase() ?? 'U'}
                </AvatarFallback>
              </Avatar>
              {user?.emailVerified && (
                <CheckCircle2 className="absolute bottom-0 right-0 w-6 h-6 text-green-500 bg-background rounded-full" />
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xl font-medium">{user?.displayName || 'User'}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                {user?.email}
                {user?.emailVerified ? (
                  <span className="text-xs text-green-500">(Verified)</span>
                ) : (
                  <span className="text-xs text-yellow-500">(Not verified)</span>
                )}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                {...form.register('fullName')}
                className="bg-background"
              />
              {form.formState.errors.fullName && (
                <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                className="bg-background"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Change your password or leave blank to keep your current password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              {...form.register('currentPassword')}
              className="bg-background"
            />
            {form.formState.errors.currentPassword && (
              <p className="text-sm text-destructive">{form.formState.errors.currentPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              {...form.register('newPassword')}
              className="bg-background"
            />
            {form.formState.errors.newPassword && (
              <p className="text-sm text-destructive">{form.formState.errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...form.register('confirmPassword')}
              className="bg-background"
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            disabled={updating}
            className="w-full sm:w-auto"
          >
            {updating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}