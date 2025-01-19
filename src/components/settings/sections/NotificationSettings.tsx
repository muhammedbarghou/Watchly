import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface NotificationPreference {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export function NotificationSettings() {
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState<NotificationPreference[]>([
    {
      id: 'room-invitations',
      title: 'Room invitations',
      description: 'Receive email updates for room invitations',
      enabled: true
    },
    {
      id: 'chat-messages',
      title: 'Chat messages',
      description: 'Receive email updates for chat messages',
      enabled: false
    },
    {
      id: 'account-activity',
      title: 'Account activity',
      description: 'Receive email updates for account activity',
      enabled: true
    }
  ]);

  const [pushNotifications, setPushNotifications] = useState<NotificationPreference[]>([
    {
      id: 'room-activity',
      title: 'Room activity',
      description: 'Get instant notifications for room activity',
      enabled: true
    },
    {
      id: 'friend-requests',
      title: 'Friend requests',
      description: 'Get instant notifications for friend requests',
      enabled: true
    }
  ]);

  const handleEmailToggle = (id: string) => {
    setEmailNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, enabled: !notification.enabled }
          : notification
      )
    );
  };

  const handlePushToggle = (id: string) => {
    setPushNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, enabled: !notification.enabled }
          : notification
      )
    );
  };

  const handleSaveChanges = async () => {
    try {
      // Here you would implement the actual API call to save preferences
      // This is a placeholder for demonstration
      console.log('Saving preferences:', {
        emailNotifications,
        pushNotifications
      });
      
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Configure how you receive email notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {emailNotifications.map((notification) => (
            <div key={notification.id} className="flex flex-col space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor={notification.id} className="flex flex-col space-y-1">
                  <span className="font-medium">{notification.title}</span>
                  <span className="text-sm text-muted-foreground">
                    {notification.description}
                  </span>
                </Label>
                <Switch
                  id={notification.id}
                  checked={notification.enabled}
                  onCheckedChange={() => handleEmailToggle(notification.id)}
                />
              </div>
              <Separator />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>
            Manage your push notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pushNotifications.map((notification) => (
            <div key={notification.id} className="flex flex-col space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor={notification.id} className="flex flex-col space-y-1">
                  <span className="font-medium">{notification.title}</span>
                  <span className="text-sm text-muted-foreground">
                    {notification.description}
                  </span>
                </Label>
                <Switch
                  id={notification.id}
                  checked={notification.enabled}
                  onCheckedChange={() => handlePushToggle(notification.id)}
                />
              </div>
              <Separator />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-col space-y-4">
        {showSaveSuccess && (
          <Alert>
            <AlertDescription>
              Your notification preferences have been saved successfully.
            </AlertDescription>
          </Alert>
        )}
        <Button onClick={handleSaveChanges} className="w-full sm:w-auto">
          Save Changes
        </Button>
      </div>
    </div>
  );
}

export default NotificationSettings;