// src/config/database.ts - FIXED VERSION
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MongoDB URI not found in environment variables');
    }

    // Updated Mongoose connection options (removed deprecated options)
    const options = {
      dbName: 'fashion-ai',
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      // REMOVED: bufferMaxEntries: 0, // This option is deprecated/not supported
      // REMOVED: bufferCommands: false, // This is now handled differently
    };

    console.log('🔄 Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(mongoURI, options);

    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🏪 Collections: ${Object.keys(conn.connection.collections).length}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

    // Graceful application termination
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed due to application termination');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during graceful shutdown:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('❌ MongoDB Atlas connection error:', error);
    process.exit(1);
  }
};

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    if (!mongoose.connection.db) {
      throw new Error('Database connection is not established');
    }
    await mongoose.connection.db.admin().ping();
    console.log('🏓 Database ping successful');
    return true;
  } catch (error) {
    console.error('❌ Database ping failed:', error);
    return false;
  }
};

// Get database statistics
export const getDatabaseStats = async (): Promise<any> => {
  try {
    if (!mongoose.connection.db) {
      throw new Error('Database connection is not established');
    }
    const stats = await mongoose.connection.db.stats();
    return {
      database: stats.db,
      collections: stats.collections,
      documents: stats.objects,
      dataSize: `${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`,
      storageSize: `${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`,
      indexes: stats.indexes
    };
  } catch (error) {
    console.error('❌ Error getting database stats:', error);
    return null;
  }
};

export default connectDB;
export { connectDB as connectDatabase };