import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  return (
    <div className="h-screen bg-gray-50 dark:bg-netflix-black text-foreground flex flex-col">
      <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} />
        <main 
          className={`flex-1 transition-all duration-200 ${
            isSidebarOpen ? 'ml-64' : 'ml-0'
          }`}
        >
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}