import { useState } from 'react';
import { Plus } from 'lucide-react';
import * as HoverCard from '@radix-ui/react-hover-card';

const members = [
  {
    avatar: "https://api.uifaces.co/our-content/donated/xZ4wg2Xj.jpg",
    name: "John doe",
    status: "friend",
  },
  {
    avatar: "https://api.uifaces.co/our-content/donated/xZ4wg2Xj.jpg",
    name: "Jane doe",
    status: "Not friend",
  },
  {
    avatar: "https://api.uifaces.co/our-content/donated/xZ4wg2Xj.jpg",
    name: "Michael doe",
    status: "Not friend",
  },
  {
    avatar: "https://api.uifaces.co/our-content/donated/xZ4wg2Xj.jpg",
    name: "Emily doe",
    status: "friend",
  },
];

const Participants = () => {
  const [isFriend, setIsFriend] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg max-w-3xl">
      <div className="items-start justify-between sm:flex">
        <h4 className="text-black dark:text-gray-100 text-xl font-semibold">
          Room members
        </h4>
        <button className="inline-flex items-center justify-center gap-1 py-2 px-3 mt-2 font-medium text-sm text-center text-white bg-[#d00000] hover:bg-[#6A040F] transition duration-300 ease-in rounded-lg sm:mt-0">
          <Plus className="w-5 h-5" />
          New member
        </button>
      </div>
      <ul className="mt-12 divide-y">
        {members.map((member, idx) => (
          <li key={idx} className="py-5 flex items-start justify-between">
            <div className="flex gap-3">
              <HoverCard.Root>
                <HoverCard.Trigger>
                  <img
                    src={member.avatar}
                    alt={`${member.name} Profile`}
                    className="rounded-full w-10 h-10 mr-3"
                  />
                </HoverCard.Trigger>
                <HoverCard.Content className="w-80 h-40 rounded-lg">
                  <div className="flex flex-col gap-2 p-3 w-full h-full items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{member.name}</p>
                    <button 
                      onClick={() => setIsFriend(!isFriend)}
                      className="text-sm border w-auto flex items-center justify-center rounded-lg px-3 py-2 duration-150 bg-white hover:bg-gray-100"
                    >
                      {isFriend ? 'Remove friend' : 'Make friend'}
                    </button>
                  </div>
                </HoverCard.Content>
              </HoverCard.Root>
              <div className="flex flex-col items-center justify-center">
                <span className="block text-sm text-gray-700 dark:text-gray-200 font-semibold">
                  {member.name}
                </span>
              </div>
            </div>
            <button className="text-gray-700 text-sm border w-20 flex items-center justify-center rounded-lg px-3 py-2 duration-150 bg-white hover:bg-gray-100">
              Kick
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Participants;