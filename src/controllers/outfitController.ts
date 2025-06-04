// src/controllers/outfitController.ts - FIXED response parsing
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import Outfit from '../models/Outfit';
import ClothingItem from '../models/ClothingItem';
import apiClient from '../services/apiClient';

export const generateOutfitRecommendations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { occasion, season, weather_context, items, count } = req.body;
    
    console.log('📦 Received request body:', req.body);
    console.log('📊 Items received:', items, 'Count:', items?.length);
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No wardrobe items provided'
      });
      return;
    }
    
    const fullItemData = await ClothingItem.find({
      _id: { $in: items },
      userId: req.userId
    }).lean();
    
    console.log('📊 Fetched item data:', fullItemData.length, 'items');
    
    if (fullItemData.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No valid wardrobe items found for user'
      });
      return;
    }
    
    const formattedItems = fullItemData.map((item: any) => ({
      _id: item._id.toString(),
      category: item.category,
      name: item.name,
      brand: item.brand,
      color: item.color,
      attributes: {
        colors: item.color ? [item.color] : ['unknown'],
        style: item.userMetadata?.userTags || ['casual'],
        materials: item.attributes?.materials || ['cotton'],
        patterns: item.attributes?.patterns || ['solid']
      }
    }));
    
    const aiRequest = {
      user_id: req.userId,
      occasion,
      season: season || 'spring',
      weather_context,
      wardrobe_items: formattedItems,
      style_preferences: [],
      count: count || 5
    };
    
    console.log('🚀 Sending to AI backend:', {
      ...aiRequest,
      wardrobe_items: `${formattedItems.length} items`
    });
    
    const aiResponse = await apiClient.request({
      method: 'POST',
      url: '/api/outfits/generate',
      data: aiRequest
    });
    
    // ✅ FIXED: Add comprehensive debugging
    console.log('🔍 FULL AI Response:', JSON.stringify(aiResponse.data, null, 2));
    console.log('✅ AI Response received:', {
      success: aiResponse.data?.success,
      outfitsCount: aiResponse.data?.outfits?.length || 0,
      totalGenerated: aiResponse.data?.total_generated || 0,
      hasAlgorithmInfo: !!aiResponse.data?.algorithm_info
    });
    
    // ✅ FIXED: Handle different possible response structures
    let outfits = [];
    let total = 0;
    
    if (aiResponse.data?.outfits && Array.isArray(aiResponse.data.outfits)) {
      outfits = aiResponse.data.outfits;
      total = aiResponse.data.total_generated || aiResponse.data.outfits.length;
    } else if (aiResponse.data?.success && aiResponse.data?.total_generated) {
      // Try alternative structure
      outfits = aiResponse.data?.outfits || [];
      total = aiResponse.data.total_generated;
    }
    
    // ✅ FIXED: Transform outfits to ensure proper structure for frontend
    const transformedOutfits = outfits.map((outfit: any, index: number) => ({
      id: outfit.id || outfit._id || `outfit_${index}`,
      name: outfit.name || `${occasion.charAt(0).toUpperCase() + occasion.slice(1)} Outfit ${index + 1}`,
      items: outfit.item_ids || outfit.items || [],
      score: Math.round((outfit.overall_score || 0.8) * 100),
      explanation: outfit.explanation || [],
      tags: outfit.tags || [occasion, season],
      occasion: outfit.occasion || occasion,
      weatherContext: weather_context,
      grade: outfit.grade || 'B+',
      scores: outfit.scores || {},
      overall_score: outfit.overall_score || 0.8
    }));
    
    console.log('🔧 Transformed outfits:', transformedOutfits.length, 'outfits');
    
    // ✅ FIXED: Proper response structure for Redux slice
    const responseData = {
      success: true,
      recommendations: {
        outfits: transformedOutfits,
        total: transformedOutfits.length,
        algorithm_info: aiResponse.data?.algorithm_info || {},
        processing_time_ms: aiResponse.data?.processing_time_ms || 0
      }
    };
    
    console.log('📤 Sending to frontend:', {
      success: responseData.success,
      outfitsCount: responseData.recommendations.outfits.length,
      total: responseData.recommendations.total
    });
    
    res.json(responseData);
    return;
    
  } catch (error: any) {
    console.error('Outfit generation error:', error);
    
    if (error.response?.data) {
      console.error('AI Backend Error Details:', error.response.data);
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate outfit recommendations',
      details: error.response?.data || error.message
    });
    return;
  }
};

// ... rest of the controller functions remain the same
export const saveOutfit = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, items, occasion, tags, isPublic = false } = req.body;

    const outfit = new Outfit({
      userId: req.userId,
      name,
      items,
      occasion,
      tags: tags || [],
      isPublic,
      createdAt: new Date(),
      rating: 0,
      timesWorn: 0
    });

    await outfit.save();

    res.status(201).json({
      success: true,
      message: 'Outfit saved successfully',
      data: outfit
    });
    return;

  } catch (error) {
    console.error('Save outfit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save outfit'
    });
    return;
  }
};

export const getUserOutfits = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const totalOutfits = await Outfit.countDocuments({ userId: req.userId });
    
    const outfits = await Outfit.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items');

    res.json({
      success: true,
      data: {
        outfits,
        pagination: {
          total: totalOutfits,
          page,
          limit,
          pages: Math.ceil(totalOutfits / limit)
        }
      }
    });
    return;

  } catch (error) {
    console.error('Get outfits error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch outfits'
    });
    return;
  }
};

export const getOutfitById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const outfit = await Outfit.findOne({
      _id: req.params.id,
      $or: [
        { userId: req.userId },
        { isPublic: true }
      ]
    }).populate('items');

    if (!outfit) {
      res.status(404).json({
        success: false,
        message: 'Outfit not found or access denied'
      });
      return;
    }

    res.json({
      success: true,
      data: outfit
    });
    return;

  } catch (error) {
    console.error('Get outfit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch outfit'
    });
    return;
  }
};

export const updateOutfit = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, items, occasion, tags, isPublic } = req.body;

    const outfit = await Outfit.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      {
        name,
        items,
        occasion,
        tags,
        isPublic,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!outfit) {
      res.status(404).json({
        success: false,
        message: 'Outfit not found or access denied'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Outfit updated successfully',
      data: outfit
    });
    return;

  } catch (error) {
    console.error('Update outfit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update outfit'
    });
    return;
  }
};

export const deleteOutfit = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const outfit = await Outfit.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!outfit) {
      res.status(404).json({
        success: false,
        message: 'Outfit not found or access denied'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Outfit deleted successfully'
    });
    return;

  } catch (error) {
    console.error('Delete outfit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete outfit'
    });
    return;
  }
};

export const rateOutfit = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { rating } = req.body;

    if (rating < 1 || rating > 5) {
      res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
      return;
    }

    const outfit = await Outfit.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { rating },
      { new: true }
    );

    if (!outfit) {
      res.status(404).json({
        success: false,
        message: 'Outfit not found or access denied'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Outfit rated successfully',
      data: { rating: outfit.rating }
    });
    return;

  } catch (error) {
    console.error('Rate outfit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to rate outfit'
    });
    return;
  }
};

export const shareOutfit = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const outfit = await Outfit.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isPublic: true },
      { new: true }
    );

    if (!outfit) {
      res.status(404).json({
        success: false,
        message: 'Outfit not found or access denied'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Outfit shared successfully',
      data: {
        shareUrl: `${process.env.FRONTEND_URL}/outfits/${outfit._id}`
      }
    });
    return;

  } catch (error) {
    console.error('Share outfit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to share outfit'
    });
    return;
  }
};
