"use client"

import type React from "react"
import { useEffect, useState } from "react"
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
  List,
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
      { to: "/friends-list", icon: List, label: "Friend List" },
    ],
  },
  { to: "/chat", icon: MessageCircle, label: "Chat" },
]

const NavLink: React.FC<{ link: NavigationLink; isCollapsed: boolean }> = ({ link, isCollapsed }) => {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  if (link.to) {
    const content = (
      <Button
        asChild
        variant={location.pathname === link.to ? "secondary" : "ghost"}
        className={cn("w-full justify-start", location.pathname === link.to && "bg-netflix-red hover:bg-netflix-red")}
      >
        <Link to={link.to} className="flex items-center gap-3">
          <link.icon className="h-4 w-4" />
          {!isCollapsed && <span>{link.label}</span>}
        </Link>
      </Button>
    )

    return isCollapsed ? (
      <TooltipProvider>
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
        onClick={() => setIsOpen(!isOpen)}
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
            <NavLink key={child.to} link={child} isCollapsed={isCollapsed} />
          ))}
        </div>
      )}
    </div>
  )
}

interface SidebarProps {
  isOpen: boolean
  isCollapsed: boolean
}

export function Sidebar({ isOpen, isCollapsed }: SidebarProps) {
  const navigate = useNavigate()
  const [user, setUser] = useState<ExtendedFirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

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

  const handleSignOut = async () => {
    try {
      await auth.signOut()
      toast({ title: "Logged out successfully" })
      navigate("/login")
    } catch (error) {
      console.error("Logout error:", error)
      toast({ title: "Logout Failed", variant: "destructive" })
    }
  }

  if (loading) {
    return null // Or a loading spinner
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background border-r shadow-lg transition-all duration-300 ease-in-out flex flex-col",
        isOpen ? (isCollapsed ? "w-16" : "w-64") : "-translate-x-full",
      )}
    >
      <ScrollArea className="flex-1">
        <div className={cn("space-y-4 py-4", isCollapsed ? "px-2" : "px-4")}>
          <nav className="space-y-1">
            {navigationLinks.map((link) => (
              <NavLink key={link.to || link.label} link={link} isCollapsed={isCollapsed} />
            ))}
          </nav>
        </div>
      </ScrollArea>

      <div className={cn("border-t p-4", isCollapsed && "p-2")}>
        <NavLink link={{ to: "/settings", icon: Settings, label: "Settings" }} isCollapsed={isCollapsed} />
        <NavLink link={{ to: "/help", icon: HelpCircle, label: "Help" }} isCollapsed={isCollapsed} />
        <Button
          variant="ghost"
          className={cn("w-full justify-start", isCollapsed && "justify-center")}
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {!isCollapsed && <span>Logout</span>}
        </Button>

        {!isCollapsed && (
          <div className="flex items-center gap-3 pt-4 border-t mt-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "User avatar"} />
              <AvatarFallback>{user?.displayName?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>

            <div>
              <p className="text-sm font-medium line-clamp-1">{user?.displayName || "User"}</p>
              <p className="text-xs text-muted-foreground">#{user?.customUID?.toUpperCase() || "N/A"}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

export default Sidebar

