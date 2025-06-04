import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import ClothingItem, { IClothingItem } from '../models/ClothingItem';
import Wardrobe from '../models/Wardrobe';
import aiService from '../services/aiService'; // ✅ Restored AI service
import path from 'path';
import fs from 'fs';
import cloudinary from '../config/cloudinary'; // ✅ Still commented out for now

// ✅ Type definitions to fix TypeScript errors
interface ClassificationResult {
  predicted_category: string;
  confidence: number;
  all_predictions?: Array<{
    category: string;
    confidence: number;
  }>;
  attributes?: {
    colors?: string[];
    patterns?: string[];
    materials?: string[];
  };
  quality_score?: {
    value: number;
  };
}

interface SimilarItemsResult {
  similar_items: Array<{
    item_id: string;
    similarity_score: number;
  }>;
}

export const addClothingItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('📦 Add clothing item - Request body:', req.body);
    console.log('📦 Add clothing item - File:', req.file);

    const { 
      wardrobeId, 
      name, 
      category, 
      brand, 
      color, 
      isFavorite, 
      timesWorn,
      tags // This comes as tags[] from FormData
    } = req.body;

    // ✅ Basic validation
    if (!wardrobeId || !name || !category || !color) {
      res.status(400).json({
        success: false,
        message: 'Wardrobe ID, name, category, and color are required'
      });
      return;
    }

    // Verify wardrobe exists and belongs to user
    const wardrobe = await Wardrobe.findOne({
      _id: wardrobeId,
      userId: req.userId
    });

    if (!wardrobe) {
      res.status(404).json({
        success: false,
        message: 'Wardrobe not found or access denied'
      });
      return;
    }

    // ✅ TEMPORARY: Skip Cloudinary upload, use fallback image
    const imageUrl = '/images/fallback-item.jpg';

    // ✅ Process with AI service if image file exists
    let classificationResult: ClassificationResult | null = null;
    let processingTime = 0;

    if (req.file && fs.existsSync(req.file.path)) {
      try {
        const startTime = Date.now();
        classificationResult = await aiService.classifyImage(req.file.path) as ClassificationResult;
        processingTime = Date.now() - startTime;
        console.log('✅ AI Classification completed:', classificationResult);
      } catch (aiError) {
        console.warn('⚠️ AI classification failed, continuing without it:', aiError);
        // Continue without AI classification
      }
      
      // Delete uploaded file after processing
      try {
        fs.unlinkSync(req.file.path);
      } catch (error) {
        console.warn('Could not delete uploaded file:', error);
      }
    }

    // ✅ Process tags - handle both array and single values
    let processedTags: string[] = [];
    if (tags) {
      if (Array.isArray(tags)) {
        processedTags = tags.filter(tag => tag && tag.trim());
      } else if (typeof tags === 'string') {
        processedTags = [tags.trim()].filter(tag => tag);
      }
    }

    // ✅ Create clothing item with AI classification if available
    const clothingItem = new ClothingItem({
      userId: req.userId,
      wardrobeId,
      imageUrl,
      
      // Basic item info - use AI classification if available, otherwise use form data
      name: name || 'Untitled Item',
      category: category || classificationResult?.predicted_category || 'general',
      brand: brand || '',
      color: color || 'unknown',
      
      // ✅ Attributes with AI enhancement if available - Fixed with proper optional chaining
      attributes: {
        colors: classificationResult?.attributes?.colors || [color],
        patterns: classificationResult?.attributes?.patterns || [],
        materials: classificationResult?.attributes?.materials || []
      },
      
      // ✅ AI classification data
      aiClassification: classificationResult ? {
        confidence: classificationResult.confidence,
        modelVersion: '1.0.0',
        allPredictions: classificationResult.all_predictions?.map(p => ({
          category: p.category,
          confidence: p.confidence
        })) || [{
          category: category,
          confidence: 0.5
        }],
        processingTime,
        qualityScore: classificationResult.quality_score?.value || 0.8
      } : {
        confidence: 0.5, // Default confidence when no AI
        modelVersion: '1.0.0',
        allPredictions: [{
          category: category,
          confidence: 0.5
        }],
        processingTime: 0,
        qualityScore: 0.8
      },
      
      // ✅ User metadata
      userMetadata: {
        userTags: processedTags,
        isFavorite: isFavorite === 'true' || isFavorite === true,
        timesWorn: parseInt(timesWorn as string) || 0,
        notes: '',
        size: '',
        price: 0,
        purchaseDate: null
      }
    });

    await clothingItem.save();
    console.log('✅ Clothing item saved:', clothingItem._id);

    // Add item to wardrobe
    await Wardrobe.findByIdAndUpdate(
      wardrobeId,
      { $push: { items: clothingItem._id } }
    );
    console.log('✅ Added to wardrobe:', wardrobeId);

    res.status(201).json({
      success: true,
      message: 'Clothing item added successfully',
      data: clothingItem
    });
  } catch (error) {
    console.error('Add clothing item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add clothing item',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getClothingItems = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    
    const wardrobeId = req.query.wardrobeId;
    const category = req.query.category;
    
    const filter: any = { userId: req.userId };
    
    if (wardrobeId) {
      filter.wardrobeId = wardrobeId;
    }
    
    if (category) {
      filter.category = category;
    }
    
    const totalItems = await ClothingItem.countDocuments(filter);
    
    const clothingItems = await ClothingItem.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.json({
      success: true,
      data: {
        items: clothingItems,
        pagination: {
          total: totalItems,
          page,
          limit,
          pages: Math.ceil(totalItems / limit),
          hasMore: skip + clothingItems.length < totalItems
        }
      }
    });
  } catch (error) {
    console.error('Get clothing items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clothing items'
    });
  }
};

export const getClothingItemById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const clothingItem = await ClothingItem.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!clothingItem) {
      res.status(404).json({
        success: false,
        message: 'Clothing item not found or access denied'
      });
      return;
    }
    
    res.json({
      success: true,
      data: clothingItem
    });
  } catch (error) {
    console.error('Get clothing item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clothing item'
    });
  }
};

export const updateClothingItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, category, brand, color, attributes, userMetadata } = req.body;
    
    const updateData: any = {
      updatedAt: new Date()
    };

    // ✅ Handle both simple and complex update structures
    if (name) updateData.name = name;
    if (category) updateData.category = category;
    if (brand) updateData.brand = brand;
    if (color) updateData.color = color;
    if (attributes) updateData.attributes = attributes;
    if (userMetadata) updateData.userMetadata = userMetadata;
    
    const clothingItem = await ClothingItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!clothingItem) {
      res.status(404).json({
        success: false,
        message: 'Clothing item not found or access denied'
      });
      return;
    }
    
    res.json({
      success: true,
      message: 'Clothing item updated successfully',
      data: clothingItem
    });
  } catch (error) {
    console.error('Update clothing item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update clothing item'
    });
  }
};

export const deleteClothingItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const clothingItem = await ClothingItem.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!clothingItem) {
      res.status(404).json({
        success: false,
        message: 'Clothing item not found or access denied'
      });
      return;
    }
    
    // Remove from wardrobe
    await Wardrobe.findByIdAndUpdate(
      clothingItem.wardrobeId,
      { $pull: { items: clothingItem._id } }
    );
    
    // ✅ TEMPORARY: Skip Cloudinary deletion since we're using fallback images
    // if (clothingItem.imageUrl && !clothingItem.imageUrl.includes('fallback')) {
    //   const publicId = clothingItem.imageUrl.split('/').pop()?.split('.')[0];
    //   if (publicId) {
    //     await cloudinary.uploader.destroy(`fashion-ai/clothing/${publicId}`);
    //   }
    // }
    
    // Delete item
    await clothingItem.deleteOne();
    
    res.json({
      success: true,
      message: 'Clothing item deleted successfully'
    });
  } catch (error) {
    console.error('Delete clothing item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete clothing item'
    });
  }
};

export const classifyClothingItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const clothingItem = await ClothingItem.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!clothingItem) {
      res.status(404).json({
        success: false,
        message: 'Clothing item not found or access denied'
      });
      return;
    }
    
    // ✅ Download image for processing (if not using fallback)
    let classificationResult: ClassificationResult | any;
    
    if (clothingItem.imageUrl && !clothingItem.imageUrl.includes('fallback')) {
      try {
        const response = await fetch(clothingItem.imageUrl);
        const imageBuffer = await response.arrayBuffer();
        const tempPath = path.join(__dirname, '../../uploads', `temp_${Date.now()}.jpg`);
        fs.writeFileSync(tempPath, Buffer.from(imageBuffer));
        
        // Process with AI service
        const startTime = Date.now();
        classificationResult = await aiService.classifyImage(tempPath) as ClassificationResult;
        const processingTime = Date.now() - startTime;
        
        // Delete temp file
        fs.unlinkSync(tempPath);
        
        // Update classification
        clothingItem.category = classificationResult.predicted_category;
        clothingItem.aiClassification = {
          confidence: classificationResult.confidence,
          modelVersion: '1.0.0',
          allPredictions: classificationResult.all_predictions?.map((p: any) => ({
            category: p.category,
            confidence: p.confidence
          })) || [],
          processingTime,
          qualityScore: classificationResult.quality_score?.value || 0.8
        };
        
        await clothingItem.save();
      } catch (aiError) {
        console.error('AI classification error:', aiError);
        // Return error but don't fail the request
        classificationResult = {
          error: 'Classification failed',
          message: aiError instanceof Error ? aiError.message : 'Unknown AI error'
        };
      }
    } else {
      // Use dummy classification for fallback images
      classificationResult = {
        predicted_category: clothingItem.category,
        confidence: 0.85,
        all_predictions: [
          { category: clothingItem.category, confidence: 0.85 },
          { category: 'general', confidence: 0.15 }
        ],
        quality_score: { value: 0.9 },
        note: 'Using fallback classification for demo image'
      };
    }
    
    res.json({
      success: true,
      message: 'Item classified successfully',
      data: {
        item: clothingItem,
        classification: classificationResult
      }
    });
  } catch (error) {
    console.error('Classify clothing item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to classify item'
    });
  }
};

export const getSimilarItems = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const clothingItem = await ClothingItem.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!clothingItem) {
      res.status(404).json({
        success: false,
        message: 'Clothing item not found or access denied'
      });
      return;
    }
    
    // ✅ Get similar items from AI service - Fixed type annotations
    let similarItemsResult: SimilarItemsResult | undefined;
    try {
      similarItemsResult = await aiService.findSimilarItems(
        clothingItem._id.toString(),
        clothingItem.category
      ) as SimilarItemsResult;
      
      // Fetch full item details
      const itemDetails = await ClothingItem.find({
        _id: { $in: similarItemsResult.similar_items.map(item => item.item_id) }
      });
      
      res.json({
        success: true,
        data: {
          baseItem: clothingItem._id,
          similarItems: itemDetails.map(item => ({
            ...item.toObject(),
            similarityScore: similarItemsResult!.similar_items.find(
              (s: { item_id: string; similarity_score: number }) => s.item_id === item._id.toString()
            )?.similarity_score
          }))
        }
      });
    } catch (aiError) {
      console.warn('AI similar items failed, using fallback:', aiError);
      
      // ✅ Fallback: Return similar items from same category
      const similarItems = await ClothingItem.find({
        userId: req.userId,
        category: clothingItem.category,
        _id: { $ne: clothingItem._id }
      }).limit(5);
      
      res.json({
        success: true,
        data: {
          baseItem: clothingItem._id,
          similarItems: similarItems.map(item => ({
            ...item.toObject(),
            similarityScore: Math.random() * 0.3 + 0.7 // Dummy similarity score
          })),
          note: 'Using category-based similarity (AI service unavailable)'
        }
      });
    }
  } catch (error) {
    console.error('Get similar items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find similar items'
    });
  }
};

export const bulkUpdateItems = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { itemIds, updates } = req.body;
    
    if (!itemIds || !Array.isArray(itemIds) || !updates) {
      res.status(400).json({
        success: false,
        message: 'Invalid request format'
      });
      return;
    }
    
    // Verify all items belong to user
    const userItems = await ClothingItem.find({
      _id: { $in: itemIds },
      userId: req.userId
    });
    
    if (userItems.length !== itemIds.length) {
      res.status(403).json({
        success: false,
        message: 'Some items not found or access denied'
      });
      return;
    }
    
    // Perform bulk update
    const updateResult = await ClothingItem.updateMany(
      {
        _id: { $in: itemIds },
        userId: req.userId
      },
      {
        $set: updates,
        updatedAt: new Date()
      }
    );
    
    res.json({
      success: true,
      message: `Updated ${updateResult.modifiedCount} items`,
      data: {
        modified: updateResult.modifiedCount,
        matched: updateResult.matchedCount
      }
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update items'
    });
  }
};

// ✅ NEW: Toggle favorite endpoint
export const toggleFavorite = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { isFavorite } = req.body;
    
    const clothingItem = await ClothingItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { 
        'userMetadata.isFavorite': isFavorite,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!clothingItem) {
      res.status(404).json({
        success: false,
        message: 'Clothing item not found or access denied'
      });
      return;
    }
    
    res.json({
      success: true,
      message: 'Favorite status updated successfully',
      data: clothingItem
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update favorite status'
    });
  }
};
