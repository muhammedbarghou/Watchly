import React from 'react';
import { AuthForm } from '../components/auth/AuthForm.jsx';
import { AuthFeatures } from '../components/auth/AuthFeatures.jsx';


function Login  ()  {
  return (
    <section className="w-screen h-screen dark:bg-gray-950">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <AuthForm />
        <div className="relative flex items-end justify-center min-h-screen overflow-hidden bg-gray-50 py-12 px-4 sm:py-6 lg:py-8">
          <div className="absolute inset-0">
            <img
              className="object-cover w-full h-full "
              src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80"
              alt="Theater background"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
          <AuthFeatures />
        </div>
      </div>
    </section>
  );
};

export default Login;