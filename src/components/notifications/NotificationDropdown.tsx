"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { DropdownMenu } from "../ui/dropdown-menu"
import { NotificationItem } from "./NotificationItem"
import { collection, query, where, onSnapshot, updateDoc, doc, getDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/use-auth"

interface FriendRequest {
  id: string
  recipientId: string
  senderId: string
  status: string
  timestamp: any
  senderName?: string
  senderPhotoURL?: string
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const { currentUser } = useAuth()

  useEffect(() => {
    if (!currentUser?.uid) return

    const friendRequestsRef = collection(db, "friendRequests")
    const q = query(friendRequestsRef, where("recipientId", "==", currentUser.uid))

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const requests: FriendRequest[] = []

      for (const docSnapshot of querySnapshot.docs) {
        const request = docSnapshot.data() as FriendRequest
        request.id = docSnapshot.id

        const senderRef = doc(db, "users", request.senderId)
        const senderDoc = await getDoc(senderRef)

        if (senderDoc.exists()) {
          const senderData = senderDoc.data()
          request.senderName = senderData.displayName || "Anonymous"
          request.senderPhotoURL = senderData.photoURL || ""
        }

        requests.push(request)
      }

      setFriendRequests(requests)
    })

    return () => unsubscribe()
  }, [currentUser])

  const handleAcceptFriendRequest = async (request: FriendRequest) => {
    if (!currentUser?.uid) return

    try {
      const requestRef = doc(db, "friendRequests", request.id)
      const senderRef = doc(db, "users", request.senderId)
      const recipientRef = doc(db, "users", currentUser.uid)

      const recipientDoc = await getDoc(recipientRef)
      if (recipientDoc.exists()) {
        const recipientData = recipientDoc.data()
        const updatedFriends = [
          ...(recipientData.friends || []),
          {
            uid: request.senderId,
            displayName: request.senderName,
            photoURL: request.senderPhotoURL,
          },
        ]

        await updateDoc(recipientRef, { friends: updatedFriends })
      }

      const senderDoc = await getDoc(senderRef)
      if (senderDoc.exists()) {
        const senderData = senderDoc.data()
        const updatedFriends = [
          ...(senderData.friends || []),
          {
            uid: currentUser.uid,
            displayName: currentUser.displayName || "Anonymous",
            photoURL: currentUser.photoURL || "",
          },
        ]

        await updateDoc(senderRef, { friends: updatedFriends })
      }

      await deleteDoc(requestRef)

      setFriendRequests((prev) => prev.filter((req) => req.id !== request.id))
    } catch (error) {
      console.error("Error accepting friend request:", error)
    }
  }

  const handleDeclineFriendRequest = async (request: FriendRequest) => {
    if (!currentUser?.uid) return

    try {
      const requestRef = doc(db, "friendRequests", request.id)

      await deleteDoc(requestRef)

      setFriendRequests((prev) => prev.filter((req) => req.id !== request.id))
    } catch (error) {
      console.error("Error declining friend request:", error)
    }
  }

  return (
    <div className="relative">
      <button
        className="p-2 hover:bg-gray-200 dark:hover:bg-netflix-gray rounded-lg relative transition-colors duration-200 ease-in-out"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-6 h-6 dark:text-gray-400" />
        {friendRequests.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-netflix-red rounded-full" />}
      </button>

      <DropdownMenu isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-80">
        <div className="px-4 py-2">
          <h3 className="font-semibold dark:text-white">Notifications</h3>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {friendRequests.length > 0 ? (
            friendRequests.map((request) => (
              <NotificationItem
                key={request.id}
                title="Friend Request"
                message={`${request.senderName} wants to be your friend`}
                time={new Date(request.timestamp?.toDate()).toLocaleTimeString()}
                type="friend"
                user={{
                  name: request.senderName || "Anonymous",
                  image: request.senderPhotoURL || "",
                }}
                isRead={false}
                onAccept={() => handleAcceptFriendRequest(request)}
                onDecline={() => handleDeclineFriendRequest(request)}
              />
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-400">No new notifications</div>
          )}
        </div>
      </DropdownMenu>
    </div>
  )
}

