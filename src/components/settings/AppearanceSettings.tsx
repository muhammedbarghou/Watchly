import React from 'react';
import { Button } from '../ui/button';

const themes = [
  { id: 'default', name: 'Default', description: 'Default company branding' },
  { id: 'simplified', name: 'Simplified', description: 'Minimal and modern' },
  { id: 'custom', name: 'Custom CSS', description: 'Manage styling with CSS' }
];

export function AppearanceSettings() {
  const [selectedTheme, setSelectedTheme] = React.useState('default');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Theme</h2>
        <p className="text-sm text-gray-400 mb-4">Choose how your dashboard looks and feels</p>
        
        <div className="grid grid-cols-3 gap-4">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className={`p-4 rounded-lg border-2 cursor-pointer ${
                selectedTheme === theme.id 
                  ? 'border-netflix-red' 
                  : 'border-netflix-gray'
              }`}
              onClick={() => setSelectedTheme(theme.id)}
            >
              <div className="h-32 bg-netflix-gray rounded mb-3" />
              <h3 className="font-medium mb-1">{theme.name}</h3>
              <p className="text-sm text-gray-400">{theme.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-1">Brand Color</h2>
        <p className="text-sm text-gray-400 mb-4">Select or customize your brand color</p>
        
        <div className="flex items-center gap-3">
          <input
            type="color"
            defaultValue="#E50914"
            className="h-10 w-20 bg-transparent rounded cursor-pointer"
          />
          <input
            type="text"
            defaultValue="#E50914"
            className="w-32 px-3 py-2 rounded bg-netflix-black border border-netflix-gray text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <Button variant="secondary">Cancel</Button>
        <Button>Save changes</Button>
      </div>
    </div>
  );
}