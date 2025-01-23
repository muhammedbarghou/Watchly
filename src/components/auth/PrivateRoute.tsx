import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/Store';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { currentUser, loading } = useAppSelector((state) => state.auth);

  if (loading) {
    return <div>Loading...</div>; 
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}