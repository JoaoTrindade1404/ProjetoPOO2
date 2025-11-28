import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionManager, useIdleDetection } from '@/hooks/useSessionManager';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  useSessionManager();
  useIdleDetection(30);

  useEffect(() => {
    if (!loading && !user) {
      console.log('🔒 ProtectedRoute - User not authenticated, redirecting to login');
      console.log('📍 ProtectedRoute - Attempted to access:', location.pathname);
    }
  }, [user, loading, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
