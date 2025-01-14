import { Cookie,Shield, Book,} from 'lucide-react';
import { Button } from '../../ui/button';



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

    </div>
  );
}