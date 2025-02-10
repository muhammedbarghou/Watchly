import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, Video, Settings, MessageCircle, Plus, 
  LogIn, Users, ChevronDown, HelpCircle, LogOut, 
  UserPlus, List 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import { toast } from '@/hooks/use-toast';

interface NavigationLink {
  to?: string;
  icon: React.ElementType;
  label: string;
  children?: NavigationLink[];
}

type ExtendedFirebaseUser = FirebaseUser & {
  customUID?: string;
  displayName?: string;
  photoURL?: string;
  friends?: string[];
};

const navigationLinks: NavigationLink[] = [
  { to: '/hub', icon: Home, label: 'Home' },
  {
    label: 'Rooms',
    icon: Video,
    children: [
      { to: '/create', icon: Plus, label: 'Create Room' },
      { to: '/join', icon: LogIn, label: 'Join Room' },
    ],
  },
  {
    label: 'Friends',
    icon: Users,
    children: [
      { to: '/friends', icon: UserPlus, label: 'Friends Activities' },
      { to: '/friends-list', icon: List, label: 'Friend List' },
    ],
  },
  { to: '/chat', icon: MessageCircle, label: 'Chat' },
];

const NavLink: React.FC<{ link: NavigationLink; isOpen: boolean; openDropdown: string | null; toggleDropdown: (label: string) => void }> = ({
  link,
  isOpen,
  openDropdown,
  toggleDropdown,
}) => {
  const location = useLocation();

  if (link.to) {
    return (
      <Button
        asChild
        variant={location.pathname === link.to ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start group",
          location.pathname === link.to && "bg-netflix-red hover:bg-netflix-red"
        )}
      >
        <Link to={link.to} className="flex items-center gap-3">
          <link.icon className="h-4 w-4 transition-colors group-hover:text-primary" />
          <span>{link.label}</span>
        </Link>
      </Button>
    );
  }

  return (
    <div className="space-y-1">
      <Button
        variant="ghost"
        onClick={() => toggleDropdown(link.label)}
        className="w-full justify-between group"
        aria-expanded={openDropdown === link.label}
      >
        <div className="flex items-center gap-3">
          <link.icon className="h-4 w-4 transition-colors group-hover:text-primary" />
          <span>{link.label}</span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            openDropdown === link.label && "rotate-180"
          )}
        />
      </Button>
      {openDropdown === link.label && link.children && (
        <div className="pl-4 pt-1 space-y-1">
          {link.children.map((child) => (
            <NavLink
              key={child.to}
              link={child}
              isOpen={isOpen}
              openDropdown={openDropdown}
              toggleDropdown={toggleDropdown}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export function Sidebar({ isOpen }: { isOpen: boolean }) {
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [user, setUser] = useState<ExtendedFirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (!authUser) {
        setUser(null);
        setLoading(false);
        navigate('/login');
        return;
      }

      try {
        const userDocRef = doc(db, 'users', authUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            ...authUser,
            customUID: userData.customUID || 'Unknown',
            displayName: userData.displayName || authUser.displayName || 'User',
            photoURL: userData.photoURL || authUser.photoURL,
            friends: userData.friends || []
          });
        } else {
          setUser({
            ...authUser,
            customUID: 'Unknown',
            displayName: authUser.displayName || 'User',
            photoURL: authUser.photoURL || '',
            friends: []
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({ title: 'Connection Error', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const toggleDropdown = (label: string) => {
    setOpenDropdown(prev => prev === label ? null : label);
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      toast({ title: 'Logged out successfully' });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({ title: 'Logout Failed', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-background border-r shadow-lg">
        <div className="p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-background border-r shadow-lg transition-transform duration-200 ease-in-out flex flex-col',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          <h2 className="text-lg font-semibold tracking-tight px-2">Navigation</h2>
          <nav className="space-y-1">
            {navigationLinks.map((link) => (
              <div key={link.to || link.label} className="px-1">
                <NavLink
                  link={link}
                  isOpen={isOpen}
                  openDropdown={openDropdown}
                  toggleDropdown={toggleDropdown}
                />
              </div>
            ))}
          </nav>
        </div>
      </ScrollArea>

      <footer className="border-t p-4 space-y-3">
        <Button 
          asChild 
          variant="ghost" 
          className="w-full justify-start group"
        >
          <Link to="/settings">
            <Settings className="h-5 w-5 mr-2 transition-colors group-hover:text-primary" /> 
            Settings
          </Link>
        </Button>

        <Button 
          asChild 
          variant="ghost" 
          className="w-full justify-start group"
        >
          <Link to="/help">
            <HelpCircle className="h-5 w-5 mr-2 transition-colors group-hover:text-primary" /> 
            Help
          </Link>
        </Button>

        <Button 
          variant="ghost" 
          className="w-full justify-start group"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5 mr-2 transition-colors group-hover:text-primary" /> 
          Logout
        </Button>

        <div className="flex items-center gap-3 pt-4 border-t">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={user?.photoURL || ''} 
              alt={user?.displayName || 'User avatar'} 
            />
            <AvatarFallback>
              {user?.displayName?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>

          <div>
            <p className="text-sm font-medium line-clamp-1">
              {user?.displayName || 'User'}
            </p>
            <p className="text-xs text-muted-foreground">
              #{user?.customUID?.toUpperCase() || 'N/A'}
            </p>
          </div>
        </div>
      </footer>
    </aside>
  );
}

export default Sidebar;