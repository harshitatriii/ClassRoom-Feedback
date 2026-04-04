import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute() {
  const { user, loading, msRedirectPath, setMsRedirectPath } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  // If Microsoft login needs to redirect to profile
  if (msRedirectPath) {
    const path = msRedirectPath;
    setMsRedirectPath(null);
    return <Navigate to={path} replace />;
  }

  return <Outlet />;
}
