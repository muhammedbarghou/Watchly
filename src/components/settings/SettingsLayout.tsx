import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface SettingsLayoutProps {
  children: React.ReactNode;
  tabs: {
    label: string;
    value: string;
    icon?: React.ReactNode;
  }[];
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function SettingsLayout({ children, tabs, activeTab, onTabChange }: SettingsLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const DesktopNav = () => (
    <div className="w-64 shrink-0 hidden md:block">
      <nav className="sticky top-4 flex flex-col gap-1 pr-4">
        {tabs.map((tab) => (
          <motion.button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm rounded-lg text-left transition-all",
              "hover:shadow-lg group relative overflow-hidden",
              activeTab === tab.value
                ? "bg-netflix-red text-white shadow-red-500/20"
                : "text-gray-2900 hover:bg-netflix-gray hover:text-white"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
            <span className="flex-1">{tab.label}</span>
            {activeTab === tab.value && (
              <ChevronRight className="w-4 h-4 opacity-60" />
            )}
            {activeTab === tab.value && (
              <motion.div
                className="absolute inset-0 bg-white/10"
                layoutId="activeTab"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.button>
        ))}
      </nav>
    </div>
  );

  const MobileNav = () => (
    <div className="md:hidden mb-4">
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="w-full flex items-center justify-between text-gray-400 hover:text-white"
          >
            <span>
              {tabs.find(tab => tab.value === activeTab)?.label || 'Select Setting'}
            </span>
            <ChevronDown className="w-4 h-4 opacity-60" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[50vh] bg-netflix-black border-gray-800">
          <nav className="flex flex-col gap-1 mt-4">
            {tabs.map((tab) => (
              <motion.button
                key={tab.value}
                onClick={() => {
                  onTabChange(tab.value);
                  setIsMobileMenuOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm rounded-lg text-left",
                  activeTab === tab.value
                    ? "bg-red-600 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
                whileTap={{ scale: 0.98 }}
              >
                {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
                <span className="flex-1">{tab.label}</span>
                {activeTab === tab.value && (
                  <ChevronRight className="w-4 h-4 opacity-60" />
                )}
              </motion.button>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-6">
        <MobileNav />
        <DesktopNav />
        <motion.div 
          className="flex-1 min-h-[50vh] rounded-xl backdrop-blur-sm "
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}