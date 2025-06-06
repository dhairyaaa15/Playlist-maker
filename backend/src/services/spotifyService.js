const axios = require('axios');

class SpotifyService {
  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.redirectUri = process.env.SPOTIFY_REDIRECT_URI;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  // Get Spotify access token (Client Credentials Flow)
  async getAccessToken() {
    try {
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      const response = await axios.post('https://accounts.spotify.com/api/token', 
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      
      return this.accessToken;
    } catch (error) {
      console.error('Spotify token error:', error.response?.data || error.message);
      return null;
    }
  }

  // Search for a track
  async searchTrack(trackName, artistName) {
    try {
      const token = await this.getAccessToken();
      if (!token) return null;

      const query = `track:"${trackName}" artist:"${artistName}"`;
      
      const response = await axios.get(`https://api.spotify.com/v1/search`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          q: query,
          type: 'track',
          limit: 1
        }
      });

      const tracks = response.data.tracks.items;
      return tracks.length > 0 ? tracks[0] : null;

    } catch (error) {
      console.error('Spotify search error:', error.response?.data || error.message);
      return null;
    }
  }

  // Get authorization URL for user login
  getAuthUrl() {
    const scopes = [
      'playlist-modify-public',
      'playlist-modify-private',
      'user-read-email',
      'user-read-private'
    ].join(' ');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      scope: scopes,
      redirect_uri: this.redirectUri,
      state: Math.random().toString(36).substring(2, 15)
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code) {
    try {
      const response = await axios.post('https://accounts.spotify.com/api/token', 
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: this.redirectUri
        }),
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Token exchange error:', error.response?.data || error.message);
      throw new Error('Failed to exchange code for token');
    }
  }

  // Create playlist on Spotify
  async createPlaylist(userId, playlistName, description, tracks, accessToken) {
    try {
      // Create playlist
      const playlistResponse = await axios.post(
        `https://api.spotify.com/v1/users/${userId}/playlists`,
        {
          name: playlistName,
          description: description || 'Created with AI Playlist Maker',
          public: false
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const playlistId = playlistResponse.data.id;

      // Add tracks to playlist
      if (tracks && tracks.length > 0) {
        const trackUris = tracks
          .filter(track => track.spotifyId)
          .map(track => `spotify:track:${track.spotifyId}`);

        if (trackUris.length > 0) {
          await axios.post(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
            {
              uris: trackUris
            },
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            }
          );
        }
      }

      return playlistResponse.data;
    } catch (error) {
      console.error('Create playlist error:', error.response?.data || error.message);
      throw new Error('Failed to create playlist on Spotify');
    }
  }

  // Get user profile
  async getUserProfile(accessToken) {
    try {
      const response = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Get user profile error:', error.response?.data || error.message);
      throw new Error('Failed to get user profile');
    }
  }

  // Refresh access token
  async refreshAccessToken(refreshToken) {
    try {
      const response = await axios.post('https://accounts.spotify.com/api/token',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        }),
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Refresh token error:', error.response?.data || error.message);
      throw new Error('Failed to refresh access token');
    }
  }
}

module.exports = new SpotifyService();