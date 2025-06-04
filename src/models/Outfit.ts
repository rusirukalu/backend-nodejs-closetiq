// src/models/Outfit.ts - Outfit Data Model
import mongoose, { Schema, Document } from 'mongoose';

export interface IOutfit extends Document {
  userId: string;
  name: string;
  items: string[]; // Array of clothing item IDs
  occasion: string;
  tags: string[];
  isPublic: boolean;
  rating: number;
  timesWorn: number;
  createdAt: Date;
  updatedAt: Date;
}

const OutfitSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  items: [{
    type: Schema.Types.ObjectId,
    ref: 'ClothingItem',
    required: true
  }],
  occasion: {
    type: String,
    required: true,
    enum: ['work', 'casual', 'formal', 'party', 'date', 'sport', 'travel']
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  timesWorn: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
OutfitSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for efficient queries
OutfitSchema.index({ userId: 1, createdAt: -1 });
OutfitSchema.index({ occasion: 1, isPublic: 1 });

export default mongoose.model<IOutfit>('Outfit', OutfitSchema);
