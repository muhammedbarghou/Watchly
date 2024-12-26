import React from "react";
import { X, PanelRightOpen,Search  } from "lucide-react";
import NotificationsPanel from "../Notifications/NotificationsPanel";
import UserProfileDropdown from "../HomePage/Home/Userprofiledropdown";

export const Header = ({
  isOpen,
  activeComponent,
  onToggleSidebar,
}) => {
  return (
    <nav className="bg-transparent px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
      {/* Sidebar Toggle */}
      <button
        onClick={onToggleSidebar}
        className="bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md transition duration-300 ease-in-out"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-gray-800 dark:text-gray-200" />
        ) : (
          <PanelRightOpen className="w-6 h-6 text-gray-800 dark:text-gray-200" />
        )}
      </button>

      {/* Header Title */}
      <h3 className="text-gray-800 dark:text-gray-200 font-semibold text-lg sm:text-xl">
        {activeComponent.charAt(0).toUpperCase() + activeComponent.slice(1)}
      </h3>
      {/* Right Side: Notifications & User Profile */}
        <div className="flex items-center space-x-6">
            {/* Notifications */}
            <div className="relative">
                <Search className={"absolute top-0 bottom-0 w-6 h-6 my-auto text-gray-400 left-3"}/>
                <input
                    type="text"
                    placeholder="Search"
                    className="w-full py-2 pl-12 pr-4 text-gray-500 border rounded-md outline-none bg-gray-50 focus:bg-white focus:border-red-800"
                />
            </div>
            <div className="relative">
                <NotificationsPanel/>
            </div>

            {/* User Profile Dropdown */}
            <div className="relative">
                <UserProfileDropdown/>
            </div>
        </div>
    </nav>
  );
};
