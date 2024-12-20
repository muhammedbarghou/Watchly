import React, { useState } from 'react'
import loglight from '../Imgs/Logo2.png'
import logodark from '../Imgs/logo.png'
import { Mail, Youtube, Facebook } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/theme/ThemeToggle';
import {googleProvider, } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';


function SignMethode() {
    const navigate = useNavigate();
    const [currentLogo, setCurrentLogo] = useState(loglight); 

    const handleClick = () => {
        navigate("/signup");
    }

    const handleThemeChange = (newTheme) => {
        setCurrentLogo(newTheme === 'dark' ? logodark : loglight);
    };
    const db = getFirestore();

    const handleGoogleSignUp = async () => {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
    
        if (!userDoc.exists()) {
            await setDoc(userRef, {
              name: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              phoneNumber: '',
              DateOfBirth: '',
              createdAt: new Date(),
            });
          }
    
        navigate('/home');
      } catch (error) {
        console.error('Google Sign-Up Error:', error);
      }
    };

    return (
        <div>
            <main className="w-full h-screen flex flex-col items-center justify-center px-4">
                <div className="max-w-sm w-full text-gray-600 space-y-8">
                    <div className="text-center">
                        <img src={currentLogo} width={150} className="mx-auto" />
                        <div className="mt-5 space-y-2">
                            <h3 className="text-gray-800 text-2xl font-bold sm:text-3xl dark:text-white">Create an account</h3>
                            <p className="dark:text-gray-300">Already have an account? <a href="/login" className="font-medium text-[#D00000]">log in</a></p>
                        </div>
                    </div>
                    <div className="space-y-4 text-sm font-medium">
                        <button onClick={handleClick} className="w-full flex items-center justify-center gap-x-3 py-2.5 border rounded-lg hover:bg-gray-50 duration-150 active:bg-gray-100 dark:text-white dark:hover:text-black">
                            <Mail className="w-5 h-5" />
                            Continue Using Your Email
                        </button>
                        <button onClick={handleGoogleSignUp} className="w-full flex items-center justify-center gap-x-3 py-2.5 border rounded-lg hover:bg-gray-50 duration-150 active:bg-gray-100 dark:text-white dark:hover:text-black">
                            <Youtube className="w-5 h-5" />
                            Continue with Google
                        </button>
                        <button className="w-full flex items-center justify-center gap-x-3 py-2.5 border rounded-lg hover:bg-gray-50 duration-150 active:bg-gray-100 dark:text-white dark:hover:text-black">
                            <Facebook className="w-5 h-5" />
                            Continue with Facebook
                        </button>
                    </div>
                    <div>
                        <ThemeToggle onThemeChange={handleThemeChange} />
                    </div>
                </div>
            </main>
        </div>
    )
}

export default SignMethode