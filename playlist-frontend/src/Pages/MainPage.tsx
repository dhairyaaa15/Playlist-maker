import React, { useState } from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';
import PromptSection from '../components/PromptSection';
import GeneratedPlaylist from '../components/GeneratedPlaylist';
import { Playlist } from '../services/api';

interface MainPageProps {
  onLogout: () => void;
}

const MainPage: React.FC<MainPageProps> = ({ onLogout }) => {
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);

  const handleGeneratePlaylist = (playlist: Playlist) => {
    setCurrentPlaylist(playlist);
  };

  const handleSavePlaylist = (savedPlaylist: Playlist) => {
    console.log('Playlist saved:', savedPlaylist);
    // You can add additional logic here like updating a list of saved playlists
  };

  return (
    <Layout>
      <Header onLogout={onLogout} />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-primary mb-8 text-center">Your Music Dashboard</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PromptSection onGeneratePlaylist={handleGeneratePlaylist} />
          {currentPlaylist && (
            <GeneratedPlaylist 
              playlist={currentPlaylist} 
              onSave={handleSavePlaylist}
            />
          )}
        </div>
      </main>
    </Layout>
  );
};

export default MainPage;

