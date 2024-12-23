import React, { useState,useEffect } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useSpring, animated } from "react-spring";
import { Users, History, Bolt, LogOut,CircleUserRound } from "lucide-react";
import { ThemeToggle } from '../../theme/ThemeToggle';
import Settings from '../../HomePage/Settings';
import { auth } from '../../../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { useNavigate } from 'react-router-dom';

const Friends = ({ isOpen, onClose }) => {
  return (
    <AlertDialog.Root open={isOpen} onOpenChange={onClose}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
        <AlertDialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-1/3 h-1/2  overflow-y-auto focus:outline-none">
          <div className="flex justify-between items-center m-5">
            <AlertDialog.Title className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Friends List
            </AlertDialog.Title>
            <AlertDialog.Cancel asChild>
              <button
                  className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  onClick={onClose}
              >
                Close
              </button>
            </AlertDialog.Cancel>
          </div>
          <div className="max-w-2xl mx-auto px-4">
            no friens
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

const RoomHistory = ({ isOpen, onClose }) => {
  return (
    <AlertDialog.Root open={isOpen} onOpenChange={onClose}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
        <AlertDialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-[90vw] max-w-md max-h-[85vh] overflow-y-auto focus:outline-none">
          <AlertDialog.Title className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Room History
          </AlertDialog.Title>
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">Your room history will appear here</p>
          </div>
          <div className="mt-6 flex justify-end">
            <AlertDialog.Cancel asChild>
              <button
                className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                onClick={onClose}
              >
                Close
              </button>
            </AlertDialog.Cancel>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

const SettingsDialog = ({ isOpen, onClose }) => {
  return (
    <AlertDialog.Root open={isOpen} onOpenChange={onClose}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
        <AlertDialog.Content className="w-2/3 h-2/3 fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-y-auto focus:outline-none">
          <div className="flex justify-between items-center m-5">
            <AlertDialog.Title className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Settings
            </AlertDialog.Title>
            <AlertDialog.Cancel asChild>
              <button
                className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                onClick={onClose}
              >
                Close
              </button>
            </AlertDialog.Cancel>
          </div>
          <div className="">
            <Settings />
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

const UserProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // Store Firestore user data
  const navigate = useNavigate();
  const db = getFirestore();

  const animation = useSpring({
    opacity: isOpen ? 1 : 0,
    transform: isOpen ? 'scale(1)' : 'scale(0.95)',
    config: { tension: 200, friction: 20 },
  });

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
            const userData = userDoc.data();
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
  }, [db, auth]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  if (!user) {
    return (
        <div
            className="animate-spin inline-block size-6 border-[3px] border-current border-t-transparent text-red-600 rounded-full dark:text-red-500"
            role="status"
            aria-label="loading"
        >
          <span className="sr-only">Loading...</span>
        </div>
    );
  }

  const menuItems = [
    {
      icon: Users,
      label: 'Friends list',
      onClick: () => setShowFriends(true),
    },
    {
      icon: History,
      label: 'Room history',
      onClick: () => setShowHistory(true),
    },
    {
      icon: Bolt,
      label: 'Settings',
      onClick: () => setShowSettings(true),
    },
  ];

  return (
      <div className="relative">
        <DropdownMenu.Root onOpenChange={(open) => setIsOpen(open)}>
          <DropdownMenu.Trigger asChild>
            <button className="focus:outline-none">
              <CircleUserRound className="w-8 h-8 text-gray-600 dark:text-gray-400" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <animated.div style={animation}>
              <DropdownMenu.Content className="absolute right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-64 z-50 transform origin-top-right border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <img
                      src={userData?.photoURL || user.photoURL || 'https://via.placeholder.com/150'}
                      alt="User Avatar"
                      className="rounded-full w-12 h-12 mr-3 border border-gray-300 dark:border-gray-600"
                  />
                  <div>
                    <strong className="text-gray-900 dark:text-white">{userData?.name || 'User'}</strong>
                    <p className="text-sm text-gray-500 dark:text-gray-400">ID: #{userData?.userId || 'No ID available'}</p>
                  </div>
                </div>
                {menuItems.map((item, index) => (
                    <DropdownMenu.Item
                        key={index}
                        className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={item.onClick}
                    >
                      <item.icon className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-3" />
                      <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                    </DropdownMenu.Item>
                ))}
                <DropdownMenu.Separator className="w-full h-px my-2 bg-gray-200 dark:bg-gray-700" />
                <DropdownMenu.Item className="p-2">
                  <ThemeToggle />
                </DropdownMenu.Item>
                <DropdownMenu.Item
                    className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">Logout</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </animated.div>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        <Friends isOpen={showFriends} onClose={() => setShowFriends(false)} />
        <RoomHistory isOpen={showHistory} onClose={() => setShowHistory(false)} />
        <SettingsDialog isOpen={showSettings} onClose={() => setShowSettings(false)} />
      </div>
  );
};

export default UserProfileDropdown;
