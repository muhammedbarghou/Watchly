import { NotificationDropdown } from '../notifications/NotificationDropdown';
import { UserDropdown } from '../user/UserDropdown';
import Logo from "@/assets/logo.png";
import Logo2 from "@/assets/Logo2.png";
import { ThemeToggle } from '../ui/theme-toggle';
import { ReactNode } from 'react';

interface RoomNavProps {

    children: ReactNode;
  
  }


export function RoomNav ({children}: RoomNavProps) {
    return(
        <header className="dark:bg-netflix-black w-full z-50 bg-gray-100">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={Logo} alt="Logo" className="h-7 hidden dark:block" />
            <img src={Logo2} alt="Logo" className="h-7 dark:hidden" />
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <NotificationDropdown />
            <UserDropdown />
          </div>
        </div>
      </header>
    )
}