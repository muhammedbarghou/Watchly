import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import Participants from './Participants';

const MenuToggle = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-white bg-[#D00000] focus:ring-4 focus:outline-none transition duration-300 ease-in font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center hover:bg-[#6A040F]"
      >
        Menu
        <ChevronDown className="w-2.5 h-2.5 ms-3" />
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-2 bg-white divide-y divide-gray-100 rounded-lg shadow w-40 dark:bg-gray-700">
          <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
            <li>
              <Dialog.Root>
                <Dialog.Trigger className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white w-full text-left">
                  Manage participants
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 w-full h-full bg-black opacity-40" />
                  <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-lg mx-auto px-4">
                    <Participants />
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            </li>
            <li>
              <Dialog.Root>
                <Dialog.Trigger className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white w-full text-left">
                  Manage your room
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 w-full h-full bg-black opacity-40" />
                  <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-lg mx-auto px-4">
                    <div className="bg-white rounded-md shadow-lg px-4 py-6 dark:bg-gray-800">
                      <h2 className="text-lg font-semibold mb-4 text-black dark:text-white">
                        Manage your room
                      </h2>
                      <section className="flex flex-col gap-4">
                        <div className="flex flex-row gap-4 items-center justify-between">
                          <label className="block text-sm font-medium text-black dark:text-gray-100">
                            Set your next video link
                          </label>
                          <input
                            type="text"
                            className="w-[450px] py-2 px-3 text-black dark:text-gray-100 bg-transparent outline-none border shadow-sm rounded-lg"
                          />
                        </div>
                        <div className="flex flex-row gap-4 items-center justify-between">
                          <label className="block text-sm font-medium text-black dark:text-gray-100">
                            Theme
                          </label>
                        </div>
                      </section>
                    </div>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            </li>
            <li>
              <button
                onClick={() => navigate('/home')}
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white w-full text-left"
              >
                Leave Room
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default MenuToggle;