// scripts/seed-database.ts - Sample Data Seeder with All Models
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Import all models
import User from '../src/models/User';
import Wardrobe from '../src/models/Wardrobe';
import ClothingItem from '../src/models/ClothingItem';
import ChatSession from '../src/models/ChatSession';
import Outfit from '../src/models/Outfit';
import OutfitRecommendation from '../src/models/OutfitRecommendation';

dotenv.config();

interface UserData {
  email: string;
  username: string;
  firebaseUid: string;
  profile: {
    age?: number;
    gender?: string;
    stylePreferences: string[];
    bodyType?: string;
    location?: string;
  };
  preferences: {
    favoriteColors: string[];
    dislikedColors: string[];
    stylePersonality?: string;
    occasionPreferences: {
      work: boolean;
      casual: boolean;
      formal: boolean;
      party: boolean;
      sport: boolean;
    };
  };
}

interface WardrobeData {
  name: string;
  description: string;
  isDefault: boolean;
  visibility: 'private' | 'public' | 'shared';
  tags: string[];
}

interface ClothingItemData {
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
}

interface ChatSessionData {
  sessionType: 'general' | 'style_advice' | 'outfit_help';
  title: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  isActive: boolean;
  lastMessageAt: Date;
}

interface OutfitData {
  name: string;
  occasion: string;
  tags: string[];
  isPublic: boolean;
  rating: number;
  timesWorn: number;
}

interface OutfitRecommendationData {
  occasion: string;
  season: string;
  weatherContext?: {
    temperature: number;
    humidity: number;
    conditions: string;
    windSpeed: number;
    location: string;
  };
  compatibilityScore: number;
  aiReasoning: string;
  recommendationSource: 'ai' | 'user' | 'stylist';
  userFeedback?: {
    liked: boolean;
    rating: number;
    worn: boolean;
    comments?: string;
    feedbackDate: Date;
  };
  metadata: {
    generationTime: number;
    modelVersion: string;
    algorithm: string;
  };
}

const sampleData = {
  users: [
    {
      email: 'demo@fashionai.com',
      username: 'fashionista',
      firebaseUid: 'demo-firebase-uid-12345678',
      profile: {
        age: 28,
        gender: 'female',
        stylePreferences: ['classic', 'modern', 'minimalist'],
        bodyType: 'athletic',
        location: 'New York, NY'
      },
      preferences: {
        favoriteColors: ['blue', 'black', 'white', 'navy'],
        dislikedColors: ['neon-green', 'hot-pink'],
        stylePersonality: 'classic',
        occasionPreferences: {
          work: true,
          casual: true,
          formal: true,
          party: false,
          sport: true
        }
      }
    }
  ] as UserData[],

  wardrobes: [
    {
      name: 'My Main Wardrobe',
      description: 'Primary collection of my favorite items',
      isDefault: true,
      visibility: 'private',
      tags: ['main', 'everyday']
    },
    {
      name: 'Work Attire',
      description: 'Professional clothing for office',
      isDefault: false,
      visibility: 'private',
      tags: ['work', 'professional']
    }
  ] as WardrobeData[],

  clothingItems: [
    {
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
      category: 'shirts_blouses',
      attributes: {
        colors: ['white'],
        patterns: ['solid'],
        materials: ['cotton'],
        season: ['all-season'],
        occasion: ['work', 'casual', 'formal'],
        style: ['classic', 'professional'],
        fit: 'fitted',
        sleeveLength: 'long',
        neckline: 'collared'
      },
      aiClassification: {
        confidence: 0.95,
        modelVersion: 'v1.0.0',
        allPredictions: [
          { category: 'shirts_blouses', confidence: 0.95 },
          { category: 'tshirts_tops', confidence: 0.05 }
        ],
        processingTime: 1250,
        qualityScore: 92
      },
      userMetadata: {
        name: 'Classic White Shirt',
        brand: 'Uniqlo',
        price: 29.99,
        purchaseDate: new Date('2024-01-15'),
        notes: 'Perfect for any occasion',
        userTags: ['versatile', 'classic', 'work'],
        isFavorite: true,
        timesWorn: 15,
        lastWorn: new Date('2024-02-01')
      }
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d',
      category: 'pants_jeans',
      attributes: {
        colors: ['blue', 'dark-blue'],
        patterns: ['solid'],
        materials: ['denim'],
        season: ['all-season'],
        occasion: ['casual'],
        style: ['casual', 'classic'],
        fit: 'regular'
      },
      aiClassification: {
        confidence: 0.92,
        modelVersion: 'v1.0.0',
        allPredictions: [
          { category: 'pants_jeans', confidence: 0.92 },
          { category: 'shorts', confidence: 0.08 }
        ],
        processingTime: 1100,
        qualityScore: 88
      },
      userMetadata: {
        name: 'Dark Blue Jeans',
        brand: 'Levi\'s',
        price: 79.99,
        purchaseDate: new Date('2024-01-20'),
        notes: 'Comfortable everyday jeans',
        userTags: ['casual', 'comfortable', 'everyday'],
        isFavorite: false,
        timesWorn: 8,
        lastWorn: new Date('2024-01-30')
      }
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      category: 'jackets_coats',
      attributes: {
        colors: ['black'],
        patterns: ['solid'],
        materials: ['wool', 'polyester'],
        season: ['fall', 'winter', 'spring'],
        occasion: ['work', 'formal'],
        style: ['professional', 'elegant'],
        fit: 'fitted',
        length: 'regular'
      },
      aiClassification: {
        confidence: 0.88,
        modelVersion: 'v1.0.0',
        allPredictions: [
          { category: 'jackets_coats', confidence: 0.88 },
          { category: 'sweaters', confidence: 0.12 }
        ],
        processingTime: 1350,
        qualityScore: 95
      },
      userMetadata: {
        name: 'Black Blazer',
        brand: 'Zara',
        price: 119.99,
        purchaseDate: new Date('2024-01-10'),
        notes: 'Great for professional meetings',
        userTags: ['formal', 'professional', 'elegant'],
        isFavorite: true,
        timesWorn: 6,
        lastWorn: new Date('2024-01-28')
      }
    }
  ] as ClothingItemData[],

  chatSessions: [
    {
      sessionType: 'style_advice',
      title: 'Winter Work Outfit Help',
      messages: [
        {
          role: 'user',
          content: 'I need help putting together a professional winter outfit. It\'s cold outside but I want to look polished.',
          timestamp: new Date('2024-02-01T09:00:00Z')
        },
        {
          role: 'assistant',
          content: 'I\'d be happy to help! For a professional winter look, I recommend layering. Start with your classic white shirt as a base, add your black blazer for structure, and consider pairing with dark trousers. Would you like specific suggestions based on your wardrobe?',
          timestamp: new Date('2024-02-01T09:01:30Z')
        },
        {
          role: 'user',
          content: 'Yes, please use items from my wardrobe to suggest a complete outfit.',
          timestamp: new Date('2024-02-01T09:02:00Z')
        }
      ],
      isActive: true,
      lastMessageAt: new Date('2024-02-01T09:02:00Z')
    },
    {
      sessionType: 'general',
      title: 'Color Coordination Tips',
      messages: [
        {
          role: 'user',
          content: 'What colors work well with navy blue?',
          timestamp: new Date('2024-01-30T14:15:00Z')
        },
        {
          role: 'assistant',
          content: 'Navy blue is incredibly versatile! It pairs beautifully with white, cream, light pink, camel, gold, and even burgundy. For a classic look, try navy with white or cream. For something bolder, consider navy with coral or yellow.',
          timestamp: new Date('2024-01-30T14:15:45Z')
        }
      ],
      isActive: false,
      lastMessageAt: new Date('2024-01-30T14:15:45Z')
    }
  ] as ChatSessionData[],

  outfits: [
    {
      name: 'Professional Meeting Look',
      occasion: 'work',
      tags: ['professional', 'classic', 'polished'],
      isPublic: false,
      rating: 5,
      timesWorn: 3
    },
    {
      name: 'Casual Friday',
      occasion: 'casual',
      tags: ['relaxed', 'comfortable', 'stylish'],
      isPublic: true,
      rating: 4,
      timesWorn: 2
    }
  ] as OutfitData[],

  outfitRecommendations: [
    {
      occasion: 'work',
      season: 'winter',
      weatherContext: {
        temperature: 35,
        humidity: 45,
        conditions: 'cloudy',
        windSpeed: 8,
        location: 'New York, NY'
      },
      compatibilityScore: 0.93,
      aiReasoning: 'This combination provides professional sophistication while keeping you warm. The white shirt creates a clean base, the blazer adds structure and warmth, creating a polished winter work look.',
      recommendationSource: 'ai',
      userFeedback: {
        liked: true,
        rating: 5,
        worn: true,
        comments: 'Perfect for my client meeting!',
        feedbackDate: new Date('2024-02-02T18:00:00Z')
      },
      metadata: {
        generationTime: 2340,
        modelVersion: 'v1.2.0',
        algorithm: 'style_compatibility_v2'
      }
    },
    {
      occasion: 'casual',
      season: 'spring',
      weatherContext: {
        temperature: 68,
        humidity: 55,
        conditions: 'sunny',
        windSpeed: 5,
        location: 'New York, NY'
      },
      compatibilityScore: 0.87,
      aiReasoning: 'A relaxed yet put-together casual look perfect for spring weather. The jeans provide comfort while the white shirt keeps the look polished.',
      recommendationSource: 'ai',
      metadata: {
        generationTime: 1890,
        modelVersion: 'v1.2.0',
        algorithm: 'casual_comfort_v1'
      }
    }
  ] as OutfitRecommendationData[]
};

async function seedDatabase(): Promise<void> {
  try {
    // Connect to database
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Wardrobe.deleteMany({});
    await ClothingItem.deleteMany({});
    await ChatSession.deleteMany({});
    await Outfit.deleteMany({});
    await OutfitRecommendation.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create demo user
    const user = await User.create(sampleData.users[0]);
    console.log('👤 Created demo user');

    // Create wardrobes
    const wardrobes: any[] = [];
    for (const wardrobeData of sampleData.wardrobes) {
      const wardrobe = await Wardrobe.create({
        ...wardrobeData,
        userId: user._id
      });
      wardrobes.push(wardrobe);
    }
    console.log('👗 Created wardrobes');

    // Create clothing items
    const clothingItems: any[] = [];
    for (const itemData of sampleData.clothingItems) {
      const item = await ClothingItem.create({
        ...itemData,
        userId: user._id,
        wardrobeId: wardrobes[0]._id
      });
      clothingItems.push(item);
    }
    console.log('👔 Created clothing items');

    // Create chat sessions
    for (const sessionData of sampleData.chatSessions) {
      await ChatSession.create({
        ...sessionData,
        userId: user._id
      });
    }
    console.log('💬 Created chat sessions');

    // Create outfits
    const outfits: any[] = [];
    for (let i = 0; i < sampleData.outfits.length; i++) {
      const outfitData = sampleData.outfits[i];
      // For demo, use first 2-3 clothing items for each outfit
      const itemsForOutfit = clothingItems.slice(0, i === 0 ? 3 : 2);
      
      const outfit = await Outfit.create({
        ...outfitData,
        userId: user._id,
        items: itemsForOutfit.map(item => item._id)
      });
      outfits.push(outfit);
    }
    console.log('👕 Created outfits');

    // Create outfit recommendations
    for (let i = 0; i < sampleData.outfitRecommendations.length; i++) {
      const recommendationData = sampleData.outfitRecommendations[i];
      // Use different combinations of clothing items for recommendations
      const itemsForRecommendation = i === 0 
        ? [clothingItems[0]._id, clothingItems[2]._id] // White shirt + blazer
        : [clothingItems[0]._id, clothingItems[1]._id]; // White shirt + jeans
      
      await OutfitRecommendation.create({
        ...recommendationData,
        userId: user._id,
        items: itemsForRecommendation
      });
    }
    console.log('🎯 Created outfit recommendations');

    console.log('🎉 Database seeded successfully!');
    console.log('📧 Demo user credentials:');
    console.log('   Email: demo@fashionai.com');
    console.log('   Username: fashionista');
    console.log('   Firebase UID: demo-firebase-uid-12345678');
    console.log('📊 Created data:');
    console.log('   👤 1 User');
    console.log('   👗 2 Wardrobes');
    console.log('   👔 3 Clothing Items');
    console.log('   💬 2 Chat Sessions');
    console.log('   👕 2 Outfits');
    console.log('   🎯 2 Outfit Recommendations');

  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
}

// Run seeder if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase;
