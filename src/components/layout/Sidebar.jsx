import React from 'react';
import LogoDark from '../../Imgs/logo.png';
import LogoLight from '../../Imgs/Logo2.png';

const Sidebar = ({
  isOpen,
  currentTheme,
  navigation,
}) => {
  
  return (
    <aside className={`fixed top-0 left-0 h-screen w-64 bg-gray-50 transform transition-transform duration-300 ease-in-out dark:bg-gray-950 ${
      isOpen ? "translate-x-0" : "-translate-x-full"
    }`}>
      <div className="flex flex-col h-full">
        <div className="h-20 flex items-center justify-center">
          <img 
            className="w-auto h-8" 
            src={currentTheme === "dark" ? LogoDark : LogoLight} 
            alt="Logo" 
          />
        </div>
        
        <div className="flex-1 flex flex-col h-full overflow-auto">
          <ul className="px-4 text-sm font-medium flex-1 dark:text-white">
            {navigation.map((item, idx) => (
              <li key={idx}>
                <button 
                  onClick={item.onClick}
                  className="flex items-center w-full gap-x-2 text-gray-600 p-2 rounded-lg hover:bg-gray-100 active:bg-gray-100 duration-150 dark:hover:bg-gray-700 bg-transparent"
                >
                  <div className="text-black dark:text-white">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-black dark:text-white">{item.name}</span>
                </button>
              </li>
            ))}
            <li>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;