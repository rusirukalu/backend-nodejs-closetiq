// setup-database.js - Database Setup Script
const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function setupDatabase() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');
    
    const db = client.db('fashion-ai');
    
    // Create collections with indexes
    const collections = [
      {
        name: 'users',
        indexes: [
          { key: { email: 1 }, unique: true },
          { key: { username: 1 }, unique: true },
          { key: { firebaseUID: 1 }, unique: true, sparse: true }
        ]
      },
      {
        name: 'wardrobes',
        indexes: [
          { key: { userId: 1 } },
          { key: { userId: 1, isDefault: 1 } }
        ]
      },
      {
        name: 'clothingitems',
        indexes: [
          { key: { userId: 1 } },
          { key: { wardrobeId: 1 } },
          { key: { category: 1 } },
          { key: { userId: 1, category: 1 } },
          { key: { tags: 1 } }
        ]
      },
      {
        name: 'outfits',
        indexes: [
          { key: { userId: 1 } },
          { key: { occasion: 1 } },
          { key: { userId: 1, occasion: 1 } },
          { key: { isPublic: 1 } }
        ]
      },
      {
        name: 'chatsessions',
        indexes: [
          { key: { userId: 1 } },
          { key: { userId: 1, lastMessageAt: -1 } },
          { key: { sessionType: 1 } }
        ]
      }
    ];

    for (const collection of collections) {
      // Create collection
      await db.createCollection(collection.name);
      console.log(`📁 Created collection: ${collection.name}`);
      
      // Create indexes
      for (const index of collection.indexes) {
        await db.collection(collection.name).createIndex(index.key, {
          unique: index.unique || false,
          sparse: index.sparse || false
        });
        console.log(`🔍 Created index on ${collection.name}:`, Object.keys(index.key));
      }
    }

    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup error:', error);
  } finally {
    await client.close();
  }
}

// Run setup
setupDatabase();
