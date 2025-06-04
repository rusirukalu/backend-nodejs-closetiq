import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import Wardrobe, { IWardrobe } from '../models/Wardrobe';
import User from '../models/User';
import mongoose from 'mongoose';

export const createWardrobe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, description, visibility = 'private', tags = [] } = req.body;

    const wardrobe = new Wardrobe({
      userId: req.userId,
      name,
      description,
      visibility,
      tags,
      items: []
    });

    await wardrobe.save();

    res.status(201).json({
      success: true,
      message: 'Wardrobe created successfully',
      data: wardrobe
    });
  } catch (error) {
    console.error('Create wardrobe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create wardrobe'
    });
  }
};

export const getUserWardrobes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const totalWardrobes = await Wardrobe.countDocuments({ userId: req.userId });
    
    const wardrobes = await Wardrobe.find({ userId: req.userId })
      .sort({ isDefault: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'items',
        select: 'imageUrl category attributes.colors',
        options: { limit: 5 }
      });

    res.json({
      success: true,
      data: {
        wardrobes,
        pagination: {
          total: totalWardrobes,
          page,
          limit,
          pages: Math.ceil(totalWardrobes / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get wardrobes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wardrobes'
    });
  }
};

export const getWardrobeById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const wardrobe = await Wardrobe.findOne({
      _id: req.params.id,
      $or: [
        { userId: req.userId },
        { visibility: 'public' },
        { sharedWith: req.userId }
      ]
    }).populate('items');

    if (!wardrobe) {
      res.status(404).json({
        success: false,
        message: 'Wardrobe not found or access denied'
      });
      return;
    }

    res.json({
      success: true,
      data: wardrobe
    });
  } catch (error) {
    console.error('Get wardrobe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wardrobe'
    });
  }
};

export const updateWardrobe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, description, visibility, tags } = req.body;

    const wardrobe = await Wardrobe.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      {
        name,
        description,
        visibility,
        tags,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!wardrobe) {
      res.status(404).json({
        success: false,
        message: 'Wardrobe not found or access denied'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Wardrobe updated successfully',
      data: wardrobe
    });
  } catch (error) {
    console.error('Update wardrobe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update wardrobe'
    });
  }
};

export const deleteWardrobe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Prevent deletion of default wardrobe
    const defaultWardrobe = await Wardrobe.findOne({
      userId: req.userId,
      isDefault: true
    });

    if (defaultWardrobe && defaultWardrobe._id.toString() === req.params.id) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete default wardrobe'
      });
      return;
    }

    const wardrobe = await Wardrobe.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!wardrobe) {
      res.status(404).json({
        success: false,
        message: 'Wardrobe not found or access denied'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Wardrobe deleted successfully'
    });
  } catch (error) {
    console.error('Delete wardrobe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete wardrobe'
    });
  }
};

export const shareWardrobe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { username } = req.body;

    // Find target user
    const targetUser = await User.findOne({ username });
    
    if (!targetUser) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Update wardrobe sharing settings
    const wardrobe = await Wardrobe.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      {
        visibility: 'shared',
        $addToSet: { sharedWith: targetUser._id }
      },
      { new: true }
    );

    if (!wardrobe) {
      res.status(404).json({
        success: false,
        message: 'Wardrobe not found or access denied'
      });
      return;
    }

    res.json({
      success: true,
      message: `Wardrobe shared with ${username}`,
      data: {
        wardrobeId: wardrobe._id,
        sharedWith: wardrobe.sharedWith
      }
    });
  } catch (error) {
    console.error('Share wardrobe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to share wardrobe'
    });
  }
};

export const getSharedWardrobes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const totalShared = await Wardrobe.countDocuments({
      $or: [
        { visibility: 'public' },
        { sharedWith: req.userId }
      ],
      userId: { $ne: req.userId }
    });

    const sharedWardrobes = await Wardrobe.find({
      $or: [
        { visibility: 'public' },
        { sharedWith: req.userId }
      ],
      userId: { $ne: req.userId }
    })
      .populate('userId', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: {
        wardrobes: sharedWardrobes,
        pagination: {
          total: totalShared,
          page,
          limit,
          pages: Math.ceil(totalShared / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get shared wardrobes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shared wardrobes'
    });
  }
};
