import React, { useState } from 'react';
import { Music, List, Globe } from 'lucide-react';

interface PromptSectionProps {
  onGeneratePlaylist: (prompt: string, language: string, songCount: number) => void;
}

const PromptSection: React.FC<PromptSectionProps> = ({ onGeneratePlaylist }) => {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('English');
  const [songCount, setSongCount] = useState(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGeneratePlaylist(prompt, language, songCount);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-lg shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-primary mb-4">Create Your Playlist</h2>
      <div className="relative">
        <Music className="absolute top-3 left-3 text-accent" />
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your perfect playlist..."
          className="w-full pl-10 pr-3 py-2 bg-inputBg border border-inputBorder rounded-md focus:outline-none focus:border-primary resize-none h-32 text-inputText placeholder-inputPlaceholder"
        />
      </div>
      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <Globe className="absolute top-3 left-3 text-accent" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-inputBg border border-inputBorder rounded-md focus:outline-none focus:border-primary appearance-none text-inputText"
          >
            <option>English</option>
            <option>Hindi</option>
            <option>Gujarati</option>
          </select>
        </div>
        <div className="flex-1 relative">
          <List className="absolute top-3 left-3 text-accent" />
          <select
            value={songCount}
            onChange={(e) => setSongCount(Number(e.target.value))}
            className="w-full pl-10 pr-3 py-2 bg-inputBg border border-inputBorder rounded-md focus:outline-none focus:border-primary appearance-none text-inputText"
          >
            <option>10</option>
            <option>20</option>
            <option>30</option>
          </select>
        </div>
      </div>
      <button
        type="submit"
        className="w-full bg-primary text-background py-3 rounded-md hover:bg-secondary transition duration-300 flex items-center justify-center space-x-2 transform hover:scale-105"
      >
        <Music size={20} />
        <span className="text-lg font-semibold">Generate Playlist</span>
      </button>
    </form>
  );
};

export default PromptSection;

