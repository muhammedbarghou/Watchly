import React from "react";
import * as ScrollArea from "@radix-ui/react-scroll-area";

function Profile() {
  const friends = [
    {
      avatar: "https://api.uifaces.co/our-content/donated/xZ4wg2Xj.jpg",
      name: "John Doe",
    },
    {
      avatar: "https://api.uifaces.co/our-content/donated/xZ4wg2Xj.jpg",
      name: "Jane Smith",
    },
    {
      avatar: "https://api.uifaces.co/our-content/donated/xZ4wg2Xj.jpg",
      name: "Michael Brown",
    },
    {
      avatar: "https://api.uifaces.co/our-content/donated/xZ4wg2Xj.jpg",
      name: "Emily Davis",
    },
    {
      avatar: "https://api.uifaces.co/our-content/donated/xZ4wg2Xj.jpg",
      name: "Emily Davis",
    },
    {
      avatar: "https://api.uifaces.co/our-content/donated/xZ4wg2Xj.jpg",
      name: "Emily Davis",
    },
    
  ];

  return (
    <div className="w-screen h-screen mx-auto bg-white p-6 dark:bg-gray-800">
      <header className="flex flex-col items-center md:flex-row md:items-center md:border-b pb-4 mb-6">
        <img
          src="https://via.placeholder.com/80"
          alt="Profile Avatar"
          className="rounded-full w-20 h-20 mb-4 md:mb-0 md:mr-4"
        />
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold dark:text-white">Alexis</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Member since 2020
          </p>
        </div>
      </header>
      <main className="flex flex-col md:flex-row h-full w-full">
        {/* Statistics Section */}
        <aside className="w-full md:w-1/2 p-5">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-100 p-4 rounded-lg text-center dark:text-white dark:bg-gray-700">
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-gray-500">Rooms Created</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg text-center dark:text-white dark:bg-gray-700">
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-gray-500">Rooms Joined</p>
            </div>
          </div>
        </aside>

        {/* Friends Section */}
        <div className="w-full md:w-1/2 h-full p-5">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Friends</h3>
          <ScrollArea.Root className="bg-gray-100 p-4 rounded-lg dark:text-white dark:bg-gray-700">
            <ScrollArea.Viewport className="h-64">
              <ul className="space-y-5">
                {friends.map((friend, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={friend.avatar}
                        alt={`${friend.name}'s avatar`}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <span className="block text-sm text-gray-700 dark:text-gray-200 font-semibold">
                          {friend.name}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea.Viewport>

            {/* Scrollbar (Vertical) */}
            <ScrollArea.Scrollbar
              orientation="vertical"
              className="bg-gray-200 dark:bg-gray-600 w-2 rounded-full"
            >
              <ScrollArea.Thumb className="bg-gray-400 dark:bg-gray-500 rounded-full" />
            </ScrollArea.Scrollbar>

            {/* Scrollbar (Horizontal) */}
            <ScrollArea.Scrollbar
              orientation="horizontal"
              className="bg-gray-200 dark:bg-gray-600 h-2 rounded-full"
            >
              <ScrollArea.Thumb className="bg-gray-400 dark:bg-gray-500 rounded-full" />
            </ScrollArea.Scrollbar>

            {/* Scroll Area Corner */}
            <ScrollArea.Corner className="bg-gray-300 dark:bg-gray-600" />
          </ScrollArea.Root>
        </div>
      </main>
    </div>
  );
}

export default Profile;
