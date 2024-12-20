import { LucideIcon } from 'lucide-react';

export interface NavigationItem {
  name: string;
  icon: LucideIcon;
  onClick: () => void;
}

export interface SidebarProps {
  isOpen: boolean;
  currentTheme: string;
  navigation: NavigationItem[];
  footerNavigation: NavigationItem[];
  onThemeChange: (theme: string) => void;
  onProfileClick: () => void;
}

export interface HeaderProps {
  isOpen: boolean;
  activeComponent: string;
  onToggleSidebar: () => void;
}

export interface MainContentProps {
  activeComponent: string;
}