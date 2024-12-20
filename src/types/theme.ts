export type Theme = 'light' | 'dark';

export interface ThemeToggleProps {
  onThemeChange?: (theme: Theme) => void;
}