import React from 'react';
import { User, LogOut, Music } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  return (
    <header className="lg:mt-5 py-4 lg:w-[80%] mx-auto lg:rounded-3xl md:rounded-none backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="hidden md:flex items-center space-x-4">
          <div className="p-2 rounded-full backdrop-blur-sm bg-white/10 border border-white/20">
            <Music className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white drop-shadow-lg">Melody Maker</span>
        </div>
        <div className="flex items-center justify-between w-full md:w-auto md:space-x-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 backdrop-blur-sm bg-white/20 border border-white/30 rounded-full flex items-center justify-center shadow-lg">
              <User className="text-white w-5 h-5" />
            </div>
            <span className="text-white font-medium drop-shadow-md">{"Welcome,"+" "+user?.username || "User"}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 backdrop-blur-sm bg-white/20 hover:bg-white/30 border border-white/30 text-white px-4 py-2 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 md:space-x-2"
          >
            <LogOut size={18} />
            <span className="hidden md:inline font-medium">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;