import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SignupLoginPage from './Pages/SignupLoginPage';
import MainPage from './Pages/MainPage';
import { Loader } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<'login' | 'main'>('login');

  useEffect(() => {
    if (isAuthenticated) {
      setCurrentPage('main');
    } else {
      setCurrentPage('login');
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-text">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentPage === 'login' && <SignupLoginPage onLogin={() => setCurrentPage('main')} />}
      {currentPage === 'main' && <MainPage onLogout={() => setCurrentPage('login')} />}
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;

