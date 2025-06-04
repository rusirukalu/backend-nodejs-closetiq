import mongoose, { Document, Schema } from 'mongoose';

export interface IWardrobe extends Document {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  items: string[]; // ObjectIds of ClothingItem
  isDefault: boolean;
  visibility: 'private' | 'public' | 'shared';
  sharedWith: string[]; // User IDs
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const WardrobeSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, maxlength: 100 },
  description: { type: String, maxlength: 500 },
  items: [{ type: Schema.Types.ObjectId, ref: 'ClothingItem' }],
  isDefault: { type: Boolean, default: false },
  visibility: { type: String, enum: ['private', 'public', 'shared'], default: 'private' },
  sharedWith: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

WardrobeSchema.index({ userId: 1, name: 1 });
WardrobeSchema.index({ userId: 1, isDefault: 1 });

export default mongoose.model<IWardrobe>('Wardrobe', WardrobeSchema);
