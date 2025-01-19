import { useState } from 'react';
import { LogOut, Laptop} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface VisibilityPreference {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

interface Session {
  id: string;
  device: string;
  location: string;
  time: string;
  isCurrent: boolean;
}

export function PrivacySettings() {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [roomPrivacy, setRoomPrivacy] = useState('friends');
  
  const [visibilityPreferences, setVisibilityPreferences] = useState<VisibilityPreference[]>([
    {
      id: 'online-status',
      label: 'Online Status',
      description: "Show when you're online",
      enabled: true
    },
    {
      id: 'room-activity',
      label: 'Room Activity',
      description: 'Show which rooms you join',
      enabled: false
    },
    {
      id: 'watch-history',
      label: 'Watch History',
      description: 'Allow friends to see your watch history',
      enabled: true
    }
  ]);

  const [sessions, setSessions] = useState<Session[]>([
    {
      id: 'current',
      device: 'Current Browser',
      location: 'New York, US',
      time: 'Now',
      isCurrent: true
    },
    {
      id: 'device2',
      device: 'Mobile App',
      location: 'Los Angeles, US',
      time: '2 hours ago',
      isCurrent: false
    }
  ]);

  const handleVisibilityToggle = (id: string) => {
    setVisibilityPreferences(prev =>
      prev.map(pref =>
        pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
      )
    );
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      // API call would go here
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      showTemporarySuccess();
    } catch (error) {
      console.error('Failed to revoke session:', error);
    }
  };

  const handleLogoutAllDevices = async () => {
    try {
      // API call would go here
      setSessions(prev => prev.filter(session => session.isCurrent));
      setShowLogoutDialog(false);
      showTemporarySuccess();
    } catch (error) {
      console.error('Failed to logout all devices:', error);
    }
  };

  const showTemporarySuccess = () => {
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  return (
    <div className="space-y-6">
      {showSuccessMessage && (
        <Alert>
          <AlertDescription>
            Your privacy settings have been updated successfully.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Activity Visibility</CardTitle>
          <CardDescription>
            Control what others can see about your activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {visibilityPreferences.map((pref) => (
            <div key={pref.id} className="flex flex-col space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor={pref.id} className="flex flex-col space-y-1">
                  <span className="font-medium">{pref.label}</span>
                  <span className="text-sm text-muted-foreground">
                    {pref.description}
                  </span>
                </Label>
                <Switch
                  id={pref.id}
                  checked={pref.enabled}
                  onCheckedChange={() => handleVisibilityToggle(pref.id)}
                />
              </div>
              <Separator />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Room Privacy</CardTitle>
          <CardDescription>
            Set your default privacy level for new rooms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={roomPrivacy} onValueChange={setRoomPrivacy}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select room privacy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public - Anyone can join</SelectItem>
              <SelectItem value="friends">Friends Only - Only friends can join</SelectItem>
              <SelectItem value="private">Private - Invite only</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Manage your active sessions across different devices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 rounded-lg bg-secondary"
            >
              <div className="flex items-center gap-3">
                <Laptop className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">{session.device}</p>
                  <p className="text-sm text-muted-foreground">
                    {session.location} • {session.time}
                  </p>
                </div>
              </div>
              {!session.isCurrent && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleRevokeSession(session.id)}
                >
                  Revoke
                </Button>
              )}
            </div>
          ))}
          
          {sessions.length > 1 && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowLogoutDialog(true)}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out of All Devices
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Out of All Devices</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out of all devices? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogoutAllDevices}>
              Log Out All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PrivacySettings;