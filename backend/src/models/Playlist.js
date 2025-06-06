const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  id: String,
  name: {
    type: String,
    required: true
  },
  artist: {
    type: String,
    required: true
  },
  previewUrl: String,
  spotifyId: String,
  duration: String,
  album: String,
  image: String
});

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Playlist name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  prompt: {
    type: String,
    required: [true, 'Original prompt is required']
  },
  language: {
    type: String,
    enum: ['English', 'Hindi', 'Gujarati'],
    required: true
  },
  songCount: {
    type: Number,
    enum: [10, 20, 30],
    required: true
  },
  songs: [songSchema],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  spotifyPlaylistId: {
    type: String,
    default: null
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [String],
  mood: String,
  genre: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Playlist', playlistSchema);