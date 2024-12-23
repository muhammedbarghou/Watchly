import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import PersonalInformations from './Settings/PersonalInformations';
import Security from './Settings/Security';
import Notifications from './Settings/Notifications';
import Privacy from './Settings/Privacy';

function Settings() {
    return (
        <div className="h-auto flex bg-gray-100 dark:bg-gray-950">
            <Tabs.Root defaultValue="personal" className="flex h-full w-full">
                <Tabs.List className="flex flex-col w-48 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">                    
                    {[
                        { value: "personal", label: "Personal Info" },
                        { value: "security", label: "Security" },
                        { value: "notifications", label: "Notifications" },
                        { value: "privacy", label: "Privacy" },
                    ].map((item) => (
                        <Tabs.Trigger
                            key={item.value}
                            value={item.value}
                            className="flex items-center px-4 py-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 data-[state=active]:bg-[#D00000] data-[state=active]:text-white transition duration-200 ease-in-out"
                        >
                            {item.label}
                        </Tabs.Trigger>
                    ))}
                </Tabs.List>
                <div className="flex-1 overflow-auto bg-white dark:bg-gray-900 p-6">
                    <Tabs.Content value="personal">
                        <PersonalInformations />
                    </Tabs.Content>
                    <Tabs.Content value="security">
                        <Security />
                    </Tabs.Content>
                    <Tabs.Content value="notifications">
                        <Notifications />
                    </Tabs.Content>
                    <Tabs.Content value="privacy">
                        <Privacy />
                    </Tabs.Content>
                </div>
            </Tabs.Root>
        </div>
    );
}

export default Settings;

