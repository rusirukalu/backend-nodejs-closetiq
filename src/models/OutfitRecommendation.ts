import mongoose, { Document, Schema } from 'mongoose';

export interface IOutfitRecommendation extends Document {
  _id: string;
  userId: string;
  occasion: string;
  season: string;
  weatherContext?: {
    temperature: number;
    humidity: number;
    conditions: string;
    windSpeed: number;
    location: string;
  };
  items: string[]; // ClothingItem IDs
  compatibilityScore: number;
  aiReasoning: string;
  recommendationSource: 'ai' | 'user' | 'stylist';
  
  userFeedback?: {
    liked: boolean;
    rating: number; // 1-5
    worn: boolean;
    comments?: string;
    feedbackDate: Date;
  };
  
  metadata: {
    generationTime: number;
    modelVersion: string;
    algorithm: string;
  };
  
  expiresAt: Date;
  createdAt: Date;
}

const OutfitRecommendationSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  occasion: { type: String, required: true },
  season: { type: String, required: true },
  
  weatherContext: {
    temperature: Number,
    humidity: Number,
    conditions: String,
    windSpeed: Number,
    location: String
  },
  
  items: [{ type: Schema.Types.ObjectId, ref: 'ClothingItem', required: true }],
  compatibilityScore: { type: Number, required: true, min: 0, max: 1 },
  aiReasoning: { type: String, required: true },
  recommendationSource: { 
    type: String, 
    enum: ['ai', 'user', 'stylist'], 
    default: 'ai' 
  },
  
  userFeedback: {
    liked: Boolean,
    rating: { type: Number, min: 1, max: 5 },
    worn: { type: Boolean, default: false },
    comments: String,
    feedbackDate: Date
  },
  
  metadata: {
    generationTime: { type: Number, required: true },
    modelVersion: { type: String, required: true },
    algorithm: { type: String, required: true }
  },
  
  expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // 7 days
  createdAt: { type: Date, default: Date.now }
});

OutfitRecommendationSchema.index({ userId: 1, createdAt: -1 });
OutfitRecommendationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IOutfitRecommendation>('OutfitRecommendation', OutfitRecommendationSchema);
