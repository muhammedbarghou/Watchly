import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { SettingsLayout } from '../components/settings/SettingsLayout';
import { AccountSettings } from '../components/settings/sections/AccountSettings';
import { NotificationSettings } from '../components/settings/sections/NotificationSettings';
import { PrivacySettings } from '../components/settings/sections/PrivacySettings';
import { HelpSupportSettings } from '../components/settings/sections/HelpSupportSettings';
import { LegalAboutSettings } from '../components/settings/sections/LegalAboutSettings';

const TABS = [
  { label: 'Account', value: 'account' },
  { label: 'Notifications', value: 'notifications' },
  { label: 'Privacy & Security', value: 'privacy' },
  { label: 'Help & Support', value: 'help' },
  { label: 'Legal & About', value: 'legal' }
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState(TABS[0].value);

  const renderContent = () => {
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
          <div className="p-4 text-center text-gray-400">
            This section is coming soon...
          </div>
        );
    }
  };

  return (
    <MainLayout>
      <SettingsLayout
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        {renderContent()}
      </SettingsLayout>
    </MainLayout>
  );
}