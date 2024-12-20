import { useState } from 'react'

function Notifications() {
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(false);

    const handleSave = () => {
        const settings = {
            emailNotifications,
            pushNotifications,
        };

        console.log("Notification settings updated:", settings);
        alert("Notification settings updated successfully!");
    };

    return (
        <div className="bg-white dark:bg-gray-900 w-full min-h-auto text-gray-900 dark:text-gray-100">
            <h2 className="text-2xl font-semibold mb-6">Notification Settings</h2>
            
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between border-b pb-4">
                    <label htmlFor="emailNotifications" className="text-lg font-medium">
                        Friends Requists
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            id="emailNotifications"
                            type="checkbox"
                            checked={emailNotifications}
                            onChange={() => setEmailNotifications(!emailNotifications)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 dark:peer-focus:ring-red-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-[#D00000] after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:bg-gray-600 dark:peer-checked:bg-red-600"></div>
                    </label>
                </div>

                {/* Push Notifications */}
                <div className="flex items-center justify-between border-b pb-4">
                    <label htmlFor="pushNotifications" className="text-lg font-medium">
                        Push Notifications
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            id="pushNotifications"
                            type="checkbox"
                            checked={pushNotifications}
                            onChange={() => setPushNotifications(!pushNotifications)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 dark:peer-focus:ring-red-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-[#D00000] after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:bg-gray-600 dark:peer-checked:bg-red-600"></div>
                    </label>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    className="mt-4 w-24 self-start text-white bg-[#D00000] hover:bg-[#370617] transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                >
                    Save
                </button>
            </div>
        </div>
    );
}

export default Notifications
