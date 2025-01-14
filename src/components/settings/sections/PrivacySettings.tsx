import { LogOut, Laptop } from 'lucide-react';
import { Button } from '../../ui/button';
import { Switch } from '../../ui/switch';

export function PrivacySettings() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Activity Visibility</h3>
        <div className="space-y-4">
          {[
            { label: 'Online Status', desc: 'Show when you\'re online' },
            { label: 'Room Activity', desc: 'Show which rooms you join' },
            { label: 'Watch History', desc: 'Allow friends to see your watch history' }
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
              <Switch />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Room Privacy</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Default Room Privacy</label>
            <select className="w-full p-2 rounded-lg bg-netflix-gray border border-netflix-gray">
              <option value="public">Public - Anyone can join</option>
              <option value="friends">Friends Only - Only friends can join</option>
              <option value="private">Private - Invite only</option>
            </select>
          </div>
        </div>
      </div>


      <div>
        <h3 className="text-lg font-semibold mb-4">Active Sessions</h3>
        <div className="space-y-4">
          {[
            { device: 'Current Browser', location: 'New York, US', time: 'Now' },
          ].map((session, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-netflix-gray/50">
              <div className="flex items-center gap-3">
                <Laptop className="w-5 h-5 text-netflix-red" />
                <div>
                  <p className="font-medium">{session.device}</p>
                  <p className="text-sm text-gray-400">{session.location} • {session.time}</p>
                </div>
              </div>
              {index !== 0 && (
                <Button variant="secondary" size="sm">
                  Revoke
                </Button>
              )}
            </div>
          ))}
          
          <Button variant="destructive" className="w-full mt-4">
            <LogOut className="w-4 h-4 mr-2" />
            Log Out of All Devices
          </Button>
        </div>
      </div>
    </div>
  );
}