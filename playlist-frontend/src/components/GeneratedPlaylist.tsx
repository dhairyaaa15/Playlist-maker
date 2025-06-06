import React, { useState, useEffect } from 'react';
import { Play, Save, Music, AlertCircle, CheckCircle, Loader, ExternalLink, RefreshCw, X } from 'lucide-react';
import { Playlist, playlistAPI, spotifyAPI } from '../services/api';

interface GeneratedPlaylistProps {
  playlist: Playlist;
  onSave?: (playlist: Playlist) => void;
}

const GeneratedPlaylist: React.FC<GeneratedPlaylistProps> = ({ playlist, onSave }) => {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [creatingSpotifyPlaylist, setCreatingSpotifyPlaylist] = useState(false);
  const [spotifyPlaylistCreated, setSpotifyPlaylistCreated] = useState(false);
  const [savedPlaylistId, setSavedPlaylistId] = useState<string | null>(null);
  const [spotifyResult, setSpotifyResult] = useState<any>(null);

  useEffect(() => {
    checkSpotifyStatus();
  }, []);

  const checkSpotifyStatus = async () => {
    try {
      const response = await spotifyAPI.getStatus();
      setIsSpotifyConnected(response.isConnected);
    } catch (error) {
      console.error('Error checking Spotify status:', error);
      setIsSpotifyConnected(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await playlistAPI.save(playlist);
      
      if (response.success) {
        setSaved(true);
        setSavedPlaylistId(response.playlist?._id || null);
        
        if (onSave && response.playlist) {
          onSave(response.playlist);
        }
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(response.message || 'Failed to save playlist');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save playlist');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSpotifyPlaylist = async () => {
    if (!isSpotifyConnected) {
      setError('Please connect to Spotify first');
      return;
    }

    if (!savedPlaylistId) {
      setError('Please save the playlist first before creating it on Spotify');
      return;
    }

    setCreatingSpotifyPlaylist(true);
    setError(null);

    try {
      const response = await spotifyAPI.createPlaylist(savedPlaylistId);
      
      if (response.success) {
        setSpotifyPlaylistCreated(true);
        setSpotifyResult(response.spotifyPlaylist);
        setTimeout(() => setSpotifyPlaylistCreated(false), 10000);
      } else {
        if (response.requiresReauth) {
          setError('Spotify connection expired. Please reconnect to Spotify.');
          setIsSpotifyConnected(false);
        } else if (response.requiresRetry) {
          setError('Spotify token refreshed. Please try again.');
        } else {
          setError(response.message || 'Failed to create Spotify playlist');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create Spotify playlist');
    } finally {
      setCreatingSpotifyPlaylist(false);
    }
  };

  const playPreview = (previewUrl: string | null, songId: string) => {
    if (!previewUrl) return;

    if (playingAudio === songId) {
      const audio = document.getElementById(`audio-${songId}`) as HTMLAudioElement;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      setPlayingAudio(null);
    } else {
      if (playingAudio) {
        const currentAudio = document.getElementById(`audio-${playingAudio}`) as HTMLAudioElement;
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }
      }

      const audio = document.getElementById(`audio-${songId}`) as HTMLAudioElement;
      if (audio) {
        audio.play();
        setPlayingAudio(songId);
        
        audio.onended = () => setPlayingAudio(null);
        audio.onerror = () => setPlayingAudio(null);
      }
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
          <Music className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-white truncate">{playlist.name}</h2>
          <p className="text-sm text-gray-400 truncate">{playlist.description}</p>
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
            <span>🎵 {playlist.songs.length} songs</span>
            <span>🌍 {playlist.language}</span>
            {playlist.mood && <span>🎭 {playlist.mood}</span>}
            {playlist.aiProvider && <span>🤖 {playlist.aiProvider}</span>}
          </div>
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

      {/* Success Messages */}
      {saved && (
        <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-green-400 leading-relaxed">Playlist saved successfully!</p>
            </div>
          </div>
        </div>
      )}

      {spotifyPlaylistCreated && spotifyResult && (
        <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-green-400 mb-1">Playlist created on Spotify!</h4>
              <p className="text-xs text-green-300/80">{spotifyResult.name}</p>
              {spotifyResult.external_urls?.spotify && (
                <a 
                  href={spotifyResult.external_urls.spotify} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-300 hover:text-green-200 text-xs flex items-center space-x-1 mt-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open in Spotify</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Songs List */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2 mb-6">
        {playlist.songs.map((song, index) => (
          <div key={song.id} className="flex items-center justify-between bg-slate-700/50 p-4 rounded-lg hover:bg-slate-600/50 transition duration-200 border border-slate-600/50">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <span className="text-blue-400 font-semibold text-sm w-6">{index + 1}</span>
              
              {song.image && (
                <img
                  src={song.image}
                  alt={`${song.name} album cover`}
                  className="w-10 h-10 rounded object-cover flex-shrink-0"
                />
              )}
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white truncate">{song.name}</h3>
                <p className="text-sm text-gray-300 truncate">{song.artist}</p>
                <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                  {song.album && <span className="truncate">{song.album}</span>}
                  {song.album && song.duration && <span>•</span>}
                  {song.duration && <span>{song.duration}</span>}
                  {song.mood && (
                    <>
                      <span>•</span>
                      <span>{song.mood}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2 ml-4">
              {song.previewUrl && (
                <>
                  <button
                    onClick={() => playPreview(song.previewUrl, song.id)}
                    className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:from-blue-700 hover:to-purple-700 transition duration-200 transform hover:scale-110"
                    title="Play Preview"
                  >
                    <Play size={16} className="text-white" />
                  </button>
                  <audio
                    id={`audio-${song.id}`}
                    src={song.previewUrl}
                    preload="none"
                  />
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        {/* Save Button */}
        <div className="flex space-x-3">
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
          >
            {saving ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span className="text-base font-semibold">Saving...</span>
              </>
            ) : saved ? (
              <>
                <CheckCircle className="w-5 h-5" />
                <span className="text-base font-semibold">Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span className="text-base font-semibold">Save Playlist</span>
              </>
            )}
          </button>

          {/* Refresh Spotify Status */}
          <button
            onClick={checkSpotifyStatus}
            className="px-4 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg transition duration-200 border border-slate-600/50 flex items-center justify-center"
            title="Refresh Spotify Status"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Spotify Integration */}
        <div className="flex space-x-3">
          {isSpotifyConnected ? (
            <button
              onClick={handleCreateSpotifyPlaylist}
              disabled={creatingSpotifyPlaylist || !savedPlaylistId || spotifyPlaylistCreated}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              {creatingSpotifyPlaylist ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span className="text-base font-semibold">Creating on Spotify...</span>
                </>
              ) : spotifyPlaylistCreated ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-base font-semibold">Created on Spotify!</span>
                </>
              ) : !savedPlaylistId ? (
                <>
                  <Save className="w-5 h-5" />
                  <span className="text-base font-semibold">Save First, Then Save it on Spotify</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-5 h-5" />
                  <span className="text-base font-semibold">Save it on Spotify</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex-1 bg-slate-700/50 text-gray-400 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 border border-slate-600/50">
              <Music className="w-5 h-5" />
              <span className="text-base font-semibold">Connect Spotify First</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneratedPlaylist;