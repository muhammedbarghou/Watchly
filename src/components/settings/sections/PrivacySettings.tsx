import { useState, useEffect } from 'react';
import { Laptop, Shield, Users, History, Globe, Lock, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';

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
  browser?: string;
  lastActivity?: string;
  ip?: string;
}

type RoomPrivacy = 'public' | 'friends' | 'private';

interface RoomPrivacyOption {
  value: RoomPrivacy;
  label: string;
  description: string;
}

export function PrivacySettings() {
  const { currentUser } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [roomPrivacy, setRoomPrivacy] = useState<RoomPrivacy>('friends');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [visibilityPreferences, setVisibilityPreferences] = useState<VisibilityPreference[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const roomPrivacyOptions: RoomPrivacyOption[] = [
    {
      value: 'public',
      label: 'Public',
      description: 'Anyone can join your rooms'
    },
    {
      value: 'friends',
      label: 'Friends Only',
      description: 'Only friends can join your rooms'
    },
    {
      value: 'private',
      label: 'Private',
      description: 'Invite only access to your rooms'
    }
  ];

  useEffect(() => {
    const fetchPrivacySettings = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);

        const defaultSettings = {
          visibilityPreferences: [
            {
              id: 'online-status',
              label: 'Online Status',
              description: "Show when you're online to others",
              enabled: true
            },
            {
              id: 'room-activity',
              label: 'Room Activity',
              description: 'Show which rooms you join to friends',
              enabled: false
            },
            {
              id: 'watch-history',
              label: 'Watch History',
              description: 'Allow friends to see your watch history',
              enabled: true
            }
          ],
          roomPrivacy: 'friends' as RoomPrivacy,
          sessions: [
            {
              id: 'current',
              device: 'Current Browser',
              browser: 'Chrome 120.0',
              location: 'New York, US',
              time: 'Now',
              lastActivity: 'Active now',
              ip: '192.168.1.1',
              isCurrent: true
            }
          ]
        };

        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.privacySettings) {
            setVisibilityPreferences(userData.privacySettings.visibilityPreferences);
            setRoomPrivacy(userData.privacySettings.roomPrivacy);
            setSessions(userData.privacySettings.sessions);
          } else {
            await setDoc(userRef, { privacySettings: defaultSettings }, { merge: true });
            setVisibilityPreferences(defaultSettings.visibilityPreferences);
            setRoomPrivacy(defaultSettings.roomPrivacy);
            setSessions(defaultSettings.sessions);
          }
        } else {
          await setDoc(userRef, { privacySettings: defaultSettings });
          setVisibilityPreferences(defaultSettings.visibilityPreferences);
          setRoomPrivacy(defaultSettings.roomPrivacy);
          setSessions(defaultSettings.sessions);
        }
      } catch (error) {
        console.error('Error fetching privacy settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrivacySettings();
  }, [currentUser]);

  const handleVisibilityToggle = (id: string) => {
    setVisibilityPreferences(prev =>
      prev.map(pref => pref.id === id ? { ...pref, enabled: !pref.enabled } : pref)
    );
    setHasUnsavedChanges(true);
  };

  const handleRevokeSession = (sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
    setHasUnsavedChanges(true);
    showTemporarySuccess('Session revoked successfully');
  };

  const handleLogoutAllDevices = () => {
    setSessions(prev => prev.filter(session => session.isCurrent));
    setShowLogoutDialog(false);
    setHasUnsavedChanges(true);
    showTemporarySuccess('Logged out of all other devices');
  };

  const handleRoomPrivacyChange = (value: RoomPrivacy) => {
    setRoomPrivacy(value);
    setHasUnsavedChanges(true);
  };

  const savePrivacySettings = async () => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, 
        { privacySettings: { visibilityPreferences, roomPrivacy, sessions } },
        { merge: true }
      );
      setHasUnsavedChanges(false);
      showTemporarySuccess('Privacy settings saved successfully');
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
    }
  };

  const showTemporarySuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  if (isLoading) {
    return (
      <motion.div 
        className="space-y-6 max-w-4xl mx-auto p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Activity Visibility Loading State */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Skeleton className="w-5 h-5 rounded" />
              <Skeleton className="h-6 w-40" />
            </div>
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <div className="flex items-center justify-between p-2">
                  <div className="flex items-center space-x-3 flex-1">
                    <Skeleton className="w-5 h-5 rounded" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <Skeleton className="w-10 h-5 rounded-full" />
                </div>
                <Separator />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Room Privacy Loading State */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Skeleton className="w-5 h-5 rounded" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-4 w-56 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full rounded" />
          </CardContent>
        </Card>

        {/* Active Sessions Loading State */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Skeleton className="w-5 h-5 rounded" />
              <Skeleton className="h-6 w-36" />
            </div>
            <Skeleton className="h-4 w-60 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2].map((i) => (
              <div 
                key={i}
                className="p-4 rounded-lg bg-secondary"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-5 h-5 rounded" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="w-16 h-8 rounded" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Save Button Loading State */}
        <div className="flex justify-end">
          <Skeleton className="h-10 w-32" />
        </div>
      </motion.div>
    );
  }

  if (!currentUser) {
    return (
      <Alert className="max-w-4xl mx-auto m-4">
        <AlertDescription>Please sign in to access privacy settings.</AlertDescription>
      </Alert>
    );
  }

  return (
    <motion.div 
      className="space-y-6 max-w-4xl mx-auto p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                {successMessage}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity Visibility Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle>Activity Visibility</CardTitle>
            </div>
            <CardDescription>Control what others can see about your activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {visibilityPreferences.map((pref, index) => (
              <motion.div 
                key={pref.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                  <div className="flex items-center space-x-3 flex-1">
                    {pref.id === 'online-status' && <Users className="w-5 h-5 text-primary" />}
                    {pref.id === 'room-activity' && <Shield className="w-5 h-5 text-primary" />}
                    {pref.id === 'watch-history' && <History className="w-5 h-5 text-primary" />}
                    <div className="space-y-1">
                      <Label className="font-medium">{pref.label}</Label>
                      <p className="text-sm text-muted-foreground">{pref.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={pref.enabled}
                    onCheckedChange={() => handleVisibilityToggle(pref.id)}
                  />
                </div>
                {index < visibilityPreferences.length - 1 && <Separator />}
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Room Privacy Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-primary" />
              <CardTitle>Room Privacy</CardTitle>
            </div>
            <CardDescription>Set your default privacy level for new rooms</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={roomPrivacy} onValueChange={handleRoomPrivacyChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select privacy level" />
              </SelectTrigger>
              <SelectContent>
                {roomPrivacyOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {option.value === 'public' && <Globe className="w-4 h-4" />}
                      {option.value === 'friends' && <UserCheck className="w-4 h-4" />}
                      {option.value === 'private' && <Lock className="w-4 h-4" />}
                      <div>
                        <span>{option.label}</span>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </motion.div>

      {/* Active Sessions Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Laptop className="w-5 h-5 text-primary" />
              <CardTitle>Active Sessions</CardTitle>
            </div>
            <CardDescription>Manage your active sessions across devices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg bg-secondary hover:bg-secondary/80 cursor-pointer"
                onClick={() => setSelectedSession(session)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Laptop className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">
                        {session.device}
                        {session.isCurrent && (
                          <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            Current
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {session.location} • {session.lastActivity}
                      </p>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRevokeSession(session.id);
                      }}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Changes Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="flex justify-end"
      >
        <Button 
          onClick={savePrivacySettings}
          disabled={!hasUnsavedChanges}
          className="w-full sm:w-auto"
        >
          Save Changes
        </Button>
      </motion.div>

      {/* Dialogs */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Out All Devices?</DialogTitle>
            <DialogDescription>
              This will log you out of all devices except your current session.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogoutAllDevices}>
              Confirm Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>Device:</Label>
                <p className="text-sm">{selectedSession.device}</p>
              </div>
              <div className="space-y-1">
                <Label>Location:</Label>
                <p className="text-sm">{selectedSession.location}</p>
              </div>
              <div className="space-y-1">
                <Label>Last Activity:</Label>
                <p className="text-sm">{selectedSession.lastActivity}</p>
              </div>
              <div className="space-y-1">
                <Label>IP Address:</Label>
                <p className="text-sm">{selectedSession.ip}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

export default PrivacySettings;