import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, Mail, Loader } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { db } from '@/lib/firebase'; 
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth'

interface NotificationPreference {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  category: 'email' | 'push';
}

export function NotificationSettings() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [notifications, setNotifications] = useState<NotificationPreference[]>([]);

  useEffect(() => {
    const fetchNotificationSettings = async () => {
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            if (userData.notificationSettings) {
              setNotifications(userData.notificationSettings);
            } else {
              const defaultSettings = [
                {
                  id: 'room-invitations',
                  title: 'Room invitations',
                  description: 'Receive email updates when you\'re invited to join a room',
                  enabled: true,
                  category: 'email' as 'email'
                },
                {
                  id: 'chat-messages',
                  title: 'Chat messages',
                  description: 'Get notified about new messages in your conversations',
                  enabled: false,
                  category: 'email' as 'email'
                },
                {
                  id: 'account-activity',
                  title: 'Account activity',
                  description: 'Stay informed about important account-related updates and security alerts',
                  enabled: true,
                  category: 'email' as 'email'
                },
                {
                  id: 'room-activity',
                  title: 'Room activity',
                  description: 'Get instant notifications when there\'s activity in your rooms',
                  enabled: true,
                  category: 'push' as 'push'
                },
                {
                  id: 'friend-requests',
                  title: 'Friend requests',
                  description: 'Be notified when someone sends you a friend request',
                  enabled: true,
                  category: 'push' as 'push'
                }
              ];
              setNotifications(defaultSettings);
              await setDoc(userRef, { notificationSettings: defaultSettings }, { merge: true });
            }
          }
        } catch (error) {
          console.error('Failed to fetch notification settings:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchNotificationSettings();
  }, [currentUser]);

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

  const handleToggle = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, enabled: !notification.enabled }
          : notification
      )
    );
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, { notificationSettings: notifications }, { merge: true });
        setShowSaveSuccess(true);
        setHasUnsavedChanges(false);
        setTimeout(() => setShowSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const emailNotifications = notifications.filter(n => n.category === 'email');
  const pushNotifications = notifications.filter(n => n.category === 'push');

  const NotificationSection = ({ 
    title, 
    description, 
    icon: Icon, 
    notifications 
  }: { 
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    notifications: NotificationPreference[];
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center space-x-4">
          <motion.div 
            className="p-2 bg-primary/10 rounded-full"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon className="w-6 h-6 text-primary" />
          </motion.div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {notifications.map((notification, index) => (
            <motion.div 
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group flex flex-col space-y-4"
            >
              <motion.div 
                className="flex items-center justify-between space-x-2 p-2 rounded-lg"
                whileHover={{ backgroundColor: 'rgb(var(--muted) / 0.5)' }}
                transition={{ duration: 0.2 }}
              >
                <Label 
                  htmlFor={notification.id} 
                  className="flex flex-col space-y-1 flex-1 cursor-pointer"
                >
                  <motion.span 
                    className="font-medium"
                    whileHover={{ color: 'rgb(var(--primary))' }}
                  >
                    {notification.title}
                  </motion.span>
                  <span className="text-sm text-muted-foreground">
                    {notification.description}
                  </span>
                </Label>
                <Switch
                  id={notification.id}
                  checked={notification.enabled}
                  onCheckedChange={() => handleToggle(notification.id)}
                  aria-label={`Toggle ${notification.title.toLowerCase()}`}
                />
              </motion.div>
              <Separator />
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <motion.div 
      className="space-y-6 max-w-4xl mx-auto p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Notification Settings</h1>
        <p className="text-muted-foreground">
          Customize how and when you want to be notified about activity on the platform.
        </p>
      </motion.div>

      <NotificationSection
        title="Email Notifications"
        description="Configure how you receive email notifications"
        icon={Mail}
        notifications={emailNotifications}
      />

      <NotificationSection
        title="Push Notifications"
        description="Manage your push notification preferences"
        icon={Bell}
        notifications={pushNotifications}
      />

      <div className="flex flex-col space-y-4">
        <AnimatePresence>
          {showSaveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  Your notification preferences have been saved successfully.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div 
          className="flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={handleSaveChanges}
            disabled={!hasUnsavedChanges || isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? (
              <motion.div 
                className="flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Saving changes...
              </motion.div>
            ) : (
              'Save Changes'
            )}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default NotificationSettings;