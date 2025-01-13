import { Link, useLocation } from 'react-router-dom';
import { Home, Video, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Sidebar({ isOpen }: { isOpen: boolean }) {
  const location = useLocation();
  
  const links = [
    { to: '/friends', icon: Home, label: 'Home' },
    { to: '/rooms', icon: Video, label: 'Rooms' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-netflix-black border-r border-netflix-gray transition-transform duration-200 ease-in-out',
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
                    : 'text-gray-400 hover:bg-netflix-gray hover:text-white'
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