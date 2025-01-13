import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '../../ui/button';
import { Switch } from '../../ui/switch';

export function AppearanceSettings() {
  const [theme, setTheme] = React.useState('system');
  const [fontSize, setFontSize] = React.useState('medium');
  const [density, setDensity] = React.useState('default');

  const themes = [
    { id: 'light', name: 'Light', icon: Sun },
    { id: 'dark', name: 'Dark', icon: Moon },
    { id: 'system', name: 'System', icon: Monitor }
  ];

  const fontSizes = [
    { id: 'small', name: 'Small' },
    { id: 'medium', name: 'Medium' },
    { id: 'large', name: 'Large' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Theme</h3>
        <div className="grid grid-cols-3 gap-4">
          {themes.map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTheme(id)}
              className={`p-4 rounded-lg border-2 ${
                theme === id ? 'border-netflix-red' : 'border-netflix-gray'
              }`}
            >
              <Icon className="w-6 h-6 mb-2" />
              <span>{name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Font Size</h3>
        <div className="flex gap-4">
          {fontSizes.map(({ id, name }) => (
            <button
              key={id}
              onClick={() => setFontSize(id)}
              className={`px-4 py-2 rounded-lg ${
                fontSize === id ? 'bg-netflix-red' : 'bg-netflix-gray'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">UI Density</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Compact Mode</p>
              <p className="text-sm text-gray-400">Reduce spacing between elements</p>
            </div>
            <Switch 
              checked={density === 'compact'}
              onCheckedChange={(checked) => setDensity(checked ? 'compact' : 'default')}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <Button variant="secondary">Reset to Default</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}