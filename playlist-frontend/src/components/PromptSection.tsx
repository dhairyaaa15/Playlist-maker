import React, { useState } from 'react';
import { Music, List, Globe, Loader, AlertCircle, X, Sparkles } from 'lucide-react';
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
      setError('Please enter a description for your playlist');
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

  const promptExamples = [
    "Upbeat songs for morning workout",
    "Relaxing indie music for studying",
    "90s rock classics for road trip",
    "Romantic songs for dinner date",
    "Energetic pop for party playlist"
  ];

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Create Your Playlist</h2>
          <p className="text-sm text-gray-400">Describe your perfect music collection</p>
        </div>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-red-400 leading-relaxed">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Prompt Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Playlist Description
          </label>
          <div className="relative">
            <Music className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your perfect playlist... (e.g., 'upbeat songs for morning workout', 'sad songs for rainy days')"
              className="w-full pl-10 pr-16 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none h-24 sm:h-32"
              disabled={loading}
              maxLength={500}
            />
            <div className="absolute bottom-2 right-3 text-xs text-gray-400 bg-slate-800/80 px-2 py-1 rounded">
              {prompt.length}/500
            </div>
          </div>
          
          {/* Quick Examples */}
          {!prompt && (
            <div className="space-y-2">
              <p className="text-xs text-gray-400">Quick examples:</p>
              <div className="flex flex-wrap gap-2">
                {promptExamples.map((example, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleExampleClick(example)}
                    className="px-3 py-1 text-xs bg-slate-700/50 hover:bg-slate-600/50 text-gray-300 hover:text-white border border-slate-600/50 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Settings Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Language Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Language
            </label>
            <div className="relative">
              <Globe className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                disabled={loading}
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Gujarati">Gujarati</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Song Count Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Number of Songs
            </label>
            <div className="relative">
              <List className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
              <select
                value={songCount}
                onChange={(e) => setSongCount(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                disabled={loading}
              >
                <option value={10}>10 Songs</option>
                <option value={20}>20 Songs</option>
                <option value={30}>30 Songs</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Generate Button */}
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span className="text-base font-semibold">Generating your playlist...</span>
            </>
          ) : (
            <>
              <Music className="w-5 h-5" />
              <span className="text-base font-semibold">Generate Playlist</span>
            </>
          )}
        </button>
      </form>

      {/* Tips Section */}
      {!loading && (
        <div className="mt-6 pt-6 border-t border-slate-700/50">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-blue-400 mb-1">Pro Tips</h4>
                <ul className="text-xs text-blue-300/80 space-y-1">
                  <li>• Be specific about mood, genre, or activity</li>
                  <li>• Mention time periods (80s, 90s, 2000s) for era-specific music</li>
                  <li>• Include energy level (chill, upbeat, energetic)</li>
                  <li>• Add context (workout, study, party, relaxation)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptSection;