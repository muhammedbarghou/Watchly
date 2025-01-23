import { Link, useLocation } from 'react-router-dom';
import { Home, Video, Settings, MessageCircle, Plus, LogIn } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useState } from 'react';

export function Sidebar({ isOpen }: { isOpen: boolean }) {
  const location = useLocation();
  const [isRoomsOpen, setIsRoomsOpen] = useState(false);

  const links = [
    { to: '/friends', icon: Home, label: 'Home' },
    { 
      label: 'Rooms', 
      icon: Video, 
      children: [
        { to: '/create', icon: Plus, label: 'Create Rooms' },
        { to: '/join', icon: LogIn, label: 'Join Rooms' },
      ] 
    },
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
          {links.map((link) => (
            <li key={link.to || link.label}>
              {link.to ? (
                <Link
                  to={link.to}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                    location.pathname === link.to
                      ? 'bg-netflix-red text-white'
                      : 'dark:text-gray-400 dark:hover:bg-netflix-gray dark:hover:text-white hover:bg-gray-200'
                  )}
                >
                  <link.icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              ) : (
                <div>
                  <button
                    onClick={() => setIsRoomsOpen(!isRoomsOpen)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors w-full',
                      'dark:text-gray-400 dark:hover:bg-netflix-gray dark:hover:text-white hover:bg-gray-200'
                    )}
                  >
                    <link.icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </button>
                  {isRoomsOpen && (
                    <ul className="pl-6 mt-2 space-y-2">
                      {link.children?.map((child) => (
                        <li key={child.to}>
                          <Link
                            to={child.to}
                            className={cn(
                              'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                              location.pathname === child.to
                                ? 'bg-netflix-red text-white'
                                : 'dark:text-gray-400 dark:hover:bg-netflix-gray dark:hover:text-white hover:bg-gray-200'
                            )}
                          >
                            <child.icon className="w-5 h-5" />
                            <span>{child.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}