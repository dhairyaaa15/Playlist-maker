import React, { useState } from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';
import PromptSection from '../components/Promptsection';
import GeneratedPlaylist from '../components/GeneratedPlaylist';

interface MainPageProps {
  onLogout: () => void;
}

const MainPage: React.FC<MainPageProps> = ({ onLogout }) => {
  const [showGeneratedPlaylist, setShowGeneratedPlaylist] = useState(false);
  const [songs, setSongs] = useState<Array<{ id: string; name: string; artist: string; previewUrl: string }>>([]);

  const handleGeneratePlaylist = (prompt: string, language: string, songCount: number) => {
    const mockSongs = Array.from({ length: songCount }, (_, i) => ({
      id: `${i + 1}`,
      name: `${language} Song ${i + 1}`,
      artist: `Artist ${i + 1}`,
      previewUrl: '#'
    }));
    setSongs(mockSongs);
    setShowGeneratedPlaylist(true);
  };

  return (
    <Layout>
      <Header username="John Doe" onLogout={onLogout} />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-primary mb-8 text-center">Your Music Dashboard</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PromptSection onGeneratePlaylist={handleGeneratePlaylist} />
          {showGeneratedPlaylist && <GeneratedPlaylist songs={songs} />}
        </div>
      </main>
    </Layout>
  );
};

export default MainPage;

