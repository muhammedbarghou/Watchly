import { Menu, Search } from "lucide-react"
import { NotificationDropdown } from "../notifications/NotificationDropdown"
import { Button } from "../ui/button"
import { ThemeToggle } from "../ui/theme-toggle"
import SearchComponent from "../user/SearchUsers"
import logo from "../../assets/logo.png"
import logo2 from "../../assets/Logo2.png"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import LanguageSettings from '@/components/LanguageSettings';


interface HeaderProps {
  toggleSidebar: () => void
}

export function Header({ toggleSidebar }: HeaderProps) {
  return (
    <header className="sticky top-0 dark:bg-netflix-black/95 bg-white backdrop-blur-sm w-full z-50 border-b dark:border-gray-800 border-gray-200">
      <div className="px-4 h-16 flex items-center justify-between  mx-auto">
        {/* Left Section */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hover:bg-gray-200 dark:hover:bg-gray-800"
            id="sidebar-button"
          >
            <Menu className="w-5 h-5 dark:text-white text-black" />
          </Button>

          {/* Logo Section - Responsive */}
          <img src={logo || "/placeholder.svg"} alt="Logo" className="h-6 sm:h-7 hidden dark:block" />
          <img src={logo2 || "/placeholder.svg"} alt="Logo" className="h-6 sm:h-7 dark:hidden" />

          {/* Desktop Search */}
          <div className="hidden md:block">
            <SearchComponent />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile Search Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Search className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="h-24">
              <div className="pt-4">
                <SearchComponent />
              </div>
            </SheetContent>
          </Sheet>

          {/* Theme Toggle and Notifications */}
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSettings />
            <ThemeToggle />
            <NotificationDropdown />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
