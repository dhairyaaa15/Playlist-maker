const express = require('express');
const User = require('../models/User');
const Playlist = require('../models/Playlist');
const auth = require('../middleware/auth');
const spotifyService = require('../services/spotifyService');

const router = express.Router();

// @route   GET /api/spotify/auth
// @desc    Get Spotify authorization URL
// @access  Private
router.get('/auth', auth, (req, res) => {
  try {
    const authUrl = spotifyService.getAuthUrl();
    res.json({
      success: true,
      authUrl
    });
  } catch (error) {
    console.error('Spotify auth URL error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error generating Spotify auth URL'
    });
  }
});

// @route   POST /api/spotify/callback
// @desc    Handle Spotify callback
// @access  Private
router.post('/callback', auth, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required'
      });
    }

    // Exchange code for tokens
    const tokenData = await spotifyService.exchangeCodeForToken(code);
    
    // Get user profile from Spotify
    const spotifyProfile = await spotifyService.getUserProfile(tokenData.access_token);

    // Update user with Spotify tokens
    await User.findByIdAndUpdate(req.user.id, {
      spotifyId: spotifyProfile.id,
      spotifyAccessToken: tokenData.access_token,
      spotifyRefreshToken: tokenData.refresh_token
    });

    res.json({
      success: true,
      message: 'Spotify account connected successfully',
      spotifyProfile: {
        id: spotifyProfile.id,
        display_name: spotifyProfile.display_name,
        email: spotifyProfile.email,
        images: spotifyProfile.images
      }
    });

  } catch (error) {
    console.error('Spotify callback error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error connecting Spotify account'
    });
  }
});

// @route   POST /api/spotify/create-playlist
// @desc    Create playlist on Spotify
// @access  Private
router.post('/create-playlist', auth, async (req, res) => {
  try {
    const { playlistId } = req.body;

    if (!playlistId) {
      return res.status(400).json({
        success: false,
        message: 'Playlist ID is required'
      });
    }

    // Get user with Spotify tokens
    const user = await User.findById(req.user.id);
    
    if (!user.spotifyAccessToken || !user.spotifyId) {
      return res.status(400).json({
        success: false,
        message: 'Spotify account not connected'
      });
    }

    // Get playlist details
    const playlist = await Playlist.findById(playlistId);
    
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found'
      });
    }

    // Check if user owns the playlist
    if (playlist.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Create playlist on Spotify
    const spotifyPlaylist = await spotifyService.createPlaylist(
      user.spotifyId,
      playlist.name,
      playlist.description,
      playlist.songs,
      user.spotifyAccessToken
    );

    // Update playlist with Spotify ID
    await Playlist.findByIdAndUpdate(playlistId, {
      spotifyPlaylistId: spotifyPlaylist.id
    });

    res.json({
      success: true,
      message: 'Playlist created on Spotify successfully',
      spotifyPlaylist: {
        id: spotifyPlaylist.id,
        name: spotifyPlaylist.name,
        external_urls: spotifyPlaylist.external_urls
      }
    });

  } catch (error) {
    console.error('Create Spotify playlist error:', error.message);
    
    // Handle token expiry
    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: 'Spotify token expired. Please reconnect your account.',
        requiresReauth: true
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating playlist on Spotify'
    });
  }
});

// @route   GET /api/spotify/status
// @desc    Check Spotify connection status
// @access  Private
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const isConnected = !!(user.spotifyAccessToken && user.spotifyId);
    
    res.json({
      success: true,
      isConnected,
      spotifyId: user.spotifyId || null
    });

  } catch (error) {
    console.error('Spotify status error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error checking Spotify status'
    });
  }
});

// @route   DELETE /api/spotify/disconnect
// @desc    Disconnect Spotify account
// @access  Private
router.delete('/disconnect', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      $unset: {
        spotifyId: 1,
        spotifyAccessToken: 1,
        spotifyRefreshToken: 1
      }
    });

    res.json({
      success: true,
      message: 'Spotify account disconnected successfully'
    });

  } catch (error) {
    console.error('Spotify disconnect error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error disconnecting Spotify account'
    });
  }
});

module.exports = router;