import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Switch } from '@headlessui/react';
import { useTheme } from '../../hooks/useTheme.ts';

export const ThemeToggle = ({ onThemeChange }) => {
  const [theme, setTheme] = useTheme();

  const handleThemeChange = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (onThemeChange) {
      onThemeChange(newTheme);
    }
  };

  return (
    <div className="relative z-50 flex items-center ">
      <Sun size={20} className={`text-white ${theme === 'light' ? '' : 'opacity-50'}`} />
      <Switch
        checked={theme === 'dark'}
        onChange={handleThemeChange}
        className={`${
          theme === 'dark' ? 'bg-gray-700' : 'bg-white'
        } relative inline-flex h-6 w-11 items-center rounded-full mx-2`}
      >
        <span
          className={`${
            theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
          } inline-block h-4 w-4 transform rounded-full bg-gray-400 transition-transform`}
        />
      </Switch>
      <Moon size={20} className={`text-gray-400 ${theme === 'dark' ? '' : 'opacity-50'}`} />
    </div>
  );
};