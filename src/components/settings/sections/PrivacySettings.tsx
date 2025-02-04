import { useState } from 'react';
import { LogOut, Laptop, Shield, Users, History, Globe, Lock, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';

interface VisibilityPreference {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  icon: React.ComponentType<any>;
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
  icon: React.ComponentType<any>;
}

export function PrivacySettings() {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [roomPrivacy, setRoomPrivacy] = useState<RoomPrivacy>('friends');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  
  const roomPrivacyOptions: RoomPrivacyOption[] = [
    {
      value: 'public',
      label: 'Public',
      description: 'Anyone can join your rooms',
      icon: Globe
    },
    {
      value: 'friends',
      label: 'Friends Only',
      description: 'Only friends can join your rooms',
      icon: UserCheck
    },
    {
      value: 'private',
      label: 'Private',
      description: 'Invite only access to your rooms',
      icon: Lock
    }
  ];

  const [visibilityPreferences, setVisibilityPreferences] = useState<VisibilityPreference[]>([
    {
      id: 'online-status',
      label: 'Online Status',
      description: "Show when you're online to others",
      enabled: true,
      icon: Users
    },
    {
      id: 'room-activity',
      label: 'Room Activity',
      description: 'Show which rooms you join to friends',
      enabled: false,
      icon: Shield
    },
    {
      id: 'watch-history',
      label: 'Watch History',
      description: 'Allow friends to see your watch history',
      enabled: true,
      icon: History
    }
  ]);

  const [sessions, setSessions] = useState<Session[]>([
    {
      id: 'current',
      device: 'Current Browser',
      browser: 'Chrome 120.0',
      location: 'New York, US',
      time: 'Now',
      lastActivity: 'Active now',
      ip: '192.168.1.1',
      isCurrent: true
    },
    {
      id: 'device2',
      device: 'Mobile App',
      browser: 'Safari Mobile 17.0',
      location: 'Los Angeles, US',
      time: '2 hours ago',
      lastActivity: 'Last active: 2 hours ago',
      ip: '192.168.1.2',
      isCurrent: false
    }
  ]);

  const handleVisibilityToggle = (id: string) => {
    setVisibilityPreferences(prev =>
      prev.map(pref =>
        pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
      )
    );
    showTemporarySuccess('Visibility preferences updated');
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      showTemporarySuccess('Session revoked successfully');
    } catch (error) {
      console.error('Failed to revoke session:', error);
    }
  };

  const handleLogoutAllDevices = async () => {
    try {
      setSessions(prev => prev.filter(session => session.isCurrent));
      setShowLogoutDialog(false);
      showTemporarySuccess('Logged out of all other devices');
    } catch (error) {
      console.error('Failed to logout all devices:', error);
    }
  };

  const showTemporarySuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleRoomPrivacyChange = (value: RoomPrivacy) => {
    setRoomPrivacy(value);
    showTemporarySuccess('Room privacy settings updated');
  };

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
            <CardDescription>
              Control what others can see about your activity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {visibilityPreferences.map((pref, index) => (
              <motion.div 
                key={pref.id} 
                className="flex flex-col space-y-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.div 
                  className="flex items-center justify-between space-x-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  whileHover={{ scale: 1.01 }}
                >
                  <Label htmlFor={pref.id} className="flex items-center space-x-3 flex-1">
                    <pref.icon className="w-5 h-5 text-primary" />
                    <div className="space-y-1">
                      <span className="font-medium">{pref.label}</span>
                      <span className="text-sm text-muted-foreground block">
                        {pref.description}
                      </span>
                    </div>
                  </Label>
                  <Switch
                    id={pref.id}
                    checked={pref.enabled}
                    onCheckedChange={() => handleVisibilityToggle(pref.id)}
                  />
                </motion.div>
                <Separator />
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

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
            <CardDescription>
              Set your default privacy level for new rooms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={roomPrivacy} onValueChange={handleRoomPrivacyChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select room privacy" />
              </SelectTrigger>
              <SelectContent>
                {roomPrivacyOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-2">
                      <option.icon className="w-4 h-4" />
                      <div className="flex flex-col">
                        <span>{option.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </motion.div>

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
            <CardDescription>
              Manage your active sessions across different devices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessions.map((session, index) => (
              <motion.div
                key={session.id}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedSession(session)}
                whileHover={{ scale: 1.01 }}
              >
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
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRevokeSession(session.id);
                    }}
                  >
                    Revoke
                  </Button>
                )}
              </motion.div>
            ))}
            
            {sessions.length > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setShowLogoutDialog(true)}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out of All Other Devices
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Out of All Devices</DialogTitle>
            <DialogDescription>
              This action will terminate all sessions except your current one. You'll need to log in again on other devices.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogoutAllDevices}>
              <LogOut className="w-4 h-4 mr-2" />
              Log Out All
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
              <div className="space-y-2">
                <Label>Device</Label>
                <p className="text-sm">{selectedSession.device}</p>
              </div>
              <div className="space-y-2">
                <Label>Browser</Label>
                <p className="text-sm">{selectedSession.browser}</p>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <p className="text-sm">{selectedSession.location}</p>
              </div>
              <div className="space-y-2">
                <Label>IP Address</Label>
                <p className="text-sm">{selectedSession.ip}</p>
              </div>
              <div className="space-y-2">
                <Label>Last Activity</Label>
                <p className="text-sm">{selectedSession.lastActivity}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedSession(null)}>
              Close
            </Button>
            {selectedSession && !selectedSession.isCurrent && (
              <Button 
                variant="destructive"
                onClick={() => {
                  handleRevokeSession(selectedSession.id);
                  setSelectedSession(null);
                }}
              >
                Revoke Session
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

export default PrivacySettings;