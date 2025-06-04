import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import User from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: any; // Firebase decoded token
  userId?: string; // MongoDB user ID
}

export const authenticateUser = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        success: false, 
        message: 'No valid authorization token provided' 
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Verify Firebase ID Token
    const decodedToken = await auth.verifyIdToken(token);
    
    // Find user in MongoDB using Firebase UID
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    if (!user || !user.isActive) {
      res.status(401).json({ 
        success: false, 
        message: 'User not found or inactive. Please complete registration.' 
      });
      return;
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Attach Firebase user and MongoDB user ID to request
    req.user = decodedToken;
    req.userId = user._id.toString();
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    let message = 'Invalid or expired token';
    if (error instanceof Error) {
      if (error.message.includes('Firebase ID token has expired')) {
        message = 'Token expired. Please login again.';
      } else if (error.message.includes('Firebase ID token has invalid signature')) {
        message = 'Invalid token signature';
      }
    }
    
    res.status(401).json({ 
      success: false, 
      message 
    });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decodedToken = await auth.verifyIdToken(token);
      const user = await User.findOne({ firebaseUid: decodedToken.uid });
      
      if (user && user.isActive) {
        req.user = decodedToken;
        req.userId = user._id.toString();
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

// Middleware to ensure user has completed registration
export const requireCompleteRegistration = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const user = await User.findById(req.userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User profile not found. Please complete registration.'
      });
      return;
    }

    // Check if user has completed basic profile setup
    if (!user.username || !user.email) {
      res.status(400).json({
        success: false,
        message: 'Profile incomplete. Please complete your profile setup.',
        requiresProfileSetup: true
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Registration check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify registration status'
    });
  }
};
