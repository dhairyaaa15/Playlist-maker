import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-text flex flex-col">
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-primary opacity-5 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-secondary opacity-5 rounded-full filter blur-3xl"></div>
      </div>
      <div className="flex-grow z-10">{children}</div>
    </div>
  );
};

export default Layout;

