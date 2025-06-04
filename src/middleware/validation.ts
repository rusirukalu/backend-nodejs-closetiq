import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Middleware to handle validation errors
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
    return;
  }
  next();
};

// Firebase user registration validation
export const validateFirebaseRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('firebaseUid')
    .notEmpty()
    .withMessage('Firebase UID is required'),
  body('displayName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Display name must be between 2 and 50 characters'),
  handleValidationErrors
];

// Legacy user validation (keeping for compatibility)
export const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  handleValidationErrors
];

export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

export const validateGoogleLogin = [
  body('token')
    .notEmpty()
    .withMessage('Google token is required'),
  handleValidationErrors
];

export const validateRefreshToken = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required'),
  handleValidationErrors
];

export const validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  handleValidationErrors
];

export const validateResetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  handleValidationErrors
];

export const validateEmailVerification = [
  body('token')
    .notEmpty()
    .withMessage('Verification token is required'),
  handleValidationErrors
];

export const validateResendVerification = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  handleValidationErrors
];

// User profile validation (updated for Firebase integration)
export const validateUserProfile = [
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Display name must be between 2 and 50 characters'),
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('profile.bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  body('profile.age')
    .optional()
    .isInt({ min: 13, max: 120 })
    .withMessage('Age must be between 13 and 120'),
  body('profile.gender')
    .optional()
    .isIn(['male', 'female', 'non-binary', 'prefer-not-to-say'])
    .withMessage('Invalid gender value'),
  body('profile.stylePreferences')
    .optional()
    .isArray()
    .withMessage('Style preferences must be an array'),
  body('profile.bodyType')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Body type must be less than 50 characters'),
  body('profile.location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters'),
  body('preferences.favoriteColors')
    .optional()
    .isArray()
    .withMessage('Favorite colors must be an array'),
  body('preferences.dislikedColors')
    .optional()
    .isArray()
    .withMessage('Disliked colors must be an array'),
  body('preferences.stylePersonality')
    .optional()
    .isIn(['classic', 'trendy', 'casual', 'formal', 'bohemian', 'minimalist', 'edgy', 'romantic'])
    .withMessage('Invalid style personality'),
  body('preferences.occasionPreferences.work')
    .optional()
    .isBoolean()
    .withMessage('Work preference must be boolean'),
  body('preferences.occasionPreferences.casual')
    .optional()
    .isBoolean()
    .withMessage('Casual preference must be boolean'),
  body('preferences.occasionPreferences.formal')
    .optional()
    .isBoolean()
    .withMessage('Formal preference must be boolean'),
  body('preferences.occasionPreferences.party')
    .optional()
    .isBoolean()
    .withMessage('Party preference must be boolean'),
  body('preferences.occasionPreferences.sport')
    .optional()
    .isBoolean()
    .withMessage('Sport preference must be boolean'),
  handleValidationErrors
];

// User settings validation
export const validateUserSettings = [
  body('settings.emailNotifications')
    .optional()
    .isBoolean()
    .withMessage('Email notifications must be boolean'),
  body('settings.pushNotifications')
    .optional()
    .isBoolean()
    .withMessage('Push notifications must be boolean'),
  body('settings.theme')
    .optional()
    .isIn(['light', 'dark', 'auto'])
    .withMessage('Theme must be light, dark, or auto'),
  body('settings.language')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('Language code must be between 2 and 5 characters'),
  handleValidationErrors
];

// Profile picture validation
export const validateProfilePicture = [
  body('picture')
    .optional()
    .custom((value, { req }) => {
      if (!req.file) {
        throw new Error('Profile picture file is required');
      }
      
      // Check file size (5MB max)
      if (req.file.size > 5 * 1024 * 1024) {
        throw new Error('Profile picture must be less than 5MB');
      }
      
      // Check file type
      if (!req.file.mimetype.startsWith('image/')) {
        throw new Error('Profile picture must be an image file');
      }
      
      return true;
    }),
  handleValidationErrors
];

// Object ID validation
export const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

// Pagination validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sort')
    .optional()
    .isIn(['name', 'createdAt', 'updatedAt', 'category', 'brand'])
    .withMessage('Invalid sort field'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc'),
  handleValidationErrors
];

// Clothing item validation
export const validateClothingItem = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('category')
    .isIn(['shirts_blouses', 'tshirts_tops', 'dresses', 'pants_jeans', 'shorts', 'skirts', 'jackets_coats', 'sweaters', 'shoes_sneakers', 'shoes_formal', 'bags_accessories'])
    .withMessage('Invalid category'),
  body('brand')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Brand must be less than 50 characters'),
  body('color')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Color must be less than 30 characters'),
  body('size')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('Size must be less than 10 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('purchaseDate')
    .optional()
    .isISO8601()
    .withMessage('Purchase date must be a valid date'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters'),
  handleValidationErrors
];

// Clothing item update validation
export const validateClothingItemUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('category')
    .optional()
    .isIn(['shirts_blouses', 'tshirts_tops', 'dresses', 'pants_jeans', 'shorts', 'skirts', 'jackets_coats', 'sweaters', 'shoes_sneakers', 'shoes_formal', 'bags_accessories'])
    .withMessage('Invalid category'),
  body('brand')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Brand must be less than 50 characters'),
  body('color')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Color must be less than 30 characters'),
  body('size')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('Size must be less than 10 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('isFavorite')
    .optional()
    .isBoolean()
    .withMessage('isFavorite must be boolean'),
  handleValidationErrors
];

// Wardrobe validation
export const validateWardrobe = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be boolean'),
  body('settings.isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be boolean'),
  body('settings.allowSharing')
    .optional()
    .isBoolean()
    .withMessage('allowSharing must be boolean'),
  handleValidationErrors
];

// Wardrobe update validation
export const validateWardrobeUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be boolean'),
  body('settings.isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be boolean'),
  body('settings.allowSharing')
    .optional()
    .isBoolean()
    .withMessage('allowSharing must be boolean'),
  handleValidationErrors
];

// Outfit validation
export const validateOutfitRequest = [
  body('occasion')
    .isIn(['work', 'casual', 'formal', 'party', 'date', 'sport', 'travel'])
    .withMessage('Invalid occasion'),
  body('season')
    .optional()
    .isIn(['spring', 'summer', 'fall', 'winter'])
    .withMessage('Invalid season'),
  body('weather')
    .optional()
    .isIn(['sunny', 'cloudy', 'rainy', 'snowy', 'hot', 'cold', 'mild'])
    .withMessage('Invalid weather condition'),
  body('count')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Count must be between 1 and 10'),
  body('includeItems')
    .optional()
    .isArray()
    .withMessage('Include items must be an array'),
  body('includeItems.*')
    .optional()
    .isMongoId()
    .withMessage('Each include item must be a valid ID'),
  body('excludeItems')
    .optional()
    .isArray()
    .withMessage('Exclude items must be an array'),
  body('excludeItems.*')
    .optional()
    .isMongoId()
    .withMessage('Each exclude item must be a valid ID'),
  body('preferredColors')
    .optional()
    .isArray()
    .withMessage('Preferred colors must be an array'),
  handleValidationErrors
];

// Outfit save validation
export const validateOutfitSave = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Outfit name must be between 1 and 100 characters'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Outfit must contain at least one item'),
  body('items.*')
    .isMongoId()
    .withMessage('Each item must be a valid ID'),
  body('occasion')
    .isIn(['work', 'casual', 'formal', 'party', 'date', 'sport', 'travel'])
    .withMessage('Invalid occasion'),
  body('season')
    .optional()
    .isIn(['spring', 'summer', 'fall', 'winter'])
    .withMessage('Invalid season'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  handleValidationErrors
];

// Chat message validation
export const validateChatMessage = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message content must be between 1 and 1000 characters'),
  body('sessionType')
    .optional()
    .isIn(['general', 'style_advice', 'outfit_help'])
    .withMessage('Invalid session type'),
  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array'),
  body('attachments.*.type')
    .optional()
    .isIn(['image', 'outfit', 'clothing_item'])
    .withMessage('Invalid attachment type'),
  body('attachments.*.url')
    .optional()
    .isURL()
    .withMessage('Attachment URL must be valid'),
  handleValidationErrors
];

// Chat session validation
export const validateChatSession = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Session name must be between 1 and 100 characters'),
  body('type')
    .optional()
    .isIn(['general', 'style_advice', 'outfit_help'])
    .withMessage('Invalid session type'),
  handleValidationErrors
];

// Weather preference validation
export const validateWeatherPreferences = [
  body('location')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  body('temperatureUnit')
    .optional()
    .isIn(['celsius', 'fahrenheit'])
    .withMessage('Temperature unit must be celsius or fahrenheit'),
  body('autoSuggestOutfits')
    .optional()
    .isBoolean()
    .withMessage('Auto suggest outfits must be boolean'),
  handleValidationErrors
];

// AI classification validation
export const validateAIClassification = [
  body('images')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one image is required'),
  body('autoAddToWardrobe')
    .optional()
    .isBoolean()
    .withMessage('Auto add to wardrobe must be boolean'),
  body('wardrobeId')
    .optional()
    .isMongoId()
    .withMessage('Wardrobe ID must be valid'),
  handleValidationErrors
];

// Search validation
export const validateSearch = [
  query('q')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('type')
    .optional()
    .isIn(['clothing', 'outfits', 'wardrobes', 'all'])
    .withMessage('Invalid search type'),
  query('category')
    .optional()
    .isIn(['shirts_blouses', 'tshirts_tops', 'dresses', 'pants_jeans', 'shorts', 'skirts', 'jackets_coats', 'sweaters', 'shoes_sneakers', 'shoes_formal', 'bags_accessories'])
    .withMessage('Invalid category'),
  handleValidationErrors
];

// File upload validation
export const validateFileUpload = [
  body('file')
    .custom((value, { req }) => {
      if (!req.file && !req.files) {
        throw new Error('File is required');
      }
      return true;
    }),
  handleValidationErrors
];

// Bulk operations validation
export const validateBulkOperation = [
  body('operation')
    .isIn(['delete', 'update', 'move', 'favorite', 'unfavorite'])
    .withMessage('Invalid bulk operation'),
  body('itemIds')
    .isArray({ min: 1 })
    .withMessage('At least one item ID is required'),
  body('itemIds.*')
    .isMongoId()
    .withMessage('Each item ID must be valid'),
  body('targetWardrobeId')
    .optional()
    .isMongoId()
    .withMessage('Target wardrobe ID must be valid'),
  handleValidationErrors
];

// Analytics validation
export const validateAnalyticsQuery = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  query('metric')
    .optional()
    .isIn(['usage', 'favorites', 'outfits', 'items', 'categories'])
    .withMessage('Invalid metric'),
  handleValidationErrors
];
