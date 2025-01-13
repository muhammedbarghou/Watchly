import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ThemeToggle } from '../ui/theme-toggle';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar isOpen={isSidebarOpen} />
      
      <main className={`pt-16 transition-all duration-200 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-end mb-4">
            <ThemeToggle />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}