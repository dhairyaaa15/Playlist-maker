const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   PUT /api/user/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', [
  auth,
  body('defaultLanguage')
    .optional()
    .isIn(['English', 'Hindi', 'Gujarati'])
    .withMessage('Language must be English, Hindi, or Gujarati'),
  body('defaultSongCount')
    .optional()
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

    const { defaultLanguage, defaultSongCount } = req.body;
    
    const updateData = {};
    if (defaultLanguage) updateData['preferences.defaultLanguage'] = defaultLanguage;
    if (defaultSongCount) updateData['preferences.defaultSongCount'] = defaultSongCount;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });

  } catch (error) {
    console.error('Update preferences error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error updating preferences'
    });
  }
});

// @route   GET /api/user/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const Playlist = require('../models/Playlist');

    const user = await User.findById(req.user.id);
    const playlistCount = await Playlist.countDocuments({ user: req.user.id });
    
    // Get playlist statistics
    const playlistStats = await Playlist.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: null,
          totalSongs: { $sum: '$songCount' },
          languageBreakdown: {
            $push: '$language'
          }
        }
      }
    ]);

    // Count languages
    const languageCounts = {};
    if (playlistStats.length > 0) {
      playlistStats[0].languageBreakdown.forEach(lang => {
        languageCounts[lang] = (languageCounts[lang] || 0) + 1;
      });
    }

    res.json({
      success: true,
      stats: {
        totalPlaylists: playlistCount,
        totalSongs: playlistStats.length > 0 ? playlistStats[0].totalSongs : 0,
        languageBreakdown: languageCounts,
        memberSince: user.createdAt,
        spotifyConnected: !!(user.spotifyId)
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics'
    });
  }
});

module.exports = router;