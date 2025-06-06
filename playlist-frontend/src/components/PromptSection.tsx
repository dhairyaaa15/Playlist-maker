import React, { useState } from 'react';
import { Music, List, Globe, Loader, AlertCircle } from 'lucide-react';
import { playlistAPI, Playlist } from '../services/api';

interface PromptSectionProps {
  onGeneratePlaylist: (playlist: Playlist) => void;
}

const PromptSection: React.FC<PromptSectionProps> = ({ onGeneratePlaylist }) => {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('English');
  const [songCount, setSongCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Please enter a prompt for your playlist');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await playlistAPI.generate(prompt, language, songCount);
      
      if (response.success && response.playlist) {
        onGeneratePlaylist(response.playlist);
      } else {
        setError(response.message || 'Failed to generate playlist');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate playlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface p-6 rounded-lg shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-primary mb-4">Create Your Playlist</h2>
      
      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-md flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <Music className="absolute top-3 left-3 text-accent" />
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your perfect playlist... (e.g., 'upbeat songs for morning workout', 'sad songs for rainy days')"
            className="w-full pl-10 pr-3 py-2 bg-inputBg border border-inputBorder rounded-md focus:outline-none focus:border-primary resize-none h-32 text-inputText placeholder-inputPlaceholder"
            disabled={loading}
            maxLength={500}
          />
          <div className="absolute bottom-2 right-2 text-xs text-textSecondary">
            {prompt.length}/500
          </div>
        </div>
        
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Globe className="absolute top-3 left-3 text-accent" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-inputBg border border-inputBorder rounded-md focus:outline-none focus:border-primary appearance-none text-inputText"
              disabled={loading}
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Gujarati">Gujarati</option>
            </select>
          </div>
          <div className="flex-1 relative">
            <List className="absolute top-3 left-3 text-accent" />
            <select
              value={songCount}
              onChange={(e) => setSongCount(Number(e.target.value))}
              className="w-full pl-10 pr-3 py-2 bg-inputBg border border-inputBorder rounded-md focus:outline-none focus:border-primary appearance-none text-inputText"
              disabled={loading}
            >
              <option value={10}>10 Songs</option>
              <option value={20}>20 Songs</option>
              <option value={30}>30 Songs</option>
            </select>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="w-full bg-primary text-background py-3 rounded-md hover:bg-secondary transition duration-300 flex items-center justify-center space-x-2 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span className="text-lg font-semibold">Generating...</span>
            </>
          ) : (
            <>
              <Music size={20} />
              <span className="text-lg font-semibold">Generate Playlist</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default PromptSection;

