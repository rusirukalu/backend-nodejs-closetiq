import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  firebaseUid: string; // Required for Firebase integration
  email: string;
  username: string;
  displayName?: string;
  photoURL?: string;
  
  // Firebase specific
  isEmailVerified: boolean;
  authProvider: 'firebase' | 'google';
  
  profile: {
    age?: number;
    gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
    stylePreferences: string[];
    bodyType?: string;
    location?: string;
    profilePicture?: string;
    bio?: string;
  };
  preferences: {
    favoriteColors: string[];
    dislikedColors: string[];
    stylePersonality?: 'classic' | 'trendy' | 'casual' | 'formal' | 'bohemian' | 'minimalist' | 'edgy' | 'romantic';
    occasionPreferences: {
      work: boolean;
      casual: boolean;
      formal: boolean;
      party: boolean;
      sport: boolean;
    };
  };
  subscription: {
    plan: 'free' | 'premium' | 'pro';
    startDate?: Date;
    endDate?: Date;
  };
  settings: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    theme: 'light' | 'dark' | 'auto';
    language: string;
  };
  createdAt: Date;
  lastLogin: Date;
  isActive: boolean;
}

const UserSchema: Schema = new Schema({
  firebaseUid: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  username: { 
    type: String, 
    required: true, 
    unique: true,
    index: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  displayName: { 
    type: String,
    trim: true,
    maxlength: 50
  },
  photoURL: { type: String },
  
  // Firebase specific
  isEmailVerified: { type: Boolean, default: false },
  authProvider: { 
    type: String, 
    enum: ['firebase', 'google'], 
    default: 'firebase' 
  },
  
  profile: {
    age: { type: Number, min: 13, max: 120 },
    gender: { 
      type: String, 
      enum: ['male', 'female', 'non-binary', 'prefer-not-to-say'] 
    },
    stylePreferences: [{ type: String }],
    bodyType: { type: String },
    location: { type: String },
    profilePicture: { type: String },
    bio: { type: String, maxlength: 500 }
  },
  
  preferences: {
    favoriteColors: [{ type: String }],
    dislikedColors: [{ type: String }],
    stylePersonality: { 
      type: String, 
      enum: ['classic', 'trendy', 'casual', 'formal', 'bohemian', 'minimalist', 'edgy', 'romantic']
    },
    occasionPreferences: {
      work: { type: Boolean, default: false },
      casual: { type: Boolean, default: true },
      formal: { type: Boolean, default: false },
      party: { type: Boolean, default: false },
      sport: { type: Boolean, default: false }
    }
  },
  
  subscription: {
    plan: { type: String, enum: ['free', 'premium', 'pro'], default: 'free' },
    startDate: Date,
    endDate: Date
  },

  settings: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
    language: { type: String, default: 'en' }
  },
  
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

// Indexes for performance
UserSchema.index({ firebaseUid: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ 'subscription.plan': 1 });
UserSchema.index({ isActive: 1 });

export default mongoose.model<IUser>('User', UserSchema);
