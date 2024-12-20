import { useState } from 'react';
import { auth } from '../../../firebase';
import { updateEmail, updatePassword } from 'firebase/auth';

function Security() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            alert('Please enter a new email.');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        const user = auth.currentUser;

        try {
            // Update email
            if (user && email !== user.email) {
                await updateEmail(user, email);
            }

            // Update password
            if (password) {
                await updatePassword(user, password);
            }

            alert('Security settings updated successfully!');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Error updating security settings:', error);
            alert(`Error: ${error.message}`);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 w-full min-h-auto text-gray-900 dark:text-gray-100">
            <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
                {/* Email Settings Section */}
                <div className="border-b pb-4">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Email Settings</h3>

                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Current Email
                            </label>
                            <input
                                type="email"
                                value={auth.currentUser?.email || ''}
                                disabled
                                className="w-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Update Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                placeholder="Enter new email"
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md p-2 text-gray-900 dark:text-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Password Settings Section */}
                <div className="border-b pb-4">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Password Settings</h3>

                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                placeholder="Enter new password"
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md p-2 text-gray-900 dark:text-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                placeholder="Repeat new password"
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md p-2 text-gray-900 dark:text-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <button
                    type="submit"
                    className="self-start bg-[#d00000] hover:bg-[#e60000] text-white font-medium rounded-md px-5 py-2 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-300 dark:focus:ring-emerald-700"
                >
                    Save
                </button>
            </form>
        </div>
    );
}

export default Security;
