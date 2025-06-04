import { Request, Response } from 'express';
import { auth } from '../config/firebase';
import User from '../models/User';
import { AuthenticatedRequest } from '../middleware/auth';

// Sync Firebase user with MongoDB - called when user registers/logs in
export const syncFirebaseUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const firebaseUser = req.user; // From Firebase token verification
    
    if (!firebaseUser) {
      res.status(401).json({
        success: false,
        message: 'No authenticated user found'
      });
      return;
    }

    // Check if user exists in MongoDB
    let user = await User.findOne({ firebaseUid: firebaseUser.uid });

    if (!user) {
      // Create new user in MongoDB from Firebase data
      const username = req.body.username || 
                      firebaseUser.email?.split('@')[0] || 
                      `user_${firebaseUser.uid.slice(0, 8)}`;

      user = await User.create({
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        username: username,
        displayName: firebaseUser.name || req.body.displayName,
        photoURL: firebaseUser.picture,
        isEmailVerified: firebaseUser.email_verified || false,
        authProvider: 'firebase',
        profile: {
          stylePreferences: [],
          occasionPreferences: {
            work: false,
            casual: true,
            formal: false,
            party: false,
            sport: false,
          },
        },
        preferences: {
          favoriteColors: [],
          dislikedColors: [],
          occasionPreferences: {
            work: false,
            casual: true,
            formal: false,
            party: false,
            sport: false,
          },
        },
        subscription: {
          plan: 'free',
        },
      });
    } else {
      // Update existing user with latest Firebase data
      user.email = firebaseUser.email || user.email;
      user.displayName = firebaseUser.name || user.displayName;
      user.photoURL = firebaseUser.picture || user.photoURL;
      user.isEmailVerified = firebaseUser.email_verified || user.isEmailVerified;
      user.lastLogin = new Date();
      await user.save();
    }

    res.json({
      success: true,
      message: 'User synced successfully',
      data: {
        user: {
          id: user._id,
          firebaseUid: user.firebaseUid,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          photoURL: user.photoURL,
          isEmailVerified: user.isEmailVerified,
          profile: user.profile,
          preferences: user.preferences,
          subscription: user.subscription,
          createdAt: user.createdAt,
          isActive: user.isActive,
        }
      }
    });

  } catch (error) {
    console.error('Sync Firebase user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Register endpoint for Firebase users (creates MongoDB record)
export const registerFirebaseUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, username, firebaseUid, displayName } = req.body;

    // Verify the Firebase user exists
    try {
      const firebaseUser = await auth.getUser(firebaseUid);
      
      // Check if user already exists in MongoDB
      const existingUser = await User.findOne({
        $or: [{ firebaseUid }, { email }, { username }]
      });

      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'User already exists'
        });
        return;
      }

      // Create user in MongoDB
      const user = await User.create({
        firebaseUid,
        email,
        username,
        displayName: displayName || firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        isEmailVerified: firebaseUser.emailVerified,
        authProvider: 'firebase',
        profile: {
          stylePreferences: [],
          occasionPreferences: {
            work: false,
            casual: true,
            formal: false,
            party: false,
            sport: false,
          },
        },
        preferences: {
          favoriteColors: [],
          dislikedColors: [],
          occasionPreferences: {
            work: false,
            casual: true,
            formal: false,
            party: false,
            sport: false,
          },
        },
        subscription: {
          plan: 'free',
        },
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user._id,
            firebaseUid: user.firebaseUid,
            email: user.email,
            username: user.username,
            displayName: user.displayName,
            photoURL: user.photoURL,
            isEmailVerified: user.isEmailVerified,
            profile: user.profile,
            preferences: user.preferences,
            subscription: user.subscription,
            createdAt: user.createdAt,
          }
        }
      });

    } catch (firebaseError) {
      res.status(400).json({
        success: false,
        message: 'Invalid Firebase user',
        error: firebaseError instanceof Error ? firebaseError.message : 'Firebase verification failed'
      });
    }

  } catch (error) {
    console.error('Register Firebase user error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get current user profile
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          firebaseUid: user.firebaseUid,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          photoURL: user.photoURL,
          isEmailVerified: user.isEmailVerified,
          profile: user.profile,
          preferences: user.preferences,
          subscription: user.subscription,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
          isActive: user.isActive,
        }
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update user profile
export const updateUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const updates = req.body;
    const userId = req.userId;

    // Remove fields that shouldn't be updated directly
    delete updates.firebaseUid;
    delete updates.email;
    delete updates.createdAt;
    delete updates._id;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          firebaseUid: user.firebaseUid,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          photoURL: user.photoURL,
          isEmailVerified: user.isEmailVerified,
          profile: user.profile,
          preferences: user.preferences,
          subscription: user.subscription,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
          isActive: user.isActive,
        }
      }
    });

  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete user account
export const deleteAccount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const firebaseUid = req.user?.uid;

    // Delete from MongoDB
    await User.findByIdAndDelete(userId);

    // Optionally delete from Firebase (uncomment if needed)
    // if (firebaseUid) {
    //   await auth.deleteUser(firebaseUid);
    // }

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Firebase token validation endpoint (for frontend to test token)
export const validateToken = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      firebaseUser: req.user,
      userId: req.userId
    }
  });
};
