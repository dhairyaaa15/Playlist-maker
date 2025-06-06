import React from 'react';
import { Play, Check, Plus } from 'lucide-react';

interface Song {
  id: string;
  name: string;
  artist: string;
  previewUrl: string;
}

interface GeneratedPlaylistProps {
  songs: Song[];
}

const GeneratedPlaylist: React.FC<GeneratedPlaylistProps> = ({ songs }) => {
  return (
    <div className="bg-surface p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-primary">Your Generated Playlist</h2>
      <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {songs.map((song) => (
          <li key={song.id} className="flex items-center justify-between bg-inputBg p-4 rounded-md hover:bg-surface transition duration-300 border border-inputBorder">
            <div>
              <h3 className="font-semibold text-text">{song.name}</h3>
              <p className="text-sm text-textSecondary">{song.artist}</p>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 bg-primary rounded-full hover:bg-secondary transition duration-300 transform hover:scale-110">
                <Play size={16} className="text-background" />
              </button>
              <button className="p-2 bg-accent rounded-full hover:bg-text transition duration-300 transform hover:scale-110">
                <Check size={16} className="text-background" />
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button className="mt-6 w-full bg-primary text-background py-3 rounded-md hover:bg-secondary transition duration-300 flex items-center justify-center space-x-2 transform hover:scale-105">
        <Plus size={20} />
        <span className="text-lg font-semibold">Add to Spotify</span>
      </button>
    </div>
  );
};

export default GeneratedPlaylist;

