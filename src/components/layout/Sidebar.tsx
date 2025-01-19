import { Link, useLocation } from 'react-router-dom';
import { Home, Video, Settings,MessageCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Sidebar({ isOpen }: { isOpen: boolean }) {
  const location = useLocation();
  
  const links = [
    { to: '/friends', icon: Home, label: 'Home' },
    { to: '/rooms', icon: Video, label: 'Rooms' },
    { to: '/settings', icon: Settings, label: 'Settings' },
    { to: '/chat', icon: MessageCircle, label: 'Chat' },

  ];

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 dark:bg-netflix-black bg-gray-100 transition-transform duration-200 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <nav className="p-4">
        <ul className="space-y-2">
          {links.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <Link
                to={to}
                className={cn(
                  'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                  location.pathname === to
                    ? 'bg-netflix-red text-white'
                    : 'dark:text-gray-400 dark:hover:bg-netflix-gray dark:hover:text-white hover:bg-gray-200'
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}