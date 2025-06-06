const express = require('express');
const { body, validationResult } = require('express-validator');
const Playlist = require('../models/Playlist');
const User = require('../models/User');
const auth = require('../middleware/auth');
const aiService = require('../services/aiService');
const spotifyService = require('../services/spotifyService');

const router = express.Router();

// @route   POST /api/playlists/suggestions
// @desc    Get playlist name suggestions based on prompt
// @access  Private
router.post('/suggestions', [
  auth,
  body('prompt')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Prompt must be between 3 and 200 characters'),
  body('language')
    .isIn(['English', 'Hindi', 'Gujarati'])
    .withMessage('Language must be English, Hindi, or Gujarati')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { prompt, language } = req.body;

    const suggestions = await aiService.getPlaylistSuggestions(prompt, language);

    res.json({
      success: true,
      message: 'Playlist suggestions generated successfully',
      suggestions: suggestions.suggestions || []
    });

  } catch (error) {
    console.error('Get playlist suggestions error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error generating playlist suggestions'
    });
  }
});

// @route   POST /api/playlists/generate
// @desc    Generate AI playlist using Gemini
// @access  Private
router.post('/generate', [
  auth,
  body('prompt')
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('Prompt must be between 3 and 500 characters'),
  body('language')
    .isIn(['English', 'Hindi', 'Gujarati'])
    .withMessage('Language must be English, Hindi, or Gujarati'),
  body('songCount')
    .isIn([10, 20, 30])
    .withMessage('Song count must be 10, 20, or 30')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { prompt, language, songCount } = req.body;

    console.log(`🤖 Generating playlist with Gemini: "${prompt}" (${language}, ${songCount} songs)`);

    // Generate playlist using Gemini AI
    const aiResponse = await aiService.generatePlaylistSuggestions(prompt, language, songCount);
    
    console.log(`✅ Gemini response: ${aiResponse.playlistName} with ${aiResponse.songs.length} songs`);

    // Get detailed song info from Spotify if available
    const songsWithDetails = await Promise.all(
      aiResponse.songs.map(async (song, index) => {
        try {
          const spotifyDetails = await spotifyService.searchTrack(song.name, song.artist);
          return {
            id: `${Date.now()}-${index}`,
            name: song.name,
            artist: song.artist,
            previewUrl: spotifyDetails?.preview_url || null,
            spotifyId: spotifyDetails?.id || null,
            duration: spotifyDetails?.duration_ms ? Math.floor(spotifyDetails.duration_ms / 1000) + 's' : 'Unknown',
            album: spotifyDetails?.album?.name || 'Unknown',
            image: spotifyDetails?.album?.images?.[0]?.url || null,
            mood: song.mood || 'Unknown',
            reason: song.reason || 'AI curated for your playlist'
          };
        } catch (spotifyError) {
          console.warn(`Spotify search failed for ${song.name} by ${song.artist}`);
          return {
            id: `${Date.now()}-${index}`,
            name: song.name,
            artist: song.artist,
            previewUrl: null,
            spotifyId: null,
            duration: 'Unknown',
            album: 'Unknown',
            image: null,
            mood: song.mood || 'Unknown',
            reason: song.reason || 'AI curated for your playlist'
          };
        }
      })
    );

    res.json({
      success: true,
      message: 'Playlist generated successfully with Gemini AI',
      playlist: {
        name: aiResponse.playlistName,
        description: aiResponse.description,
        mood: aiResponse.mood || 'Mixed',
        genre: aiResponse.genre || 'Various',
        prompt,
        language,
        songCount,
        songs: songsWithDetails,
        generatedAt: new Date(),
        aiProvider: 'Google Gemini'
      }
    });

  } catch (error) {
    console.error('Generate playlist error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error generating playlist with Gemini AI'
    });
  }
});

// @route   POST /api/playlists/save
// @desc    Save generated playlist
// @access  Private
router.post('/save', [
  auth,
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Playlist name is required and must be less than 100 characters'),
  body('songs')
    .isArray({ min: 1 })
    .withMessage('At least one song is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description, prompt, language, songCount, songs, mood, genre, tags } = req.body;

    // Create new playlist
    const playlist = new Playlist({
      name,
      description: description || '',
      prompt,
      language,
      songCount,
      songs,
      user: req.user.id,
      mood: mood || '',
      genre: genre || '',
      tags: tags || []
    });

    await playlist.save();

    // Add playlist to user's playlists
    await User.findByIdAndUpdate(req.user.id, {
      $push: { playlists: playlist._id }
    });

    res.status(201).json({
      success: true,
      message: 'Playlist saved successfully',
      playlist
    });

  } catch (error) {
    console.error('Save playlist error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error saving playlist'
    });
  }
});

// @route   GET /api/playlists/user
// @desc    Get user's playlists
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const playlists = await Playlist.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-songs'); // Exclude songs for list view

    const total = await Playlist.countDocuments({ user: req.user.id });

    res.json({
      success: true,
      playlists,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get user playlists error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching playlists'
    });
  }
});

// @route   GET /api/playlists/:id
// @desc    Get specific playlist
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found'
      });
    }

    // Check if user owns the playlist or if it's public
    if (playlist.user.toString() !== req.user.id && !playlist.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      playlist
    });

  } catch (error) {
    console.error('Get playlist error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching playlist'
    });
  }
});

// @route   PUT /api/playlists/:id
// @desc    Update playlist
// @access  Private
router.put('/:id', [
  auth,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Playlist name must be less than 100 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const playlist = await Playlist.findById(req.params.id);

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

    const { name, description, isPublic, tags } = req.body;

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isPublic !== undefined && { isPublic }),
        ...(tags && { tags })
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Playlist updated successfully',
      playlist: updatedPlaylist
    });

  } catch (error) {
    console.error('Update playlist error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error updating playlist'
    });
  }
});

// @route   DELETE /api/playlists/:id
// @desc    Delete playlist
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

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

    await Playlist.findByIdAndDelete(req.params.id);

    // Remove playlist from user's playlists
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { playlists: req.params.id }
    });

    res.json({
      success: true,
      message: 'Playlist deleted successfully'
    });

  } catch (error) {
    console.error('Delete playlist error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error deleting playlist'
    });
  }
});

module.exports = router;