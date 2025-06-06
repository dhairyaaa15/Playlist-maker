const { body, param } = require('express-validator');

// Common validation rules
const playlistValidation = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Playlist name is required and must be less than 100 characters'),
    body('prompt')
      .trim()
      .isLength({ min: 3, max: 500 })
      .withMessage('Prompt must be between 3 and 500 characters'),
    body('language')
      .isIn(['English', 'Hindi', 'Gujarati'])
      .withMessage('Language must be English, Hindi, or Gujarati'),
    body('songCount')
      .isIn([10, 20, 30])
      .withMessage('Song count must be 10, 20, or 30'),
    body('songs')
      .isArray({ min: 1 })
      .withMessage('At least one song is required')
  ],
  
  update: [
    param('id').isMongoId().withMessage('Invalid playlist ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Playlist name must be less than 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must be less than 500 characters')
  ]
};

const userValidation = {
  register: [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please enter a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
  ],
  
  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please enter a valid email'),
    body('password')
      .exists()
      .withMessage('Password is required')
  ]
};

module.exports = {
  playlistValidation,
  userValidation
};