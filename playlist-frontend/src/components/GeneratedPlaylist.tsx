import React, { useState } from 'react';
import { Play, Save, Music, Download, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { Playlist, playlistAPI } from '../services/api';

interface GeneratedPlaylistProps {
  playlist: Playlist;
  onSave?: (playlist: Playlist) => void;
}

const GeneratedPlaylist: React.FC<GeneratedPlaylistProps> = ({ playlist, onSave }) => {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await playlistAPI.save(playlist);
      
      if (response.success) {
        setSaved(true);
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

  const playPreview = (previewUrl: string | null, songId: string) => {
    if (!previewUrl) return;

    if (playingAudio === songId) {
      // Stop current audio
      const audio = document.getElementById(`audio-${songId}`) as HTMLAudioElement;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      setPlayingAudio(null);
    } else {
      // Stop any currently playing audio
      if (playingAudio) {
        const currentAudio = document.getElementById(`audio-${playingAudio}`) as HTMLAudioElement;
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }
      }

      // Play new audio
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
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-md flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      {/* Success Message */}
      {saved && (
        <div className="mb-4 p-3 bg-green-500 bg-opacity-20 border border-green-500 rounded-md flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="text-green-400 text-sm">Playlist saved successfully!</span>
        </div>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
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

      <div className="mt-6 flex space-x-3">
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
        
        <button
          className="flex-1 bg-accent text-background py-3 rounded-md hover:bg-text transition duration-300 flex items-center justify-center space-x-2 transform hover:scale-105"
          title="Add to Spotify (Coming Soon)"
          disabled
        >
          <Music size={20} />
          <span className="text-lg font-semibold">Add to Spotify</span>
        </button>
      </div>
    </div>
  );
};

export default GeneratedPlaylist;

