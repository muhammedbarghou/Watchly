import React from 'react';
import { User, Lock, Shield, Trash2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { Switch } from '../../ui/switch';

export function AccountSettings() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-netflix-gray flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <Button>Change Avatar</Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                className="w-full p-2 rounded-lg bg-netflix-gray border border-netflix-gray"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="w-full p-2 rounded-lg bg-netflix-gray border border-netflix-gray"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea
                className="w-full p-2 rounded-lg bg-netflix-gray border border-netflix-gray"
                rows={3}
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Security</h3>
        <div className="space-y-4">
          <Button variant="secondary" className="w-full justify-start">
            <Lock className="w-4 h-4 mr-2" />
            Change Password
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-gray-400">Add an extra layer of security</p>
            </div>
            <Switch />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-red-500">Danger Zone</h3>
        <Button variant="destructive" className="w-full justify-start">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Account
        </Button>
      </div>
    </div>
  );
}