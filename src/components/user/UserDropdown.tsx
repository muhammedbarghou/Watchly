import  { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Settings, User } from 'lucide-react';
import { DropdownMenu } from '../ui/dropdown-menu';
import { auth } from '../../lib/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

interface UserData {
  name: string;
  [key: string]: any;
}

interface UserState {
  uid: string;
  email: string | null;
  photoURL: string | null;
}

export function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserState | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const db = getFirestore();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          photoURL: currentUser.photoURL,
        });

        try {
          const userRef = doc(db, "users", currentUser.uid); 
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data() as UserData;
            setUserData(userData);
          } else {
            console.warn("User document does not exist in Firestore.");
            setUserData({ name: "Anonymous" });
          }
        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);
          setUserData({ name: "Error fetching data" });
        }
      } else {
        setUser(null);
        setUserData(null);
      }
    });

    return () => unsubscribe(); 
  }, []); 

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-lg bg-netflix-gray flex items-center justify-center hover:bg-netflix-hover transition-colors"
      >
        <span className="text-sm font-medium text-white">
          {userData?.name?.[0] || 'A'}
        </span>
      </button>

      <DropdownMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="px-4 py-3 border-b border-netflix-gray">
          <p className="font-medium text-white">{userData?.name || 'Anonymous'}</p>
          <p className="text-sm text-gray-400">{user?.email || 'No email'}</p>
        </div>
        
        <div className="py-1">
          <Link
            to="/profile"
            className="px-4 py-2 text-sm flex items-center gap-3 text-gray-400 hover:bg-netflix-gray hover:text-white"
          >
            <User className="w-4 h-4" />
            Profile
          </Link>
          <Link
            to="/settings"
            className="px-4 py-2 text-sm flex items-center gap-3 text-gray-400 hover:bg-netflix-gray hover:text-white"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 text-sm flex items-center gap-3 text-netflix-red hover:bg-netflix-gray"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </DropdownMenu>
    </div>
  );
}