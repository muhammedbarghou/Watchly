import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/Store';

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const currentUser = useAppSelector(state => state.auth.currentUser);

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}