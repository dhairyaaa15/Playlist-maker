const crypto = require('crypto');

// Generate random string
const generateRandomString = (length = 16) => {
  return crypto.randomBytes(length).toString('hex');
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Sanitize string for playlist names
const sanitizePlaylistName = (name) => {
  return name.replace(/[<>:"/\\|?*]/g, '').trim();
};

// Format duration from milliseconds to readable format
const formatDuration = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Check if string contains offensive content (basic filter)
const containsOffensiveContent = (text) => {
  const offensiveWords = ['badword1', 'badword2']; // Add actual offensive words
  const lowerText = text.toLowerCase();
  return offensiveWords.some(word => lowerText.includes(word));
};

// Paginate results
const paginate = (query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
};

module.exports = {
  generateRandomString,
  isValidEmail,
  sanitizePlaylistName,
  formatDuration,
  containsOffensiveContent,
  paginate
};