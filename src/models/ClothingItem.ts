import mongoose, { Document, Schema } from 'mongoose';

export interface IClothingItem extends Document {
  _id: string;
  userId: string;
  wardrobeId: string;
  imageUrl: string;
  category: string;
  
  attributes: {
    colors: string[];
    patterns: string[];
    materials: string[];
    season: string[];
    occasion: string[];
    style: string[];
    fit: string;
    length?: string;
    sleeveLength?: string;
    neckline?: string;
  };
  
  aiClassification: {
    confidence: number;
    modelVersion: string;
    allPredictions: Array<{
      category: string;
      confidence: number;
    }>;
    processingTime: number;
    qualityScore: number;
  };
  
  userMetadata: {
    name?: string;
    brand?: string;
    price?: number;
    purchaseDate?: Date;
    notes?: string;
    userTags: string[];
    isFavorite: boolean;
    timesWorn: number;
    lastWorn?: Date;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const ClothingItemSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  wardrobeId: { type: Schema.Types.ObjectId, ref: 'Wardrobe', required: true },
  imageUrl: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['shirts_blouses', 'tshirts_tops', 'dresses', 'pants_jeans', 'shorts', 
           'skirts', 'jackets_coats', 'sweaters', 'shoes_sneakers', 'shoes_formal', 
           'bags_accessories']
  },
  
  attributes: {
    colors: [{ type: String }],
    patterns: [{ type: String }],
    materials: [{ type: String }],
    season: [{ type: String, enum: ['spring', 'summer', 'fall', 'winter', 'all-season'] }],
    occasion: [{ type: String }],
    style: [{ type: String }],
    fit: { type: String, enum: ['tight', 'fitted', 'regular', 'loose', 'oversized'] },
    length: String,
    sleeveLength: String,
    neckline: String
  },
  
  aiClassification: {
    confidence: { type: Number, required: true, min: 0, max: 1 },
    modelVersion: { type: String, required: true },
    allPredictions: [{
      category: String,
      confidence: Number
    }],
    processingTime: { type: Number, required: true },
    qualityScore: { type: Number, min: 0, max: 100 }
  },
  
  userMetadata: {
    name: String,
    brand: String,
    price: { type: Number, min: 0 },
    purchaseDate: Date,
    notes: { type: String, maxlength: 1000 },
    userTags: [{ type: String }],
    isFavorite: { type: Boolean, default: false },
    timesWorn: { type: Number, default: 0 },
    lastWorn: Date
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ClothingItemSchema.index({ userId: 1, category: 1 });
ClothingItemSchema.index({ userId: 1, 'userMetadata.isFavorite': 1 });
ClothingItemSchema.index({ wardrobeId: 1 });

export default mongoose.model<IClothingItem>('ClothingItem', ClothingItemSchema);
