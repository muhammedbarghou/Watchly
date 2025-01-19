import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-netflix-black text-foreground">
      <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}  />
      <Sidebar isOpen={isSidebarOpen} />
      
      <main className={`pt-16 transition-all duration-200 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="container mx-auto py-5">
          {children}
        </div>
      </main>
    </div>
  );
}