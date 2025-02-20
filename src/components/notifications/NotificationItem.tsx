import { UserPlus, Video } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface NotificationItemProps {
  title: string
  message: string
  time: string
  type: "invite" | "friend"
  user: {
    name: string
    image: string
  }
  isRead: boolean
  onAccept?: () => void
  onDecline?: () => void
}

export function NotificationItem({ message, time, type, user, isRead, onAccept, onDecline }: NotificationItemProps) {
  const Icon = type === "invite" ? Video : UserPlus

  return (
    <Card
      className={cn(
        "w-full transition-all duration-200 hover:scale-[1.02]",
        !isRead ? "bg-gray-900/30" : "bg-gray-800/20",
      )}
    >
      <div className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-shrink-0">
            <Avatar className="h-12 w-12 ring-2 ring-gray-700/50 transition-all duration-200 hover:ring-gray-600">
              <AvatarImage src={user.image} alt={user.name} className="object-cover" />
              <AvatarFallback className="bg-gray-800 text-gray-200 font-medium">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 rounded-full bg-gray-900 p-1.5 ring-2 ring-gray-800">
              <Icon className={cn("w-3.5 h-3.5", type === "invite" ? "text-red-500" : "text-blue-500")} />
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-100 line-clamp-2">
                  <span>{user.name}</span> <span className="text-gray-400 font-normal">{message}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">{time}</p>
              </div>
              {!isRead && <div className="w-2 h-2 rounded-full bg-red-500 mt-1 flex-shrink-0 animate-pulse" />}
            </div>

            {type === "friend" && (
              <div className="flex flex-wrap gap-2 mt-3">
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    onAccept?.()
                  }}
                >
                  Accept
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-gray-800/50"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDecline?.()
                  }}
                >
                  Decline
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default NotificationItem

