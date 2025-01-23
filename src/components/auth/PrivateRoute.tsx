import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/Store';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { currentUser, loading } = useAppSelector((state) => state.auth);

  if (loading) {
    return <>
    <div className="h-screen flex justify-center items-center bg-black">
      <div className="w-full gap-x-2 flex justify-center items-center">
        <div
          className="w-5 bg-[#d00000] h-5 rounded-full animate-bounce"
        ></div>
        <div
          className="w-5 h-5 bg-[#dc2f02] rounded-full animate-bounce"
        ></div>
        <div
          className="w-5 h-5 bg-[#e85d04] rounded-full animate-bounce"
        ></div>
      </div>
    </div>
    </>; 
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}