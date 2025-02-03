import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';


interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle clicking outside sidebar on mobile to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isSidebarOpen) {
        const sidebar = document.getElementById('sidebar');
        const sidebarButton = document.getElementById('sidebar-button');
        
        if (sidebar && 
            !sidebar.contains(event.target as Node) && 
            sidebarButton && 
            !sidebarButton.contains(event.target as Node)) {
          setIsSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isSidebarOpen]);

  return (
    <div className="min-h-screen h-screen bg-gray-50 dark:bg-netflix-black text-foreground flex flex-col overflow-hidden">
      <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex-1 flex relative overflow-hidden">
        {/* Overlay for mobile when sidebar is open */}
        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <div id="sidebar" className="z-50">
          <Sidebar isOpen={isSidebarOpen} />
        </div>

        {/* Main Content */}
        <main 
          className={cn(
            "flex-1 transition-all duration-200 overflow-y-auto",
            {
              'lg:ml-64': isSidebarOpen,
              'ml-0': !isSidebarOpen || isMobile
            }
          )}
        >
          <div className="h-full p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;