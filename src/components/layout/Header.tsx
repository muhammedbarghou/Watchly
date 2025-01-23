import { Menu } from 'lucide-react';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import { UserDropdown } from '../user/UserDropdown';
import { Button } from '../ui/button';
import Logo from "@/assets/logo.png";
import Logo2 from "@/assets/Logo2.png";
import SearchComponent from '../user/SearchUsers';
import { ThemeToggle } from '../ui/theme-toggle';


export function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  return (
    <header className="dark:bg-netflix-black w-full z-50 bg-gray-100">
      <div className="px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleSidebar}
          >
            <Menu className="w-5 h-5 dark:text-white text-black" />
          </Button>
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
  );
}