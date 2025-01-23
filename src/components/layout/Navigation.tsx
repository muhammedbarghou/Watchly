import { Menu } from 'lucide-react';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import { UserDropdown } from '../user/UserDropdown';
import { Button } from '../ui/button';
import Logo from "@/assets/logo.png";
import Logo2 from "@/assets/Logo2.png";
import SearchComponent from '../user/SearchUsers';
import { ThemeToggle } from '../ui/theme-toggle';
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Video, Settings, MessageCircle, Users, VideoIcon } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRoomsOpen, setIsRoomsOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: '/friends', icon: Home, label: 'Home' },
    {
      to: '/rooms',
      icon: Video,
      label: 'Rooms',
      children: [
        { to: '/rooms/join', icon: Users, label: 'Join Room' },
        { to: '/rooms/create', icon: VideoIcon, label: 'Create Room' }
      ]
    },
    { to: '/settings', icon: Settings, label: 'Settings' },
    { to: '/chat', icon: MessageCircle, label: 'Chat' },
  ];

  const NavLink = ({ to, icon: Icon, label, isChild = false }: { to: string, icon: React.ComponentType<any>, label: string, isChild?: boolean }) => (
    <Link to={to}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2",
          location.pathname === to && "bg-accent",
          isChild && "pl-8"
        )}
      >
        <Icon className="h-4 w-4" />
        {label}
      </Button>
    </Link>
  );

  return (
    <>
      <header className="dark:bg-netflix-black w-full z-50 bg-gray-100">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5 dark:text-white text-black" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <nav className="p-4">
                  {links.map((link) => 
                    link.children ? (
                      <Collapsible
                        key={link.to}
                        open={isRoomsOpen}
                        onOpenChange={setIsRoomsOpen}
                        className="space-y-2"
                      >
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="w-full justify-start gap-2">
                            <link.icon className="h-4 w-4" />
                            {link.label}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-2">
                          {link.children.map(child => (
                            <NavLink key={child.to} {...child} isChild />
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <div key={link.to} className="mb-2">
                        <NavLink {...link} />
                      </div>
                    )
                  )}
                </nav>
              </SheetContent>
            </Sheet>
            <img src={Logo} alt="Logo" className="h-7 hidden dark:block" />
            <img src={Logo2} alt="Logo" className="h-7 dark:hidden" />
            <SearchComponent />
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <NotificationDropdown />
            <UserDropdown />
          </div>
        </div>
      </header>
    </>
  );
}

export default Navigation;