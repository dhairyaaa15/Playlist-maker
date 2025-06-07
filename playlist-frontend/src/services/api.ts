import axios from 'axios';

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
  withCredentials: true, // Important for CORS
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`Making ${config.method?.toUpperCase()} request to:`, config.url);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export interface User {
  _id: string;
  username: string;
  email: string;
  spotifyId?: string;
  preferences: {
    defaultLanguage: string;
    defaultSongCount: number;
  };
}

export interface Song {
  id: string;
  name: string;
  artist: string;
  previewUrl: string | null;
  spotifyId: string | null;
  duration: string;
  album: string;
  image: string | null;
  mood: string;
  reason: string;
}

export interface Playlist {
  _id?: string;
  name: string;
  description: string;
  prompt: string;
  language: string;
  songCount: number;
  songs: Song[];
  mood?: string;
  genre?: string;
  generatedAt?: Date;
  aiProvider?: string;
  spotifyPlaylistId?: string;
  spotifyPlaylistUrl?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface PlaylistResponse {
  success: boolean;
  message: string;
  playlist?: Playlist;
}

// Auth API calls
export const authAPI = {
  register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getProfile: async (): Promise<{ success: boolean; user: User }> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  logout: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

// Playlist API calls
export const playlistAPI = {
  generate: async (prompt: string, language: string, songCount: number): Promise<PlaylistResponse> => {
    const response = await api.post('/playlists/generate', { prompt, language, songCount });
    return response.data;
  },

  save: async (playlistData: Partial<Playlist>): Promise<PlaylistResponse> => {
    const response = await api.post('/playlists/save', playlistData);
    return response.data;
  },

  getUserPlaylists: async (page = 1, limit = 10) => {
    const response = await api.get(`/playlists/user?page=${page}&limit=${limit}`);
    return response.data;
  },

  getPlaylist: async (id: string) => {
    const response = await api.get(`/playlists/${id}`);
    return response.data;
  },

  deletePlaylist: async (id: string) => {
    const response = await api.delete(`/playlists/${id}`);
    return response.data;
  },
};

// Spotify API calls
export const spotifyAPI = {
  getAuthUrl: async () => {
    const response = await api.get('/spotify/auth');
    return response.data;
  },

  handleCallback: async (code: string) => {
    const response = await api.post('/spotify/callback', { code });
    return response.data;
  },

  createPlaylist: async (playlistId: string) => {
    const response = await api.post('/spotify/create-playlist', { playlistId });
    return response.data;
  },

  getStatus: async () => {
    const response = await api.get('/spotify/status');
    return response.data;
  },

  disconnect: async () => {
    const response = await api.delete('/spotify/disconnect');
    return response.data;
  },
};

// User API calls
export const userAPI = {
  updatePreferences: async (preferences: { defaultLanguage?: string; defaultSongCount?: number }) => {
    const response = await api.put('/user/preferences', preferences);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/user/stats');
    return response.data;
  },
};

export default api;