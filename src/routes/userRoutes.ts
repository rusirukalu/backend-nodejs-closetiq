import express, { Request, Response } from 'express';
import multer from 'multer';
import {
  getCurrentUser,
  updateUserProfile,
  deleteAccount
} from '../controllers/authController';
import {
  validateUserProfile,
  validateUserSettings,
  validateProfilePicture,
  validateObjectId
} from '../middleware/validation';
import { requireCompleteRegistration } from '../middleware/auth';
import { uploadRateLimit } from '../middleware/security';

const router = express.Router();

// Configure multer for profile picture uploads
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Basic profile routes (no complete registration required)
router.get('/profile', getCurrentUser);
router.put('/profile', validateUserProfile, updateUserProfile);
router.delete('/profile', deleteAccount);

// Profile picture upload
router.post('/profile/picture', upload.single('picture'), uploadRateLimit, validateProfilePicture, async (req: Request, res: Response) => {
  // This will be implemented in the user controller
  res.json({ success: true, message: 'Profile picture upload endpoint' });
});

// User settings routes
router.get('/settings', async (req: Request, res: Response) => {
  // This will be implemented in the user controller
  res.json({ success: true, message: 'Get user settings endpoint' });
});

router.put('/settings', validateUserSettings, async (req: Request, res: Response) => {
  // This will be implemented in the user controller
  res.json({ success: true, message: 'Update user settings endpoint' });
});

// User statistics
router.get('/stats', async (req: Request, res: Response) => {
  // This will be implemented in the user controller
  res.json({ success: true, message: 'Get user stats endpoint' });
});

// Protected routes requiring complete registration
router.use(requireCompleteRegistration);

// Additional user-related endpoints can be added here

export default router;
