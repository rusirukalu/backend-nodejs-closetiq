// src/controllers/userController.ts - Complete with Missing Functions
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import User, { IUser } from '../models/User';
import Wardrobe from '../models/Wardrobe';
import cloudinaryService from '../config/cloudinary';

export const createUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, username, firebaseUid } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }, ...(firebaseUid ? [{ firebaseUid }] : [])]
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User already exists'
      });
      return;
    }

    // Create new user
    const user: IUser = new User({
      email,
      username,
      firebaseUid,
      profile: {
        stylePreferences: [],
      },
      preferences: {
        favoriteColors: [],
        dislikedColors: [],
        occasionPreferences: {
          work: false,
          casual: true,
          formal: false,
          party: false,
          sport: false
        }
      }
    });

    await user.save();

    // Create default wardrobe
    const defaultWardrobe = new Wardrobe({
      userId: user._id,
      name: 'My Wardrobe',
      description: 'Default wardrobe',
      isDefault: true,
      items: []
    });

    await defaultWardrobe.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          profile: user.profile,
          preferences: user.preferences
        },
        defaultWardrobe: {
          id: defaultWardrobe._id,
          name: defaultWardrobe.name
        }
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
};

export const getUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select('-firebaseUid -password');
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    });
  }
};

export const updateUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const updateData = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { 
        ...updateData,
        lastLogin: new Date()
      },
      { new: true, runValidators: true }
    ).select('-firebaseUid -password');

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
      data: user
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

export const deleteUserAccount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { isActive: false },
      { new: true }
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
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Delete user account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate account'
    });
  }
};

// ✅ Added missing uploadProfilePicture function
export const uploadProfilePicture = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
      return;
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinaryService.uploadImage(
      req.file.buffer,
      'fashion-ai/profile-pictures'
    );

    // Update user profile with new picture URL
    const user = await User.findByIdAndUpdate(
      req.userId,
      { 
        'profile.profilePicture': uploadResult.secure_url,
        lastLogin: new Date()
      },
      { new: true }
    ).select('-firebaseUid -password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profilePicture: uploadResult.secure_url,
        user: user
      }
    });

  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture'
    });
  }
};

// ✅ Added missing getUserSettings function
export const getUserSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select('preferences subscription');
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const settings = {
      preferences: user.preferences,
      subscription: user.subscription,
      notifications: {
        email: true, // Default settings
        push: true,
        recommendations: true
      },
      privacy: {
        profileVisibility: 'public',
        dataSharing: false
      }
    };

    res.json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error('Get user settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user settings'
    });
  }
};

// ✅ Added missing updateUserSettings function
export const updateUserSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { preferences, notifications, privacy } = req.body;

    const updateData: any = {};
    
    if (preferences) {
      updateData.preferences = preferences;
    }
    
    // For notifications and privacy, you might want to store these in a separate settings collection
    // For now, we'll just update preferences
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('preferences subscription');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        preferences: user.preferences,
        subscription: user.subscription
      }
    });

  } catch (error) {
    console.error('Update user settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
};

export const getUserStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const wardrobes = await Wardrobe.find({ userId: req.userId }).populate('items');
    
    let totalItems = 0;
    const categoryStats: { [key: string]: number } = {};
    
    for (const wardrobe of wardrobes) {
      totalItems += wardrobe.items.length;
      // Additional stats calculation here
    }

    const user = await User.findById(req.userId).select('createdAt');

    res.json({
      success: true,
      data: {
        totalWardrobes: wardrobes.length,
        totalItems,
        categoryStats,
        accountAge: user ? Date.now() - new Date(user.createdAt).getTime() : 0
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics'
    });
  }
};
