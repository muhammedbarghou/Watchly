import React from 'react';
import { cn } from '../../lib/utils';

interface SettingsLayoutProps {
  children: React.ReactNode;
  tabs: {
    label: string;
    value: string;
  }[];
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function SettingsLayout({ children, tabs, activeTab, onTabChange }: SettingsLayoutProps) {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex gap-6">
        <div className="w-48 shrink-0">
          <nav className="flex flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => onTabChange(tab.value)}
                className={cn(
                  "px-4 py-2 text-sm rounded-lg text-left",
                  activeTab === tab.value 
                    ? "bg-netflix-red text-white" 
                    : "text-gray-400 hover:bg-netflix-gray hover:text-white"
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex-1 min-h-auto bg-netflix-gray/50 rounded-lg p-6">
          {children}
        </div>
      </div>
    </div>
  );
}