import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  return (
    <div className="h-screen bg-gray-50 dark:bg-netflix-black text-foreground">
      <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar isOpen={isSidebarOpen} />
        <main className={`transition-all duration-200 p-5 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <div className="">
            {children}
          </div>
        </main>
    </div>
  );
}