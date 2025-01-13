import React from 'react';
import { LandingNavbar } from '../landing/LandingNavbar';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-netflix-black">
      <LandingNavbar />
      
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8 bg-netflix-gray p-8 rounded-lg">
          <div>
            <h2 className="text-3xl font-bold text-white text-center">{title}</h2>
            <p className="mt-2 text-center text-gray-400">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}