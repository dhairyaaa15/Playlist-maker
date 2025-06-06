import React, { useState, useEffect } from 'react';
import { Play, Save, Music, AlertCircle, CheckCircle, Loader, ExternalLink, RefreshCw } from 'lucide-react';
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
      console.log('Spotify status in GeneratedPlaylist:', response);
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
      console.log('Saving playlist:', playlist);
      const response = await playlistAPI.save(playlist);
      console.log('Save response:', response);
      
      if (response.success) {
        setSaved(true);
        setSavedPlaylistId(response.playlist?._id || null);
        console.log('Saved playlist ID:', response.playlist?._id);
        
        if (onSave && response.playlist) {
          onSave(response.playlist);
        }
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(response.message || 'Failed to save playlist');
      }
    } catch (err: any) {
      console.error('Save error:', err);
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
      console.log('Creating Spotify playlist with ID:', savedPlaylistId);
      const response = await spotifyAPI.createPlaylist(savedPlaylistId);
      console.log('Spotify creation response:', response);
      
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
      console.error('Spotify creation error:', err);
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
    <div className="bg-surface p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-primary">{playlist.name}</h2>
          <p className="text-textSecondary text-sm mt-1">{playlist.description}</p>
          <div className="flex items-center space-x-4 mt-2 text-xs text-textSecondary">
            <span>🎵 {playlist.songs.length} songs</span>
            <span>🌍 {playlist.language}</span>
            <span>🎭 {playlist.mood}</span>
            {playlist.aiProvider && <span>🤖 {playlist.aiProvider}</span>}
          </div>
        </div>
        
        {/* Debug info */}
        <div className="text-xs text-textSecondary">
          <div>Spotify: {isSpotifyConnected ? '✅' : '❌'}</div>
          <div>Saved: {savedPlaylistId ? '✅' : '❌'}</div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-md flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-400 text-sm">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            ✕
          </button>
        </div>
      )}

      {/* Success Messages */}
      {saved && (
        <div className="mb-4 p-3 bg-green-500 bg-opacity-20 border border-green-500 rounded-md flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="text-green-400 text-sm">Playlist saved successfully!</span>
        </div>
      )}

      {spotifyPlaylistCreated && spotifyResult && (
        <div className="mb-4 p-3 bg-green-500 bg-opacity-20 border border-green-500 rounded-md">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-400 text-sm font-semibold">Playlist created on Spotify!</span>
          </div>
          <div className="text-xs text-green-300">
            <div>Playlist: {spotifyResult.name}</div>
            {spotifyResult.external_urls?.spotify && (
              <a 
                href={spotifyResult.external_urls.spotify} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 underline flex items-center space-x-1"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Open in Spotify</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Songs List */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2 mb-6">
        {playlist.songs.map((song, index) => (
          <div key={song.id} className="flex items-center justify-between bg-inputBg p-4 rounded-md hover:bg-surface transition duration-300 border border-inputBorder">
            <div className="flex items-center space-x-3 flex-1">
              <span className="text-accent font-semibold text-sm w-6">{index + 1}</span>
              
              {song.image && (
                <img
                  src={song.image}
                  alt={`${song.name} album cover`}
                  className="w-12 h-12 rounded object-cover"
                />
              )}
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-text truncate">{song.name}</h3>
                <p className="text-sm text-textSecondary truncate">{song.artist}</p>
                <div className="flex items-center space-x-2 text-xs text-textSecondary mt-1">
                  <span>{song.album}</span>
                  <span>•</span>
                  <span>{song.duration}</span>
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
                    className="p-2 bg-primary rounded-full hover:bg-secondary transition duration-300 transform hover:scale-110"
                    title="Play Preview"
                  >
                    <Play size={16} className="text-background" />
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
      <div className="space-y-3">
        {/* Save Button */}
        <div className="flex space-x-3">
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className="flex-1 bg-primary text-background py-3 rounded-md hover:bg-secondary transition duration-300 flex items-center justify-center space-x-2 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {saving ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span className="text-lg font-semibold">Saving...</span>
              </>
            ) : saved ? (
              <>
                <CheckCircle size={20} />
                <span className="text-lg font-semibold">Saved!</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span className="text-lg font-semibold">Save Playlist</span>
              </>
            )}
          </button>

          {/* Refresh Spotify Status */}
          <button
            onClick={checkSpotifyStatus}
            className="px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-300"
            title="Refresh Spotify Status"
          >
            <RefreshCw size={20} />
          </button>
        </div>

        {/* Spotify Integration */}
        <div className="flex space-x-3">
          {isSpotifyConnected ? (
            <button
              onClick={handleCreateSpotifyPlaylist}
              disabled={creatingSpotifyPlaylist || !savedPlaylistId || spotifyPlaylistCreated}
              className="flex-1 bg-green-500 text-white py-3 rounded-md hover:bg-green-600 transition duration-300 flex items-center justify-center space-x-2 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {creatingSpotifyPlaylist ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span className="text-lg font-semibold">Creating on Spotify...</span>
                </>
              ) : spotifyPlaylistCreated ? (
                <>
                  <CheckCircle size={20} />
                  <span className="text-lg font-semibold">Created on Spotify!</span>
                </>
              ) : !savedPlaylistId ? (
                <>
                  <Save size={20} />
                  <span className="text-lg font-semibold">Save First, Then Create on Spotify</span>
                </>
              ) : (
                <>
                  <ExternalLink size={20} />
                  <span className="text-lg font-semibold">Create on Spotify</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex-1 bg-gray-500 text-white py-3 rounded-md flex items-center justify-center space-x-2 opacity-50">
              <Music size={20} />
              <span className="text-lg font-semibold">Connect Spotify First</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneratedPlaylist;

