import { useEffect, useState, useCallback, memo } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  Home,
  Video,
  Settings,
  MessageCircle,
  Plus,
  LogIn,
  Users,
  ChevronDown,
  HelpCircle,
  LogOut,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import type { User as FirebaseUser } from "firebase/auth"
import { toast } from "@/hooks/use-toast"

// ========== Types ==========
interface NavigationLink {
  to?: string
  icon: React.ElementType
  label: string
  children?: NavigationLink[]
}

type ExtendedFirebaseUser = FirebaseUser & {
  customUID?: string
  displayName?: string
  photoURL?: string
  friends?: string[]
}

interface SidebarProps {
  isOpen: boolean
  isCollapsed: boolean
  toggleSidebar?: () => void
  toggleCollapsed?: () => void
}

// ========== Navigation Data ==========
const navigationLinks: NavigationLink[] = [
  { to: "/hub", icon: Home, label: "Home" },
  {
    label: "Rooms",
    icon: Video,
    children: [
      { to: "/create", icon: Plus, label: "Create Room" },
      { to: "/join", icon: LogIn, label: "Join Room" },
    ],
  },
  {
    label: "Friends",
    icon: Users,
    children: [
      { to: "/friends", icon: UserPlus, label: "Friends Activities" },
    ],
  },
  { to: "/chat", icon: MessageCircle, label: "Chat" },
]

// ========== useSidebar Hook ==========
export function useSidebar() {
  // Get saved preferences from localStorage, default to open on larger screens and closed on mobile
  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    // Check if it's a mobile device initially
    const isMobile = window.innerWidth < 1024;
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return !isMobile; // Default: open on desktop, closed on mobile
  });

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Toggle sidebar open/closed
  const toggleSidebar = useCallback(() => {
    setIsOpen((prev: any) => !prev);
  }, []);

  // Toggle sidebar between collapsed/expanded
  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev: any) => !prev);
  }, []);

  // Close sidebar on small screens when navigating
  const closeSidebarOnMobile = useCallback(() => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(isOpen));
  }, [isOpen]);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // Handle resize to auto-adjust sidebar for different screen sizes
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 1024;
      // Only auto-close or auto-open on initial resize events
      // This prevents disrupting user's manual preference during regular use
      if (isMobile && window.innerWidth < 640) {
        setIsOpen(false);
      } else if (!isMobile && window.innerWidth >= 1280) {
        // Optional: auto-expand on very large screens
        // setIsCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isOpen,
    isCollapsed,
    toggleSidebar,
    toggleCollapsed,
    closeSidebarOnMobile
  };
}

// ========== NavLink Component ==========
const NavLink = memo(({ link, isCollapsed, closeSidebarOnMobile }: 
  { link: NavigationLink; isCollapsed: boolean; closeSidebarOnMobile?: () => void }) => {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const isActive = link.to && location.pathname === link.to

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const handleNavigation = useCallback(() => {
    if (closeSidebarOnMobile) {
      closeSidebarOnMobile();
    }
  }, [closeSidebarOnMobile]);

  if (link.to) {
    const content = (
      <Button
        asChild
        variant={isActive ? "secondary" : "ghost"}
        className={cn("w-full justify-start", isActive && "bg-netflix-red hover:bg-netflix-red")}
        onClick={handleNavigation}
      >
        <Link to={link.to} className="flex items-center gap-3">
          <link.icon className="h-4 w-4" />
          {!isCollapsed && <span>{link.label}</span>}
        </Link>
      </Button>
    )

    return isCollapsed ? (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right">{link.label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : (
      content
    )
  }

  return (
    <div className="space-y-1">
      <Button
        variant="ghost"
        onClick={toggleOpen}
        className={cn("w-full justify-between", isCollapsed && "justify-center")}
      >
        <div className="flex items-center gap-3">
          <link.icon className="h-4 w-4" />
          {!isCollapsed && <span>{link.label}</span>}
        </div>
        {!isCollapsed && (
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")} />
        )}
      </Button>
      {isOpen && link.children && !isCollapsed && (
        <div className="pl-4 space-y-1">
          {link.children.map((child) => (
            <NavLink 
              key={child.to} 
              link={child} 
              isCollapsed={isCollapsed} 
              closeSidebarOnMobile={closeSidebarOnMobile}
            />
          ))}
        </div>
      )}
    </div>
  )
})

NavLink.displayName = "NavLink"

// ========== Sidebar Component ==========
export function Sidebar({ isOpen, isCollapsed, toggleSidebar, toggleCollapsed }: SidebarProps) {
  const navigate = useNavigate()
  const [user, setUser] = useState<ExtendedFirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const { closeSidebarOnMobile } = useSidebar()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (!authUser) {
        setUser(null)
        setLoading(false)
        navigate("/login")
        return
      }

      try {
        const userDocRef = doc(db, "users", authUser.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          const userData = userDoc.data()
          setUser({
            ...authUser,
            customUID: userData.customUID || "Unknown",
            displayName: userData.displayName || authUser.displayName || "User",
            photoURL: userData.photoURL || authUser.photoURL,
            friends: userData.friends || [],
          })
        } else {
          setUser({
            ...authUser,
            customUID: "Unknown",
            displayName: authUser.displayName || "User",
            photoURL: authUser.photoURL || "",
            friends: [],
          })
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast({ title: "Connection Error", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [navigate])

  const handleSignOut = useCallback(async () => {
    try {
      await auth.signOut()
      toast({ title: "Logged out successfully" })
      navigate("/login")
    } catch (error) {
      console.error("Logout error:", error)
      toast({ title: "Logout Failed", variant: "destructive" })
    }
  }, [navigate])

  if (loading) {
    return (
      <aside className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background border-r shadow-lg transition-all duration-300 ease-in-out flex items-center justify-center",
        isOpen ? (isCollapsed ? "w-16" : "w-64") : "-translate-x-full"
      )}>
        <div className="w-8 h-8 border-t-2 border-primary rounded-full animate-spin"></div>
      </aside>
    )
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background border-r shadow-lg transition-all duration-300 ease-in-out flex flex-col z-40",
        isOpen ? (isCollapsed ? "w-16" : "w-64") : "-translate-x-full",
      )}
    >
      {/* Mobile toggle button */}
      {toggleSidebar && (
        <button 
          onClick={toggleSidebar}
          className="absolute right-0 top-4 translate-x-full bg-background p-2 rounded-r-md border border-l-0 shadow-md lg:hidden"
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        >
          <ChevronDown className={cn("h-5 w-5 transition-transform", isOpen ? "rotate-90" : "-rotate-90")} />
        </button>
      )}
      
      {/* Desktop collapse button */}
      {toggleCollapsed && (
        <button
          onClick={toggleCollapsed}
          className="absolute right-0 top-20 translate-x-full bg-background p-2 rounded-r-md border border-l-0 shadow-md hidden lg:block"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      )}

      <ScrollArea className="flex-1">
        <div className={cn("space-y-4 py-4", isCollapsed ? "px-2" : "px-4")}>
          <nav className="space-y-1">
            {navigationLinks.map((link) => (
              <NavLink 
                key={link.to || link.label} 
                link={link} 
                isCollapsed={isCollapsed} 
                closeSidebarOnMobile={closeSidebarOnMobile}
              />
            ))}
          </nav>
        </div>
      </ScrollArea>

      <div className={cn("border-t p-4", isCollapsed && "p-2")}>
        <NavLink 
          link={{ to: "/settings", icon: Settings, label: "Settings" }} 
          isCollapsed={isCollapsed} 
          closeSidebarOnMobile={closeSidebarOnMobile}
        />
        <NavLink 
          link={{ to: "/help", icon: HelpCircle, label: "Help" }} 
          isCollapsed={isCollapsed}
          closeSidebarOnMobile={closeSidebarOnMobile}
        />
        <Button
          variant="ghost"
          className={cn("w-full justify-start", isCollapsed && "justify-center")}
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {!isCollapsed && <span>Logout</span>}
        </Button>

        {user && (
          <div className={cn(
            "flex items-center gap-3 pt-4 border-t mt-4",
            isCollapsed && "justify-center"
          )}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "User avatar"} />
              <AvatarFallback>{user?.displayName?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>

            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-medium line-clamp-1">{user?.displayName || "User"}</p>
                <p className="text-xs text-muted-foreground">#{user?.customUID?.toUpperCase() || "N/A"}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}

// ========== Header Component with Sidebar Toggle ==========
export function Header() {
  const { isCollapsed, toggleSidebar, toggleCollapsed } = useSidebar();


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Button variant="ghost" size="icon" className="mr-2 md:hidden" onClick={toggleSidebar} aria-label="Toggle menu">
            <Menu className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden md:flex" onClick={toggleCollapsed} aria-label="Toggle sidebar collapse">
            {isCollapsed ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <span className="hidden font-bold sm:inline-block">VideoSync</span>
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2">
          <div className="w-full flex-1" />
          {/* Add any right-side header elements like notifications, search, etc. */}
        </div>
      </div>
    </header>
  );
}

// ========== Main Layout Component ==========
export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isOpen, isCollapsed, toggleSidebar, toggleCollapsed } = useSidebar();
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar 
          isOpen={isOpen} 
          isCollapsed={isCollapsed} 
          toggleSidebar={toggleSidebar}
          toggleCollapsed={toggleCollapsed}
        />
        <main className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          isOpen && (isCollapsed ? "lg:ml-16" : "lg:ml-64")
        )}>
          <div className="container px-4 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Sidebar;