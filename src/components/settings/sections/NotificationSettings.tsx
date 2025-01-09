import React from 'react';
import { Bell, Mail, Volume2 } from 'lucide-react';
import { Switch } from '../../ui/switch';

export function NotificationSettings() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Email Notifications</h3>
        <div className="space-y-4">
          {['Room invitations', 'Chat messages', 'Account activity'].map((item) => (
            <div key={item} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{item}</p>
                <p className="text-sm text-gray-400">Receive email updates for {item.toLowerCase()}</p>
              </div>
              <Switch />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Push Notifications</h3>
        <div className="space-y-4">
          {['Real-time updates', 'Room activity', 'Friend requests'].map((item) => (
            <div key={item} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{item}</p>
                <p className="text-sm text-gray-400">Get instant notifications for {item.toLowerCase()}</p>
              </div>
              <Switch />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Sound Alerts</h3>
        <div className="space-y-4">
          {['Message sounds', 'Room alerts'].map((item) => (
            <div key={item} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{item}</p>
                <p className="text-sm text-gray-400">Play sound for {item.toLowerCase()}</p>
              </div>
              <Switch />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}