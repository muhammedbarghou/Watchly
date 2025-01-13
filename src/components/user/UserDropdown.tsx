import  { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Settings, User } from 'lucide-react';
import { DropdownMenu } from '../ui/dropdown-menu';
import { FriendsDialog } from './FriendsDialog';
import { auth } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import { User as FirebaseUser } from 'firebase/auth';

export function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProfileClick = () => {
    setIsOpen(false); // Close dropdown
    setIsProfileOpen(true); // Open profile dialog
  };

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-lg bg-netflix-gray flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getInitials = (name: string | null): string => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-8 h-8 rounded-lg bg-netflix-gray flex items-center justify-center hover:bg-netflix-hover transition-colors overflow-hidden"
        >
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User profile'}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-medium text-white">
              {getInitials(user.displayName)}
            </span>
          )}
        </button>

        <DropdownMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <div className="px-4 py-3 border-b border-netflix-gray">
            <p className="font-medium text-white">{user.displayName || 'User'}</p>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>

          <div className="py-1">
            <button
              onClick={handleProfileClick}
              className="w-full px-4 py-2 text-sm flex items-center gap-3 text-gray-400 hover:bg-netflix-gray hover:text-white"
            >
              <User className="w-4 h-4" />
              Profile
            </button>
            <Link
              to="/settings"
              className="px-4 py-2 text-sm flex items-center gap-3 text-gray-400 hover:bg-netflix-gray hover:text-white"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2 text-sm flex items-center gap-3 text-netflix-red hover:bg-netflix-gray"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </DropdownMenu>
      </div>

      <FriendsDialog
        isOpen={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        user={user}
      />
    </>
  );
}