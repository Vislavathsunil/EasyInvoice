import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FileText } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen  flex flex-col items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4 animate-pulse">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <FileText className="w-8 h-8 animate-spin" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Restoring session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
