import express from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { testConnection, getDatabaseStats } from '../config/database';

const router = express.Router();

// Get user's data overview
router.get('/overview', async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const userId = req.userId;
    
    // Import models
    const [User, Wardrobe, ClothingItem, Outfit, ChatSession] = await Promise.all([
      import('../models/User'),
      import('../models/Wardrobe'),
      import('../models/ClothingItem'),
      import('../models/Outfit'),
      import('../models/ChatSession')
    ]);

    const overview = {
      user_data: {
        wardrobes: await Wardrobe.default.countDocuments({ userId }),
        clothing_items: await ClothingItem.default.countDocuments({ userId }),
        outfits: await Outfit.default.countDocuments({ userId }),
        chat_sessions: await ChatSession.default.countDocuments({ userId }),
      },
      recent_activity: {
        latest_wardrobe: await Wardrobe.default.findOne({ userId }).sort({ createdAt: -1 }).select('name createdAt'),
        latest_item: await ClothingItem.default.findOne({ userId }).sort({ createdAt: -1 }).select('name category createdAt'),
        latest_outfit: await Outfit.default.findOne({ userId }).sort({ createdAt: -1 }).select('name occasion createdAt'),
        latest_chat: await ChatSession.default.findOne({ userId }).sort({ lastMessageAt: -1 }).select('title sessionType lastMessageAt')
      }
    };

    res.json({
      success: true,
      data: overview,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get database overview'
    });
  }
});

// Get detailed statistics for user
router.get('/stats/detailed', async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const userId = req.userId;
    
    const [ClothingItem, Outfit] = await Promise.all([
      import('../models/ClothingItem'),
      import('../models/Outfit')
    ]);

    // Category breakdown for clothing items
    const categoryStats = await ClothingItem.default.aggregate([
      { $match: { userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Occasion breakdown for outfits
    const occasionStats = await Outfit.default.aggregate([
      { $match: { userId } },
      { $group: { _id: '$occasion', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Monthly activity
    const monthlyActivity = await ClothingItem.default.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          items_added: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      data: {
        category_breakdown: categoryStats,
        occasion_breakdown: occasionStats,
        monthly_activity: monthlyActivity
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Detailed stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get detailed statistics'
    });
  }
});

// Export user data (for backup/migration)
router.get('/export', async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const userId = req.userId;
    
    const [User, Wardrobe, ClothingItem, Outfit, ChatSession] = await Promise.all([
      import('../models/User'),
      import('../models/Wardrobe'),
      import('../models/ClothingItem'),
      import('../models/Outfit'),
      import('../models/ChatSession')
    ]);

    const userData = {
      user: await User.default.findById(userId).select('-password'),
      wardrobes: await Wardrobe.default.find({ userId }),
      clothing_items: await ClothingItem.default.find({ userId }),
      outfits: await Outfit.default.find({ userId }),
      chat_sessions: await ChatSession.default.find({ userId })
    };

    res.json({
      success: true,
      data: userData,
      exported_at: new Date().toISOString(),
      format_version: '1.0'
    });

  } catch (error) {
    console.error('Data export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export user data'
    });
  }
});

// Test database connection for user
router.get('/health', async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const isConnected = await testConnection();
    const stats = await getDatabaseStats();
    
    res.json({
      success: true,
      database: {
        connected: isConnected,
        status: isConnected ? 'healthy' : 'unhealthy',
        response_time: new Date().getTime(), // Simple response time
        stats: stats
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database health check error:', error);
    res.status(500).json({
      success: false,
      database: {
        connected: false,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

export default router;
