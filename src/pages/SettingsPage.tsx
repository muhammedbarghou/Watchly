import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { SettingsLayout } from '../components/settings/SettingsLayout';
import { AccountSettings } from '../components/settings/sections/AccountSettings';
import { NotificationSettings } from '../components/settings/sections/NotificationSettings';
import { PrivacySettings } from '../components/settings/sections/PrivacySettings';
import { HelpSupportSettings } from '../components/settings/sections/HelpSupportSettings';
import { LegalAboutSettings } from '../components/settings/sections/LegalAboutSettings';
import { Settings, Bell, Shield, HelpCircle, FileText, Loader2 } from 'lucide-react';

const TABS = [
  { label: 'Account', value: 'account', icon: <Settings className="w-4 h-4" /> },
  { label: 'Notifications', value: 'notifications', icon: <Bell className="w-4 h-4" /> },
  { label: 'Privacy & Security', value: 'privacy', icon: <Shield className="w-4 h-4" /> },
  { label: 'Help & Support', value: 'help', icon: <HelpCircle className="w-4 h-4" /> },
  { label: 'Legal & About', value: 'legal', icon: <FileText className="w-4 h-4" /> }
];

export function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Get active tab from URL or default to first tab
  const activeTab = searchParams.get('tab') || TABS[0].value;

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setIsLoading(true);
    setError(null);
    
    // Update URL with new tab
    setSearchParams({ tab: value });

    // Simulate loading state for better UX
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  // Validate tab value from URL
  React.useEffect(() => {
    const isValidTab = TABS.some(tab => tab.value === activeTab);
    if (!isValidTab) {
      navigate('/settings?tab=account', { replace: true });
    }
  }, [activeTab, navigate]);

  const renderContent = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 text-red-500 hover:text-red-400"
          >
            Reload page
          </button>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      );
    }

    switch (activeTab) {
      case 'account':
        return <AccountSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'privacy':
        return <PrivacySettings />;
      case 'help':
        return <HelpSupportSettings />;
      case 'legal':
        return <LegalAboutSettings />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <p>This section is coming soon...</p>
            <button 
              onClick={() => handleTabChange('account')}
              className="mt-4 text-red-500 hover:text-red-400"
            >
              Go back to Account Settings
            </button>
          </div>
        );
    }
  };

  return (
    <MainLayout>
      <div className="max-w-screen-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6 px-4">Settings</h1>
        <SettingsLayout
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        >
          {renderContent()}
        </SettingsLayout>
      </div>
    </MainLayout>
  );
}