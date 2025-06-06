import React from 'react';
import { User, LogOut, Music } from 'lucide-react';

interface HeaderProps {
  username: string;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ username, onLogout }) => {
  return (
    <header className="bg-surface py-4 shadow-md">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Music className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold text-text">Melody Maker</span>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <User className="text-background" />
            </div>
            <span className="text-text font-medium">{username}</span>
          </div>
          <button 
            onClick={onLogout} 
            className="flex items-center space-x-2 bg-primary text-background px-4 py-2 rounded-md hover:bg-secondary transition duration-300"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

