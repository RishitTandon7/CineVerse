import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './auth/AuthModal';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setShowAuthModal(true);
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        {fallback || (
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
            <div className="text-center text-white">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <span className="text-4xl">🎬</span>
              </div>
              <h2 className="text-3xl font-black mb-4">Sign in to Continue</h2>
              <p className="text-blue-200 mb-8 text-lg">Create an account or sign in to start watching movies together</p>
            </div>
          </div>
        )}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode="signin"
        />
      </>
    );
  }

  return <>{children}</>;
}