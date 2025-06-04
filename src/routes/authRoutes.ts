import express from 'express';
import {
  registerFirebaseUser,
  syncFirebaseUser,
  getCurrentUser,
  updateUserProfile,
  deleteAccount,
  validateToken
} from '../controllers/authController';
import {
  validateFirebaseRegistration,
  validateUserProfile
} from '../middleware/validation';
import { authenticateUser, optionalAuth } from '../middleware/auth';
import { authRateLimit } from '../middleware/security';

const router = express.Router();

// Apply auth-specific rate limiting
router.use(authRateLimit);

// Public routes (no authentication required)
router.post('/register', validateFirebaseRegistration, registerFirebaseUser);

// Protected routes (authentication required)
router.post('/sync', authenticateUser, syncFirebaseUser);
router.get('/validate', authenticateUser, validateToken);
router.get('/me', authenticateUser, getCurrentUser);
router.put('/profile', authenticateUser, validateUserProfile, updateUserProfile);
router.delete('/account', authenticateUser, deleteAccount);

export default router;
