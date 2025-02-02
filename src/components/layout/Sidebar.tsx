import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Video, Settings, MessageCircle, Plus, LogIn, Users, ChevronDown, HelpCircle, LogOut, UserPlus, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

type ExtendedFirebaseUser = FirebaseUser & {
  customUID?: string;
  displayName?: string;
  photoURL?: string;
  friends?: string[];
};

export function Sidebar({ isOpen }: { isOpen: boolean }) {
  const location = useLocation();
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

  const links = [
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
        { to: '/friends', icon: UserPlus, label: 'Add Friends' },
        { to: '/friends-list', icon: List, label: 'Friend List' },
      ],
    },
    { to: '/chat', icon: MessageCircle, label: 'Chat' },
  ];

  if (loading) {
    return (
      <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-background border-r shadow-lg">
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
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
            {links.map((link) => (
              <div key={link.to || link.label} className="px-1">
                {link.to ? (
                  <Button
                    asChild
                    variant={location.pathname === link.to ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start group",
                      location.pathname === link.to && "bg-accent"
                    )}
                  >
                    <Link to={link.to} className="flex items-center gap-3">
                      <link.icon className="h-4 w-4 transition-colors group-hover:text-primary" />
                      <span>{link.label}</span>
                    </Link>
                  </Button>
                ) : (
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
                    {openDropdown === link.label && (
                      <div className="pl-4 pt-1 space-y-1">
                        {link.children?.map((child) => (
                          <Button
                            key={child.to}
                            asChild
                            variant={location.pathname === child.to ? "secondary" : "ghost"}
                            className={cn(
                              "w-full justify-start group",
                              location.pathname === child.to && "bg-accent"
                            )}
                          >
                            <Link to={child.to} className="flex items-center gap-3">
                              <child.icon className="h-4 w-4 transition-colors group-hover:text-primary" />
                              <span className="text-sm">{child.label}</span>
                            </Link>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </ScrollArea>

      <footer className="border-t bg-background p-4 space-y-3">
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
          <div className="relative h-10 w-10">
              <img
                src={user?.photoURL || ''}
                alt={user?.displayName || 'User avatar'}
                className="rounded-full h-10 w-10 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
          </div>

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