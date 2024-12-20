import { useState, useEffect } from 'react';
import type { Theme } from '../types/theme';

export const useTheme = (initialTheme: Theme = 'light') => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || initialTheme;
    }
    return initialTheme;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
      
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  return [theme, setTheme] as const;
};