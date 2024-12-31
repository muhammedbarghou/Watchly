import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../firebase';
import { Mail } from 'lucide-react';
import { ThemeToggle } from '../theme/ThemeToggle';

export const AuthForm = () => {
  const [formData, setFormData] = useState({
    email: localStorage.getItem('email') || '',
    password: localStorage.getItem('password') || '',
  });
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      if (stayLoggedIn) {
        localStorage.setItem('email', formData.email);
        localStorage.setItem('password', formData.password);
      } else {
        localStorage.removeItem('email');
        localStorage.removeItem('password');
      }
      navigate('/home');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/home');
    } catch (error) {
      console.error('Google Login Error:', error);
    }
  };

  return (
    <div className="flex flex-col items-center h-screen justify-center px-4 py-10 bg-gray-50 dark:bg-gray-950">
      <div className="xl:w-full xl:max-w-sm 2xl:max-w-md xl:mx-auto">
        <h2 className="text-3xl font-bold leading-tight text-black sm:text-4xl dark:text-white">
          Sign in to Start
        </h2>
        <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
          Don't have an account?{' '}
          <a
            href="/signmethode"
            className="text-[#D00000] hover:underline hover:text-[#6A040F] focus:text-[#6A040F]"
          >
            Sign up
          </a>
        </p>

        <form className="mt-8" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label className="text-base font-medium text-gray-900 dark:text-white">
                Email address
              </label>
              <div className="mt-2.5">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email to get started"
                  className="block w-full p-4 text-black placeholder-gray-500 transition-all duration-200 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:border-[#d00000] focus:bg-white dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-base font-medium text-gray-900 dark:text-white">
                  Password
                </label>
                <a
                  href="/Forgetpassword"
                  className="text-sm text-[#D00000] hover:underline hover:text-[#6A040F] focus:text-[#6A040F]"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="mt-2.5">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="block w-full p-4 text-black placeholder-gray-500 transition-all duration-200 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:border-[#d00000] focus:bg-white dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-red-500"
                />
              </div>

              <div className="flex items-center p-2">
                <input
                  type="checkbox"
                  checked={stayLoggedIn}
                  onChange={() => setStayLoggedIn(!stayLoggedIn)}
                  className={"rounded transition ease-in duration-200 bg-red-800 w-5 h-5"}
                />
                <span className="ml-2 text-gray-900 dark:text-white">Stay Logged In</span>
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center w-full px-4 py-4 text-base font-semibold text-white transition-all duration-200 bg-[#D00000] border border-transparent rounded-md focus:outline-none hover:bg-[#6A040F] focus:bg-[#6A040F]"
            >
              Log in
            </button>

            {error && <p className="text-red-500 mt-4">{error}</p>}
          </div>
        </form>

        <div className="mt-3 space-y-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="relative inline-flex items-center justify-center w-full px-4 py-4 text-base font-semibold text-gray-700 transition-all duration-200 bg-white border-2 border-gray-200 rounded-md hover:bg-gray-100 focus:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <div className="absolute inset-y-0 left-0 p-4">
              <Mail className="w-6 h-6 text-[#D00000]" />
            </div>
            <span>Continue with Google</span>
          </button>

          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};
