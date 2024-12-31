import React, { useState } from 'react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { ThemeToggle } from '../components/theme/ThemeToggle';
import * as Dialog from "@radix-ui/react-dialog";



const ResetPassword = () => {
const [email, setEmail] = useState('');
const [message, setMessage] = useState('');
const [error, setError] = useState('');

const handleResetPassword = async () => {
    const auth = getAuth();

    try {
    await sendPasswordResetEmail(auth, email);
    setMessage('Password reset email sent! Please check your inbox.');
    setError('');
    } catch (err) {
    setError(err.message);
    setMessage('');
    }
  };

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center bg-gray-300 dark:bg-gray-950">
        <main className='w-auto h-auto flex flex-col bg-gray-200 p-8 rounded-lg shadow-lg dark:bg-gray-900'>
                <div className='flex justify-between items-center pb-4'>
                    <h1 className='text-2xl font-bold'>Reset Password</h1>
                    <ThemeToggle />
                </div >
                <p  className="text-gray-600 dark:text-gray-300 py-3">Please enter your email address to receive a link to reset your password.</p>
                <div class="max-w-sm space-y-3 ">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-red-500 focus:ring-red-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600" placeholder="Enter your email"/>
                </div>
                <div className=''>
                    <button type="button" onClick={handleResetPassword} className="py-3 px-4 w-auto mt-5 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-[#d00000]  text-white hover:bg-red-600 focus:outline-none focus:bg-red-600 disabled:opacity-50 disabled:pointer-events-none">
                        Send Reset Link
                    </button>
                </div>
                {message && 
                <Dialog.Root open={!!message} onOpenChange={() => setMessage('')}>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 w-full h-full bg-black opacity-50" />
                        <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] px-4 w-full max-w-lg">
                        <div class="relative p-4 w-full max-w-md h-full md:h-auto">
                            <div class="relative p-4 text-center bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
                                <div class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 p-2 flex items-center justify-center mx-auto mb-3.5">
                                    <svg aria-hidden="true" class="w-8 h-8 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                    <span class="sr-only">Success</span>
                                </div>
                                <p class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Successfully reset password.</p>
                                <Dialog.Close asChild>
                                <button data-modal-toggle="successModal" type="button" class="py-2 px-3 text-sm font-medium text-center text-white rounded-lg bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 dark:focus:ring-primary-900">
                                    Continue
                                </button>
                                </Dialog.Close>
                            </div>
                        </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>
                }
                {error && 
                <Dialog.Root open={!!error} onOpenChange={() => setError(null)}>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 w-full h-full bg-black opacity-50" />
                        <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] px-4 w-full max-w-lg">
                        <div class="relative p-4 w-full max-w-md h-full md:h-auto">
                            <div class="relative p-4 text-center bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
                                    <p class="mb-4 text-gray-500 dark:text-gray-300">Please confirm that you want to reset your password.</p>
                                        <div class="flex justify-center items-center space-x-4">
                                            <Dialog.Close asChild>
                                            <button  type="submit" class="py-2 px-3 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-900">
                                                Yes, I'm sure
                                            </button>
                                        </Dialog.Close>
                                        </div>
                            </div>
                        </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>
                }
        </main>
    </div>
  );
};

export default ResetPassword;
