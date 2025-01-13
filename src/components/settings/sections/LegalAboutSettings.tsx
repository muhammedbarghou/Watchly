import React from 'react';
import { ExternalLink, Info, Book, Code } from 'lucide-react';
import { Button } from '../../ui/button';

const dependencies = [
  { name: 'React', version: '18.3.1' },
  { name: 'Firebase', version: '10.8.0' },
  { name: 'Lucide Icons', version: '0.344.0' },
  { name: 'Tailwind CSS', version: '3.4.1' }
];

export function LegalAboutSettings() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Legal</h3>
        <div className="space-y-3">
          <Button variant="secondary" className="w-full justify-start">
            <Book className="w-4 h-4 mr-2" />
            Terms of Service
          </Button>
          <Button variant="secondary" className="w-full justify-start">
            <Shield className="w-4 h-4 mr-2" />
            Privacy Policy
          </Button>
          <Button variant="secondary" className="w-full justify-start">
            <Cookie className="w-4 h-4 mr-2" />
            Cookie Policy
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">About</h3>
        <div className="p-4 rounded-lg bg-netflix-gray/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium">Watchly</h4>
              <p className="text-sm text-gray-400">Version 1.0.0</p>
            </div>
            <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-500">
              Up to date
            </span>
          </div>
          <p className="text-sm text-gray-400">
            © 2024 Watchly. All rights reserved.
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Attributions</h3>
        <div className="space-y-4">
          <div className="rounded-lg border border-netflix-gray overflow-hidden">
            <div className="p-3 bg-netflix-gray/50 border-b border-netflix-gray">
              <h4 className="font-medium">Dependencies</h4>
            </div>
            <div className="divide-y divide-netflix-gray">
              {dependencies.map((dep) => (
                <div key={dep.name} className="flex items-center justify-between p-3">
                  <span>{dep.name}</span>
                  <span className="text-sm text-gray-400">v{dep.version}</span>
                </div>
              ))}
            </div>
          </div>
          
          <Button variant="secondary" className="w-full">
            <Code className="w-4 h-4 mr-2" />
            View All Dependencies
          </Button>
        </div>
      </div>
    </div>
  );
}