import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";


function Home() {
const friendsInRooms = [
    { name: "John Doe", room: "Movie Night", avatar: "https://via.placeholder.com/40" },
    { name: "Emily Davis", room: "Movie Night", avatar: "https://via.placeholder.com/40" },
];

return (
    <main className="w-full h-screen bg-transparent flex flex-col lg:flex-row">
        <section className="w-full lg:w-3/4 p-6 ">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Welcome to Watchly</h2>
            <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">How to set your Room</h3>
            <Carousel 
                autoPlay={true}
                interval={3000} 
                infiniteLoop={true} 
                showThumbs={false} 
                showStatus={false} 
                showArrows={true} 
                transitionTime={1000}>
            </Carousel>
            </div>
        </section>
        <aside className="w-full lg:w-1/4  dark:text-white p-6  lg:border-l  border-white">
        <h3 className="text-lg font-semibold mb-4">Friends in Rooms</h3>
        <ul className="space-y-4">
          {friendsInRooms.length > 0 ? (
            friendsInRooms.map((friend, index) => (
              <li key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <div className="flex items-center">
                  <img
                    src={friend.avatar}
                    alt={`${friend.name} Profile`}
                    className="rounded-full w-10 h-10 mr-3"
                  />
                  <div>
                    <p className="text-sm font-semibold">{friend.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      In Room: {friend.room}
                    </p>
                  </div>
                </div>
                <button className="bg-[#d00000] hover:bg-[#6A040F] transition duration-300 ease-in text-white text-sm py-1 px-3 rounded">
                  Request Join
                </button>
              </li>
            ))
          ) : (
            <li className="text-sm text-gray-500 dark:text-gray-400">
              No friends in rooms currently.
            </li>
          )}
        </ul>
        </aside>
    </main>
  );
}

export default Home;
