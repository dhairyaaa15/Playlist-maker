import React, { useState } from 'react';
import SignupLoginPage from './Pages/SignupLoginPage';
import MainPage from './Pages/MainPage';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'login' | 'main'>('login');

  return (
    <>
      {currentPage === 'login' && <SignupLoginPage onLogin={() => setCurrentPage('main')} />}
      {currentPage === 'main' && <MainPage onLogout={() => setCurrentPage('login')} />}
    </>
  );
};

export default App;

