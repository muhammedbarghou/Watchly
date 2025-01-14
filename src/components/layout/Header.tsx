import { Menu } from 'lucide-react';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import { UserDropdown } from '../user/UserDropdown';
import { Button } from '../ui/button';
import Logo from "@/assets/logo.png";
import SearchComponent from '../user/SearchUsers';
import { ThemeToggle } from '../ui/theme-toggle';


export function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  return (
    <header className="bg-netflix-black border-b border-netflix-gray fixed w-full z-50">
      <div className="px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleSidebar}
            className="text-white hover:bg-netflix-gray"
          >
            <Menu className="w-5 h-5" />
          </Button>
            <img src={Logo} alt=""  className=' h-7'/>
        </div>
        <div className="flex items-center gap-4">
          <SearchComponent />
          <ThemeToggle />
          <NotificationDropdown />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}